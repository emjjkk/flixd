import 'dotenv/config'; // <-- ensures .env is loaded automatically

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function fetchGenres(type: 'movie' | 'tv') {
  const res = await fetch(`${TMDB_BASE}/genre/${type}/list?api_key=${TMDB_API_KEY}&language=en-US`);
  if (!res.ok) throw new Error(`Failed to fetch ${type} genres`);
  return (await res.json()).genres;
}

async function syncGenres() {
  console.log('🔄 Fetching genres...');
  const [movieGenres, tvGenres] = await Promise.all([
    fetchGenres('movie'),
    fetchGenres('tv'),
  ]);

  // Merge and dedupe genres by ID
  const allGenres = new Map();
  [...movieGenres, ...tvGenres].forEach((g) => allGenres.set(g.id, g));

  const genres = Array.from(allGenres.values());

  console.log(`📀 Found ${genres.length} unique genres`);
  console.log('⬆️ Upserting into Supabase...');

  const { error } = await supabase.from('genres').upsert(genres);
  if (error) throw error;

  console.log('✅ Genres synced successfully!');
}

syncGenres().catch((err) => {
  console.error('❌ Error syncing genres:', err);
  process.exit(1);
});
