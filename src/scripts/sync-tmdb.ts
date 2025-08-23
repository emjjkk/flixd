import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function fetchAllPages(endpoint: string) {
  let page = 1;
  let results: any[] = [];
  let totalPages = 1;

  do {
    const res = await fetch(`${TMDB_BASE}/${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`);
    const data = await res.json();
    results = results.concat(data.results || []);
    totalPages = data.total_pages || 1;
    page++;
  } while (page <= totalPages && page <= 1000);

  return results;
}

async function fetchStreamingServices(id: number, type: 'movie' | 'tv') {
  const url = `${TMDB_BASE}/${type}/${id}/watch/providers?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const providers = data.results?.US || data.results?.GB || data.results?.RW || {};
  return providers.flatrate || providers.ads || providers.free || [];
}

async function fetchTrailerUrl(id: number, type: 'movie' | 'tv') {
  const url = `${TMDB_BASE}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const trailer = (data.results || []).find(
    (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube'
  );
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

async function syncMovies() {
  console.log('Syncing movies...');
  const movies = await fetchAllPages('movie/popular');

  for (const movie of movies) {
    const streamingServices = await fetchStreamingServices(movie.id, 'movie');
    const trailerUrl = await fetchTrailerUrl(movie.id, 'movie');

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
      genre_ids: movie.genre_ids,
      original_language: movie.original_language,
      adult: movie.adult,
      video: movie.video,
      streaming_services: streamingServices,
      trailer_url: trailerUrl,
      updated_at: new Date().toISOString()
    });
  }

  console.log(`Synced ${movies.length} movies`);
}

async function syncTVShows() {
  console.log('Syncing TV shows...');
  const shows = await fetchAllPages('tv/popular');

  for (const show of shows) {
    const streamingServices = await fetchStreamingServices(show.id, 'tv');
    const trailerUrl = await fetchTrailerUrl(show.id, 'tv');

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
      genre_ids: show.genre_ids,
      original_language: show.original_language,
      streaming_services: streamingServices,
      trailer_url: trailerUrl,
      updated_at: new Date().toISOString()
    });
  }

  console.log(`Synced ${shows.length} TV shows`);
}

export async function syncTMDB() {
  await syncMovies();
  await syncTVShows();
  console.log('✅ TMDB sync completed with trailers & streaming services!');
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncTMDB().catch(console.error);
}
