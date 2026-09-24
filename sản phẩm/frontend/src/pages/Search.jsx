import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  Play,
  Music2,
  Disc3,
  User,
  Sparkles,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const genres = [
  {
    name: "Pop",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Rock",
    color: "from-red-500 to-orange-500",
  },
  {
    name: "Hip-Hop",
    color: "from-purple-500 to-indigo-500",
  },
  {
    name: "R&B",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    name: "Electronic",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Jazz",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Classical",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Lo-Fi",
    color: "from-sky-500 to-purple-500",
  },
];

const quickPicks = [
  {
    id: 1,
    title: "Midnight Drive",
    artist: "The Weekenders",
    genre: "Pop",
  },
  {
    id: 2,
    title: "Lost in Tokyo",
    artist: "Neon Dreams",
    genre: "Electronic",
  },
  {
    id: 3,
    title: "Golden Hour",
    artist: "Luna",
    genre: "R&B",
  },
  {
    id: 4,
    title: "Afterglow",
    artist: "Nova",
    genre: "Lo-Fi",
  },
  {
    id: 5,
    title: "City Lights",
    artist: "The Echoes",
    genre: "Rock",
  },
  {
    id: 6,
    title: "Late Night",
    artist: "Milo",
    genre: "Hip-Hop",
  },
];

