import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Compass,
  Play,
  Pause,
  Music2,
  Shuffle,
  Disc3,
  User,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const GENRES = [
  {
    name: "Pop",
    description: "Catchy melodies and modern pop hits",
    gradient: "from-pink-500/80 via-rose-500/70 to-orange-400/80",
  },
  {
    name: "Rock",
    description: "Guitars, drums, and powerful energy",
    gradient: "from-red-600/90 via-red-500/70 to-orange-500/80",
  },
  {
    name: "Hip-Hop",
    description: "Beats, bars, and rhythm",
    gradient: "from-violet-600/90 via-purple-500/70 to-fuchsia-500/80",
  },
  {
    name: "R&B",
    description: "Smooth vocals and soulful grooves",
    gradient: "from-indigo-600/90 via-blue-500/70 to-cyan-400/80",
  },
  {
    name: "Electronic",
    description: "Electronic beats and atmospheric sounds",
    gradient: "from-cyan-500/90 via-teal-500/70 to-emerald-400/80",
  },
  {
    name: "Jazz",
    description: "Improvisation, swing, and timeless sounds",
    gradient: "from-amber-500/90 via-yellow-500/70 to-orange-400/80",
  },
  {
    name: "Classical",
    description: "Orchestral and timeless compositions",
    gradient: "from-slate-500/90 via-slate-400/70 to-stone-300/80",
  },
  {
    name: "Lo-fi",
    description: "Relaxed beats for focus and chill",
    gradient: "from-purple-500/90 via-violet-400/70 to-pink-400/80",
  },
  {
    name: "Country",
    description: "Stories, guitars, and country roots",
    gradient: "from-orange-600/90 via-amber-500/70 to-yellow-400/80",
  },
  {
    name: "Metal",
    description: "Heavy riffs and intense energy",
    gradient: "from-zinc-700/90 via-slate-600/80 to-gray-500/80",
  },
  {
    name: "Indie",
    description: "Independent sounds and fresh artists",
    gradient: "from-emerald-500/90 via-green-500/70 to-lime-400/80",
  },
  {
    name: "Other",
    description: "Discover something unexpected",
    gradient: "from-blue-600/90 via-indigo-500/70 to-purple-500/80",
  },
];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedGenre = searchParams.get("genre") || "";

  const [allMusic, setAllMusic] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef(null);

  useEffect(() => {
    async function loadMusic() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/music/all`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load music");
        }

        setAllMusic(data.music || []);
      } catch (error) {
        console.error("Failed to load Explore music:", error);
        setAllMusic([]);
      } finally {
        setLoading(false);
      }
    }

    loadMusic();
  }, []);

  useEffect(() => {
    const audio = new Audio();

    audioRef.current = audio;
    audio.volume = 1;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      setCurrentIndex((previousIndex) => {
        const nextIndex = previousIndex + 1;

        if (nextIndex < genreSongsRef.current.length) {
          const nextSong = genreSongsRef.current[nextIndex];

          setTimeout(() => {
            playSongFromList(nextSong, nextIndex);
          }, 0);

          return nextIndex;
        }

        return previousIndex;
      });
    };

    const handleError = (event) => {
      console.error("Audio playback error:", event);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.src = "";

      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const normalizedSelectedGenre = selectedGenre.toLowerCase();

  const genreSongs = useMemo(() => {
    if (!selectedGenre) {
      return [];
    }

    return allMusic.filter(
      (song) =>
        (song.genre?.trim() || "Other").toLowerCase() ===
        normalizedSelectedGenre
    );
  }, [allMusic, selectedGenre, normalizedSelectedGenre]);

  const genreSongsRef = useRef([]);

  useEffect(() => {
    genreSongsRef.current = genreSongs;
  }, [genreSongs]);

  function getSongImage(song) {
    if (!song?._id) return null;

    if (song.albumId) {
      return `${API_URL}/api/albums/${song.albumId}/cover`;
    }

    if (song.imageId) {
      return `${API_URL}/api/music/${song._id}/image`;
    }

    return null;
  }

  function getAudioUrl(song) {
    if (!song?._id) return "";

    return `${API_URL}/api/music/${song._id}/stream`;
  }

  async function playSongFromList(song, index) {
    if (!song?._id || !audioRef.current) return;

    const audio = audioRef.current;

    try {
      if (currentSong?._id === song._id) {
        if (audio.paused) {
          await audio.play();
        } else {
          audio.pause();
        }

        return;
      }

      audio.pause();

      audio.src = getAudioUrl(song);
      audio.volume = volume;
      audio.currentTime = 0;

      setCurrentSong(song);
      setCurrentIndex(index);
      setCurrentTime(0);
      setDuration(0);

      await audio.play();
    } catch (error) {
      console.error("Failed to play song:", error);
      setIsPlaying(false);
    }
  }

  function playSong(song, index) {
    playSongFromList(song, index);
  }

  async function togglePlay() {
    if (!audioRef.current || !currentSong) return;

    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } catch (error) {
      console.error("Failed to toggle playback:", error);
    }
  }

  async function playPrevious() {
    if (!genreSongs.length) return;

    let previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      previousIndex = genreSongs.length - 1;
    }

    await playSongFromList(
      genreSongs[previousIndex],
      previousIndex
    );
  }

  async function playNext() {
    if (!genreSongs.length) return;

    let nextIndex = currentIndex + 1;

    if (nextIndex >= genreSongs.length) {
      nextIndex = 0;
    }

    await playSongFromList(
      genreSongs[nextIndex],
      nextIndex
    );
  }

  function handleSeek(event) {
    const value = Number(event.target.value);

    if (!audioRef.current) return;

    audioRef.current.currentTime = value;
    setCurrentTime(value);
  }

  function handleVolumeChange(event) {
    const value = Number(event.target.value);

    setVolume(value);

    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  }

  function toggleMute() {
    if (!audioRef.current) return;

    if (audioRef.current.volume > 0) {
      audioRef.current.volume = 0;
      setVolume(0);
    } else {
      audioRef.current.volume = 1;
      setVolume(1);
    }
  }

  async function shuffleGenre() {
    if (!genreSongs.length) return;

    const randomIndex = Math.floor(
      Math.random() * genreSongs.length
    );

    await playSongFromList(
      genreSongs[randomIndex],
      randomIndex
    );
  }

  function selectGenre(genre) {
    setSearchParams({
      genre,
    });

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentSong(null);
    setCurrentIndex(-1);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }

  function clearGenre() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setSearchParams({});

    setCurrentSong(null);
    setCurrentIndex(-1);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }

  function handleSongClick(song) {
    if (!song?._id) return;

    navigate(`/song/${song._id}`);
  }

  function handleArtistClick(artist) {
    if (!artist) return;

    navigate(`/artist/${encodeURIComponent(artist)}`);
  }

  function handleAlbumClick(song) {
    if (!song?.albumId) return;

    navigate(`/album/${song.albumId}`);
  }

  function closePlayer() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }

    setCurrentSong(null);
    setCurrentIndex(-1);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }

  const displayGenre =
    GENRES.find(
      (genre) =>
        genre.name.toLowerCase() === normalizedSelectedGenre
    )?.name || selectedGenre;

  const selectedGenreInfo = GENRES.find(
    (genre) =>
      genre.name.toLowerCase() === normalizedSelectedGenre
  );

  const progress =
    duration > 0
      ? Math.min((currentTime / duration) * 100, 100)
      : 0;

  return (
    <div
      className={`min-h-screen bg-slate-950 px-8 py-8 text-white ${
        currentSong ? "pb-36" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15">
            <Compass className="h-6 w-6 text-emerald-400" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Discover
            </p>

            <h1 className="mt-1 text-4xl font-bold tracking-tight">
              Explore
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-slate-400">
          Explore music by genre and discover new songs from the
          Soundly community.
        </p>

        {!selectedGenre && (
          <section className="mt-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                Browse by Genre
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Find music that matches your mood.
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-500">
                Loading music...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {GENRES.map((genre) => {
                  const count = allMusic.filter(
                    (song) =>
                      (song.genre?.trim() || "Other").toLowerCase() ===
                      genre.name.toLowerCase()
                  ).length;

                  return (
                    <button
                      key={genre.name}
                      type="button"
                      onClick={() => selectGenre(genre.name)}
                      className={`group relative min-h-[190px] overflow-hidden rounded-2xl bg-gradient-to-br ${genre.gradient} p-6 text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl`}
                    >
                      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition duration-500 group-hover:scale-125" />

                      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/10 transition duration-500 group-hover:scale-125" />

                      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                        <Music2 className="h-5 w-5 text-white" />
                      </div>

                      <div className="relative mt-6">
                        <h3 className="text-2xl font-bold text-white">
                          {genre.name}
                        </h3>

                        <p className="mt-1 max-w-[190px] text-sm leading-5 text-white/80">
                          {genre.description}
                        </p>

                        <div className="mt-4 text-xs font-semibold text-white/70">
                          {count}{" "}
                          {count === 1 ? "song" : "songs"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {selectedGenre && (
          <section className="mt-10">
            <div
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${
                selectedGenreInfo?.gradient ||
                "from-slate-700 to-slate-900"
              } p-8`}
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

              <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-black/10" />

              <div className="relative">
                <button
                  type="button"
                  onClick={clearGenre}
                  className="mb-8 text-sm font-medium text-white/70 transition hover:text-white"
                >
                  ← All genres
                </button>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Genre
                </p>

                <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-5xl font-bold">
                      {displayGenre}
                    </h2>

                    <p className="mt-3 text-white/75">
                      {genreSongs.length}{" "}
                      {genreSongs.length === 1
                        ? "song"
                        : "songs"}{" "}
                      to discover
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={shuffleGenre}
                    disabled={!genreSongs.length}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Shuffle className="h-5 w-5" />
                    Shuffle {displayGenre}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-500">
                  Loading songs...
                </div>
              ) : genreSongs.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
                  <Music2 className="mx-auto h-10 w-10 text-slate-700" />

                  <h3 className="mt-4 text-lg font-semibold">
                    No music found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    There aren't any songs in this genre yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  {genreSongs.map((song, index) => {
                    const imageUrl = getSongImage(song);
                    const isCurrent =
                      currentSong?._id === song._id;

                    return (
                      <div
                        key={song._id}
                        className={`group flex items-center gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 transition ${
                          isCurrent
                            ? "bg-emerald-500/5"
                            : "hover:bg-slate-800/60"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            playSong(song, index)
                          }
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                            isCurrent && isPlaying
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-800 text-slate-300 hover:bg-emerald-500 hover:text-slate-950"
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="h-4 w-4 fill-current" />
                          ) : (
                            <Play className="ml-0.5 h-4 w-4 fill-current" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSongClick(song)
                          }
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-800"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={song.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Music2 className="h-5 w-5 text-slate-600" />
                            </div>
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleSongClick(song)
                            }
                            className={`block max-w-full truncate text-left font-semibold transition ${
                              isCurrent
                                ? "text-emerald-400"
                                : "text-white hover:text-emerald-400"
                            }`}
                          >
                            {song.title}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleArtistClick(song.artist)
                            }
                            className="mt-1 flex max-w-full items-center gap-1 truncate text-left text-sm text-slate-500 transition hover:text-emerald-400"
                          >
                            <User className="h-3.5 w-3.5 shrink-0" />

                            <span className="truncate">
                              {song.artist ||
                                "Unknown Artist"}
                            </span>
                          </button>
                        </div>

                        <div className="hidden w-48 items-center gap-2 lg:flex">
                          {song.albumId ? (
                            <>
                              <Disc3 className="h-4 w-4 shrink-0 text-slate-600" />

                              <button
                                type="button"
                                onClick={() =>
                                  handleAlbumClick(song)
                                }
                                className="truncate text-sm text-slate-500 transition hover:text-emerald-400"
                              >
                                {song.album || "Album"}
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-slate-600">
                              Single
                            </span>
                          )}
                        </div>

                        <div className="hidden w-24 text-right text-xs text-slate-600 sm:block">
                          {song.genre || "Other"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {currentSong && (
        <div className="fixed bottom-0 left-64 right-0 z-50 border-t border-slate-800 bg-slate-950/95 px-5 py-3 shadow-2xl backdrop-blur-xl">
          <div className="absolute left-0 right-0 top-0 h-1 bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-100"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="flex min-w-0 w-64 items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                {getSongImage(currentSong) ? (
                  <img
                    src={getSongImage(currentSong)}
                    alt={currentSong.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music2 className="h-5 w-5 text-slate-600" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    handleSongClick(currentSong)
                  }
                  className="block max-w-full truncate text-sm font-semibold text-white hover:text-emerald-400"
                >
                  {currentSong.title}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleArtistClick(currentSong.artist)
                  }
                  className="block max-w-full truncate text-xs text-slate-500 hover:text-emerald-400"
                >
                  {currentSong.artist ||
                    "Unknown Artist"}
                </button>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={playPrevious}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <SkipBack className="h-4 w-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 transition hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={playNext}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <SkipForward className="h-4 w-4 fill-current" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="w-10 text-right text-xs text-slate-500">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!duration}
                  className="h-1 w-full cursor-pointer accent-emerald-500 disabled:cursor-default"
                />

                <span className="w-10 text-xs text-slate-500">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="hidden items-center gap-2 xl:flex">
              <button
                type="button"
                onClick={toggleMute}
                className="text-slate-500 transition hover:text-white"
              >
                {volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 accent-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={closePlayer}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-white"
              title="Close player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}