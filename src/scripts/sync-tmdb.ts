import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function fetchChangedIds(type: 'movie' | 'tv', startDate: string) {
  let page = 1;
  let results: any[] = [];
  let totalPages = 1;

  do {
    const res = await fetch(`${TMDB_BASE}/${type}/changes?api_key=${TMDB_API_KEY}&start_date=${startDate}&page=${page}`);
    const data = await res.json();
    results = results.concat(data.results || []);
    totalPages = data.total_pages || 1;
    page++;
  } while (page <= totalPages && page <= 1000);

  return results.map((r) => r.id);
}

async function fetchDetails(id: number, type: 'movie' | 'tv') {
  const url = `${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,watch/providers`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function syncMovies() {
  console.log('🔄 Checking movie updates...');

  // Get last sync time
  const { data: syncData } = await supabase.from('tmdb_sync').select('last_movie_sync').eq('id', 1).single();
  const lastSync = syncData?.last_movie_sync || '2000-01-01';

  // Fetch changed movie IDs
  const changedMovieIds = await fetchChangedIds('movie', lastSync);
  console.log(`📀 Found ${changedMovieIds.length} updated movies since ${lastSync}`);

  // Fetch details + upsert
  for (const id of changedMovieIds) {
    const movie = await fetchDetails(id, 'movie');
    if (!movie) continue;

    const providers = movie['watch/providers']?.results?.US || movie['watch/providers']?.results?.GB || movie['watch/providers']?.results?.RW || {};
    const streamingServices = providers.flatrate || providers.ads || providers.free || [];

    const trailer = (movie.videos?.results || []).find(
      (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube'
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

    await supabase.from('movies').upsert({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      popularity: movie.popularity,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: movie.genres?.map((g: any) => g.id) || [],
      original_language: movie.original_language,
      adult: movie.adult,
      video: movie.video,
      streaming_services: streamingServices,
      trailer_url: trailerUrl,
      updated_at: new Date().toISOString()
    });
  }

  // Update sync timestamp
  await supabase.from('tmdb_sync').update({
    last_movie_sync: new Date().toISOString()
  }).eq('id', 1);

  console.log('✅ Movies delta sync complete!');
}

async function syncTVShows() {
  console.log('🔄 Checking TV show updates...');

  const { data: syncData } = await supabase.from('tmdb_sync').select('last_tv_sync').eq('id', 1).single();
  const lastSync = syncData?.last_tv_sync || '2000-01-01';

  const changedShowIds = await fetchChangedIds('tv', lastSync);
  console.log(`📺 Found ${changedShowIds.length} updated TV shows since ${lastSync}`);

  for (const id of changedShowIds) {
    const show = await fetchDetails(id, 'tv');
    if (!show) continue;

    const providers = show['watch/providers']?.results?.US || show['watch/providers']?.results?.GB || show['watch/providers']?.results?.RW || {};
    const streamingServices = providers.flatrate || providers.ads || providers.free || [];

    const trailer = (show.videos?.results || []).find(
      (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube'
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

    await supabase.from('tvshows').upsert({
      id: show.id,
      name: show.name,
      overview: show.overview,
      first_air_date: show.first_air_date,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path,
      popularity: show.popularity,
      vote_average: show.vote_average,
      vote_count: show.vote_count,
      genre_ids: show.genres?.map((g: any) => g.id) || [],
      original_language: show.original_language,
      streaming_services: streamingServices,
      trailer_url: trailerUrl,
      updated_at: new Date().toISOString()
    });
  }

  await supabase.from('tmdb_sync').update({
    last_tv_sync: new Date().toISOString()
  }).eq('id', 1);

  console.log('✅ TV shows delta sync complete!');
}

export async function syncTMDB() {
  await syncMovies();
  await syncTVShows();
  console.log('🎉 Delta sync completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncTMDB().catch(console.error);
}