export default function Search() {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("All");

  const [activeCategory, setActiveCategory] =
    useState("All");

  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/music/all`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load music"
        );
      }

      setSongs(data.music || []);
    } catch (err) {
      console.error("Failed to load search music:", err);

      setError(
        err.message || "Failed to load music"
      );
    } finally {
      setLoading(false);
    }
  }

  const albums = useMemo(() => {
    const albumMap = new Map();

    songs.forEach((song) => {
      if (!song.albumId) return;

      const albumId = String(song.albumId);

      if (!albumMap.has(albumId)) {
        albumMap.set(albumId, {
          id: albumId,
          title: song.album || "Unknown Album",
          artist: song.artist || "Unknown Artist",
          imageId: song.imageId || null,
          songs: [],
        });
      }

      albumMap.get(albumId).songs.push(song);
    });

    return Array.from(albumMap.values());
  }, [songs]);

  const artists = useMemo(() => {
    const artistMap = new Map();

    songs.forEach((song) => {
      if (!song.artist) return;

      const name = song.artist.trim();

      if (!name) return;

      if (!artistMap.has(name)) {
        artistMap.set(name, {
          name,
          songs: [],
        });
      }

      artistMap.get(name).songs.push(song);
    });

    return Array.from(artistMap.values());
  }, [songs]);

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    let result = [...songs];

    if (normalizedQuery) {
      result = result.filter((song) => {
        const title =
          song.title?.toLowerCase() || "";

        const artist =
          song.artist?.toLowerCase() || "";

        const album =
          song.album?.toLowerCase() || "";

        const genre =
          song.genre?.toLowerCase() || "";

        if (searchBy === "Song") {
          return title.includes(normalizedQuery);
        }

        if (searchBy === "Artist") {
          return artist.includes(normalizedQuery);
        }

        if (searchBy === "Album") {
          return album.includes(normalizedQuery);
        }

        if (searchBy === "Genre") {
          return genre.includes(normalizedQuery);
        }

        return (
          title.includes(normalizedQuery) ||
          artist.includes(normalizedQuery) ||
          album.includes(normalizedQuery) ||
          genre.includes(normalizedQuery)
        );
      });
    }

    return result;
  }, [songs, query, searchBy]);

  const filteredAlbums = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      return albums;
    }

    return albums.filter((album) => {
      const title =
        album.title?.toLowerCase() || "";

      const artist =
        album.artist?.toLowerCase() || "";

      return (
        title.includes(normalizedQuery) ||
        artist.includes(normalizedQuery)
      );
    });
  }, [albums, query]);

  const filteredArtists = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      return artists;
    }

    return artists.filter((artist) =>
      artist.name
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [artists, query]);

  function handleSearchChange(value) {
    setQuery(value);

    if (!value.trim()) {
      setActiveCategory("All");
    }
  }

  function selectGenre(genre) {
    setQuery(genre);
    setSearchBy("Genre");
    setActiveCategory("Songs");
  }

  function handleSongClick(song) {
    if (!song?._id) return;

    setPlayingId(song._id);

    navigate(`/song/${song._id}`);
  }

  function handleAlbumClick(album) {
    if (!album?.id) return;

    navigate(`/album/${album.id}`);
  }

  function handleArtistClick(artist) {
    navigate(
      `/artist/${encodeURIComponent(artist.name)}`
    );
  }

  function getSongImage(song) {
    if (!song?._id || !song?.imageId) {
      return null;
    }

    return `${API_URL}/api/music/${song._id}/image`;
  }

  function getAlbumImage(album) {
    if (!album?.id) {
      return null;
    }

    const songWithImage = album.songs?.find(
      (song) => song.imageId
    );

    if (!songWithImage) {
      return null;
    }

    return `${API_URL}/api/music/${songWithImage._id}/image`;
  }

  function formatDuration(seconds) {
    if (
      seconds === null ||
      seconds === undefined ||
      !Number.isFinite(Number(seconds))
    ) {
      return "--:--";
    }

    const totalSeconds = Math.floor(
      Number(seconds)
    );

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const remainingSeconds =
      totalSeconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  const hasSearch =
    query.trim().length > 0;

  const showSongs =
    activeCategory === "All" ||
    activeCategory === "Songs";

  const showAlbums =
    activeCategory === "All" ||
    activeCategory === "Albums";

  const showArtists =
    activeCategory === "All" ||
    activeCategory === "Artists";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">
            Search
          </h1>

          <p className="text-slate-400">
            Find songs, albums, artists, and genres.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex h-14 items-center rounded-2xl border border-slate-700 bg-slate-900 px-4 shadow-lg">
            <SearchIcon
              size={22}
              className="mr-3 text-slate-400"
            />

            <input
              type="text"
              value={query}
              onChange={(e) =>
                handleSearchChange(
                  e.target.value
                )
              }
              placeholder="What do you want to listen to?"
              className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchBy("All");
                  setActiveCategory("All");
                }}
                className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>


        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

            <p className="text-slate-400">
              Loading music...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mb-8 rounded-2xl border border-red-900 bg-red-950/40 p-5">
            <p className="mb-2 font-semibold text-red-300">
              Could not load music
            </p>

            <p className="mb-4 text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchSongs}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {!hasSearch && (
              <section className="mb-12">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles
                    size={21}
                    className="text-yellow-400"
                  />

                  <h2 className="text-2xl font-bold">
                    Quick Picks
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {quickPicks.map((song) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => {
                        setQuery(song.title);
                        setSearchBy("Song");
                        setActiveCategory("Songs");
                      }}
                      className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-left transition hover:border-slate-700 hover:bg-slate-800"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900">
                        <Music2
                          size={23}
                          className="text-slate-300"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">
                          {song.title}
                        </p>

                        <p className="truncate text-sm text-slate-400">
                          {song.artist}
                        </p>

                        <span className="text-xs text-slate-500">
                          {song.genre}
                        </span>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 opacity-0 transition group-hover:opacity-100">
                        <Play
                          size={16}
                          fill="currentColor"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {!hasSearch && (
              <section className="mb-12">
                <h2 className="mb-5 text-2xl font-bold">
                  Browse by Genre
                </h2>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
                  {genres.map((genre) => (
                    <button
                      key={genre.name}
                      type="button"
                      onClick={() =>
                        selectGenre(
                          genre.name
                        )
                      }
                      className={`h-28 overflow-hidden rounded-2xl bg-gradient-to-br ${genre.color} p-4 text-left transition hover:-translate-y-1 hover:scale-[1.02]`}
                    >
                      <span className="font-bold">
                        {genre.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {hasSearch && (
              <>
                <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
                  {[
                    "All",
                    "Songs",
                    "Albums",
                    "Artists",
                  ].map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setActiveCategory(
                          category
                        )
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        activeCategory ===
                        category
                          ? "bg-white text-slate-950"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {showSongs && (
                  <section className="mb-12">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-2xl font-bold">
                        Songs
                      </h2>

                      <span className="text-sm text-slate-500">
                        {filteredSongs.length}{" "}
                        result
                        {filteredSongs.length !==
                        1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    {filteredSongs.length ===
                    0 ? (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                        <Music2
                          size={32}
                          className="mx-auto mb-3 text-slate-600"
                        />

                        <p className="font-medium">
                          No songs found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Try another search.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                        {filteredSongs.map(
                          (song, index) => {
                            const imageUrl =
                              getSongImage(
                                song
                              );

                            return (
                              <button
                                key={song._id}
                                type="button"
                                onClick={() =>
                                  handleSongClick(
                                    song
                                  )
                                }
                                className="group flex w-full items-center gap-4 border-b border-slate-800 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-800"
                              >
                                <span className="w-7 text-center text-sm text-slate-500">
                                  {index + 1}
                                </span>

                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                                  {imageUrl ? (
                                    <img
                                      src={
                                        imageUrl
                                      }
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Music2
                                        size={
                                          20
                                        }
                                        className="text-slate-500"
                                      />
                                    </div>
                                  )}

                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                                    <Play
                                      size={
                                        18
                                      }
                                      fill="white"
                                    />
                                  </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold text-white">
                                    {
                                      song.title
                                    }
                                  </p>

                                  <p className="truncate text-sm text-slate-400">
                                    {
                                      song.artist
                                    }
                                  </p>
                                </div>

                                <div className="hidden w-32 truncate text-sm text-slate-500 md:block">
                                  {
                                    song.album ||
                                    "Single"
                                  }
                                </div>

                                <div className="hidden w-24 text-sm text-slate-500 sm:block">
                                  {
                                    song.genre ||
                                    "Other"
                                  }
                                </div>

                                <span className="w-14 text-right text-sm text-slate-500">
                                  {formatDuration(
                                    song.duration
                                  )}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}
                  </section>
                )}

                {showAlbums && (
                  <section className="mb-12">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-2xl font-bold">
                        Albums
                      </h2>

                      <span className="text-sm text-slate-500">
                        {
                          filteredAlbums.length
                        }{" "}
                        result
                        {filteredAlbums.length !==
                        1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    {filteredAlbums.length ===
                    0 ? (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                        <Disc3
                          size={32}
                          className="mx-auto mb-3 text-slate-600"
                        />

                        <p className="font-medium">
                          No albums found
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredAlbums.map(
                          (album) => {
                            const imageUrl =
                              getAlbumImage(
                                album
                              );

                            return (
                              <button
                                key={album.id}
                                type="button"
                                onClick={() =>
                                  handleAlbumClick(
                                    album
                                  )
                                }
                                className="group rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:-translate-y-1 hover:bg-slate-800"
                              >
                                <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-slate-800">
                                  {imageUrl ? (
                                    <img
                                      src={
                                        imageUrl
                                      }
                                      alt={
                                        album.title
                                      }
                                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Disc3
                                        size={
                                          55
                                        }
                                        className="text-slate-600"
                                      />
                                    </div>
                                  )}

                                  <div className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-white text-slate-950 opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100">
                                    <Play
                                      size={
                                        19
                                      }
                                      fill="currentColor"
                                    />
                                  </div>
                                </div>

                                <p className="truncate font-bold text-white">
                                  {
                                    album.title
                                  }
                                </p>

                                <p className="mt-1 truncate text-sm text-slate-400">
                                  {
                                    album.artist
                                  }
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                  {
                                    album.songs
                                      ?.length ||
                                    0
                                  }{" "}
                                  songs
                                </p>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}
                  </section>
                )}

                {showArtists && (
                  <section className="mb-12">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-2xl font-bold">
                        Artists
                      </h2>

                      <span className="text-sm text-slate-500">
                        {
                          filteredArtists.length
                        }{" "}
                        result
                        {filteredArtists.length !==
                        1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    {filteredArtists.length ===
                    0 ? (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                        <User
                          size={32}
                          className="mx-auto mb-3 text-slate-600"
                        />

                        <p className="font-medium">
                          No artists found
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredArtists.map(
                          (artist) => {
                            const firstSong =
                              artist.songs?.[0];

                            const imageUrl =
                              firstSong
                                ? getSongImage(
                                    firstSong
                                  )
                                : null;

                            return (
                              <button
                                key={artist.name}
                                type="button"
                                onClick={() =>
                                  handleArtistClick(
                                    artist
                                  )
                                }
                                className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:-translate-y-1 hover:bg-slate-800"
                              >
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-800">
                                  {imageUrl ? (
                                    <img
                                      src={
                                        imageUrl
                                      }
                                      alt={
                                        artist.name
                                      }
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <User
                                        size={
                                          28
                                        }
                                        className="text-slate-500"
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-bold text-white">
                                    {
                                      artist.name
                                    }
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {
                                      artist.songs
                                        ?.length ||
                                      0
                                    }{" "}
                                    song
                                    {artist.songs
                                      ?.length !==
                                    1
                                      ? "s"
                                      : ""}
                                  </p>
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}