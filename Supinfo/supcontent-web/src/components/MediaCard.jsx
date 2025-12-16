import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MediaCard({ media, className }) {
    const title = media.title || media.name;
    const date = media.release_date || media.first_air_date;
    const rating = media.vote_average ? media.vote_average.toFixed(1) : 'NR';
    const posterPath = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;

    return (
        <Link
            to={`/media/${media.media_type || (media.title ? 'movie' : 'tv')}/${media.id}`}
            className={cn("group relative block aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all", className)}
        >
            {posterPath ? (
                <img
                    src={posterPath}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 p-4 text-center">
                    No Poster
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold truncate">{title}</h3>
                <div className="flex items-center justify-between text-white/90 text-sm mt-1">
                    <span>{date ? new Date(date).getFullYear() : 'N/A'}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{rating}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
