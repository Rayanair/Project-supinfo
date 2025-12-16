import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import MediaCard from '../components/MediaCard';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q');
    const scope = searchParams.get('scope') || 'all';

    const [results, setResults] = useState({ media: [], users: [], lists: [] });
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({ type: '', year: '', genre: '', author: '' });
    const [genres, setGenres] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        // Fetch genres on mount
        const fetchGenres = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/search/genres`);
                setGenres(res.data);
            } catch (error) {
                console.error("Failed to fetch genres");
            }
        };
        fetchGenres();
    }, []);

    // Reset page when query, filters, or scope change
    useEffect(() => {
        setPage(1);
    }, [query, filters, scope]);

    useEffect(() => {
        if (query) {
            const fetchResults = async () => {
                setLoading(true);
                try {
                    // Use the aggregated search endpoint
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
                        params: { q: query, ...filters, page, scope }
                    });
                    setResults(res.data);
                    setTotalPages(res.data.total_pages || 1);
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setLoading(false);
                }
            };

            // Debounce for author typing or just fetch
            const timeoutId = setTimeout(() => fetchResults(), 500);
            return () => clearTimeout(timeoutId);
        }
    }, [query, filters, page, scope]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (scope !== 'media' || newPage <= totalPages + 1)) {
            setPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    if (!query) return <div className="text-center mt-10 text-muted-foreground">Entrez un terme pour commencer la recherche.</div>;

    const showAll = scope === 'all';

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {!showAll && (
                        <Button variant="ghost" size="sm" onClick={() => setSearchParams({ q: query, scope: 'all' })}>
                            ← Retour
                        </Button>
                    )}
                    <h1 className="text-2xl font-bold">
                        {showAll ? `Résultats pour "${query}"` :
                            scope === 'media' ? `Films & Séries pour "${query}"` :
                                scope === 'users' ? `Utilisateurs pour "${query}"` :
                                    `Listes pour "${query}"`}
                    </h1>
                </div>

                {/* Filters (Only show relevant filters based on scope) */}
                <div className="flex flex-wrap gap-2">
                    {(showAll || scope === 'media') && (
                        <>
                            <select
                                className="bg-background border rounded px-3 py-2 text-sm"
                                value={filters.type}
                                onChange={e => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">Tous types</option>
                                <option value="movie">Films</option>
                                <option value="tv">Séries</option>
                            </select>

                            <select
                                className="bg-background border rounded px-3 py-2 text-sm max-w-[150px]"
                                value={filters.genre}
                                onChange={e => setFilters({ ...filters, genre: e.target.value })}
                            >
                                <option value="">Tous genres</option>
                                {genres.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Année"
                                className="bg-background border rounded px-3 py-2 text-sm w-20"
                                value={filters.year}
                                onChange={e => setFilters({ ...filters, year: e.target.value })}
                            />

                            <input
                                type="text"
                                placeholder="Auteur / Réalisateur"
                                className="bg-background border rounded px-3 py-2 text-sm w-40"
                                value={filters.author}
                                onChange={e => setFilters({ ...filters, author: e.target.value })}
                            />
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
            ) : (
                <>
                    {/* Lists Section */}
                    {(showAll || scope === 'lists') && results.lists && results.lists.length > 0 && (
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Listes Publiques</h2>
                                {showAll && (
                                    <Button variant="link" onClick={() => setSearchParams({ q: query, scope: 'lists' })}>
                                        Voir plus
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.lists.map((list) => (
                                    <Link to={`/lists/${list.id}`} key={list.id} className="block">
                                        <div className="p-4 border rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-full">
                                            <h3 className="font-bold text-lg">{list.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Users Section */}
                    {(showAll || scope === 'users') && results.users && results.users.length > 0 && (
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Utilisateurs</h2>
                                {showAll && (
                                    <Button variant="link" onClick={() => setSearchParams({ q: query, scope: 'users' })}>
                                        Voir plus
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {results.users.map((user) => (
                                    <div key={user.id} className="p-4 border rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-medium truncate w-full text-center">{user.username}</div>
                                        <Button variant="link" size="sm" asChild className="mt-2">
                                            <a href={`/profile/${user.id}`}>Voir profil</a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Media Section */}
                    {(showAll || scope === 'media') && (
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Films & Séries</h2>
                                {showAll && results.media && results.media.length > 0 && (
                                    <Button variant="link" onClick={() => setSearchParams({ q: query, scope: 'media' })}>
                                        Voir plus
                                    </Button>
                                )}
                            </div>
                            {results.media && results.media.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {results.media.map((item) => (
                                        (item.media_type === 'movie' || item.media_type === 'tv') ? (
                                            <MediaCard key={item.id} media={item} />
                                        ) : null
                                    ))}
                                </div>
                            ) : (
                                !showAll && <div className="text-muted-foreground">Aucun média trouvé.</div>
                            )}
                        </section>
                    )}

                    {/* Pagination Controls - Only show in scoped view */}
                    {!showAll && (
                        <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >
                                Précédent
                            </Button>
                            <span className="text-sm font-medium">Page {page}</span>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={
                                    (scope === 'media' && page >= totalPages) ||
                                    (scope === 'users' && !results.has_more_users) ||
                                    (scope === 'lists' && !results.has_more_lists)
                                    // Fallback if flags missing
                                    || (scope !== 'media' && (!results.users?.length && !results.lists?.length))
                                }
                            >
                                Suivant
                            </Button>
                        </div>
                    )}

                    {/* Global Empty State */}
                    {showAll && !results.lists?.length && !results.users?.length && !results.media?.length && (
                        <div className="text-center p-10 text-muted-foreground">Aucun résultat trouvé pour "{query}".</div>
                    )}
                </>
            )}
        </div>
    );
}
