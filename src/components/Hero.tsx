import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus } from "lucide-react";

type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  backdrop_path: string;
  popularity: number;
  genre_ids: number[];
  streaming_services: string[];
  trailer_url: string;
  vote_average: number;
  type: "movie" | "tv";
};

type Genre = {
  id: number;
  name: string;
};

export default function Hero() {
  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_KEY
  );

  const [items, setItems] = useState<MediaItem[]>([]);
  const [genresMap, setGenresMap] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingContent = async () => {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const dateFilter = sixtyDaysAgo.toISOString().split("T")[0];

      const { data: genres } = await supabase.from("genres").select("id, name");
      if (genres) {
        setGenresMap(
          genres.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
          }, {} as Record<number, string>)
        );
      }

      const { data: movies } = await supabase
        .from("movies")
        .select("*")
        .gte("release_date", dateFilter)
        .gte("vote_average", 6)
        .gte("vote_count", 100)
        .order("popularity", { ascending: false })
        .limit(10);

      const { data: tvShows } = await supabase
        .from("tvshows")
        .select("*")
        .gte("first_air_date", dateFilter)
        .gte("vote_average", 6)
        .gte("vote_count", 100)
        .order("popularity", { ascending: false })
        .limit(10);

      const combinedItems: MediaItem[] = [
        ...(movies?.map((m) => ({ ...m, type: "movie" as const })) || []),
        ...(tvShows?.map((t) => ({ ...t, type: "tv" as const })) || []),
      ].sort((a, b) => b.popularity - a.popularity);

      setItems(combinedItems);
      setIsLoading(false);
    };

    fetchTrendingContent();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items]);

  if (isLoading || items.length === 0) {
    return (
      <div className="relative h-screen flex flex-col items-start justify-center gap-4 p-6 md:p-8 animate-pulse md:w-1/2">
        <div className="w-1/3 h-6 bg-neutral-700 rounded" />
        <div className="w-3/3 h-12 bg-neutral-700 rounded" />
        <div className="w-1/2 h-4 bg-neutral-700 rounded mt-2" />
        <div className="w-3/4 h-4 bg-neutral-700 rounded" />
        <div className="flex gap-4 mt-4">
          <div className="w-3/4 h-10 bg-neutral-700 rounded" />
          <div className="w-3/4 h-10 bg-neutral-700 rounded" />
        </div>
      </div>
    );
  }

  const activeItem = items[current];
  const title = activeItem.title || activeItem.name || "Unknown";
  const releaseYear = (activeItem.release_date || activeItem.first_air_date)?.split("-")[0];
  const genres =
    activeItem.genre_ids
      ?.slice(0, 3)
      .map((id) => genresMap[id])
      .filter(Boolean) || [];

  return (
    <div className="relative w-full md:h-[90dvh] h-[100dvh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={`https://image.tmdb.org/t/p/original${activeItem.backdrop_path}`}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 md:bg-gradient-to-tr bg-gradient-to- from-black via-black/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-end pb-20">
            <div className="container px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="md:w-1/2"
              >
                <span className="text-white text-xs font-semibold mb-2 uppercase block">
                  Trending {activeItem.type === "movie" ? "Movie" : "TV Show"}
                </span>

                <h1 className="text-2xl md:text-3xl text-white mt-2 leading-tight [background:linear-gradient(transparent_60%,_#fa00ff_60%)] w-fit">
                  {title}
                </h1>

                <div className="flex items-center gap-2 text-gray-300 mt-2">
                  {releaseYear && <span className="text-sm">{releaseYear}</span>}
                  {genres.length > 0 && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm">{genres.join(", ")}</span>
                    </>
                  )}
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm">{activeItem.vote_average.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-gray-200 text-md leading-relaxed mt-2 line-clamp-3">
                  {activeItem.overview}
                </p>

                <div className="flex gap-4 mt-4">
                  <button className="text-sm flex items-center gap-2 bg-white text-black px-4 py-3 rounded-sm font-semibold hover:bg-gray-200 transition-colors">
                    <Play className="w-5 h-5" fill="currentColor" />
                    Learn More
                  </button>
                  <button className="text-sm flex items-center gap-2 bg-gray-800/80 text-white px-4 py-3 rounded-sm font-semibold hover:bg-gray-700/80 transition-colors backdrop-blur-sm">
                    <Plus className="w-5 h-5" />
                    Add to Watchlist
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all ${index === current ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/60"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}

      </div>
    </div>
  );
}
