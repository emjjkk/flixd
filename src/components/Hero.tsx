"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

type Movie = {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    backdrop_path: string;
    popularity: number;
    genre_ids: number[];
    streaming_services: string[];
    trailer_url: string;
};

const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_KEY!
);

export default function Hero() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const fetchTrendingMovies = async () => {

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 200);

            const { data, error } = await supabase.from("movies").select("*")
                .gte('release_date', thirtyDaysAgo.toISOString().split('T')[0])
                .order('popularity', { ascending: false })
                .limit(10);

            if (error) {
                console.error("Supabase error:", error);
                return;
            }

            if (data) {
                console.log(data)
                setMovies(data);
            }
        };

        fetchTrendingMovies();
    }, []);

    // Auto-slide every 5 seconds
    useEffect(() => {
        if (movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % movies.length);
        }, 10000);
        return () => clearInterval(interval);
    }, [movies]);

    return (
        <section className="relative w-full h-[80dvh] overflow-hidden">
            <AnimatePresence mode="wait">
                {movies.length > 0 && (
                    <motion.div
                        key={movies[current].id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage: `url(https://image.tmdb.org/t/p/original${movies[current].backdrop_path})`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>

            {movies.length > 0 && (
                <div className="absolute bottom-15 left-15 z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold text-white mb-3">
                        {movies[current].title}{" "}
                        <span className="text-neutral-300">
                            ({new Date(movies[current].release_date).getFullYear()})
                        </span>
                    </h1>
                    <p className="text-sm text-neutral-300 mb-3">
                        {movies[current].genre_ids.join(", ") || "Unknown Genre"}
                    </p>
                    <p className="text-sm text-white/80 mb-5 line-clamp-3">
                        {movies[current].overview}
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="default"
                            size="default"
                            onClick={() =>
                                window.open(movies[current].trailer_url, "_blank")
                            }
                        >
                            Watch Trailer
                        </Button>
                        <Button variant="outline" size="default">
                            Add to Watchlist
                        </Button>
                    </div>
                </div>
            )}

            {/* Prev / Next Buttons */}
            {movies.length > 0 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-20">
                    {movies.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`h-2 w-2 rounded-full transition ${index === current ? "bg-white" : "bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
