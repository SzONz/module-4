import {
  ArrowLeft,
  Heart,
  Play,
  Pause,
  Volume2,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Radio,
  Music,
  AlertCircle,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AddToPlaylistButton from "./components/AddToPlaylistButton";

const API_URL = "http://localhost:5000";

export default function Song() {
  const { id } = useParams();
  const navigate = useNavigate();

  const audioRef = useRef(null);

  const [song, setSong] = useState(null);
  const [allSongs, setAllSongs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  function getImageUrl(song) {
    if (!song) return null;

    if (song.albumId) {
      return `${API_URL}/api/albums/${song.albumId}/cover`;
    }

    if (song.imageId) {
      return `${API_URL}/api/music/${song._id}/image`;
    }

    return null;
  }

  function getAudioUrl(song) {
    if (!song?._id) return null;

    return `${API_URL}/api/music/${song._id}/stream`;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  useEffect(() => {
    async function loadSong() {
      try {
        setLoading(true);
        setNotFound(false);

        console.log("Loading song ID:", id);

        const response = await fetch(
          `${API_URL}/api/music/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        console.log(
          "Song API status:",
          response.status
        );

        const data = await response.json();

        console.log("Song API response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load song"
          );
        }

        if (!data.music) {
          setSong(null);
          setNotFound(true);
          return;
        }

        setSong(data.music);
      } catch (error) {
        console.error("Failed to load song:", error);
        setSong(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSong();
    }
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    function handleTimeUpdate() {
      setCurrentTime(audio.currentTime);
    }

    function handleLoadedMetadata() {
      setDuration(audio.duration || 0);
    }

    function handlePlay() {
      setIsPlaying(true);
    }

    function handlePause() {
      setIsPlaying(false);
    }

    async function handleEnded() {
      if (repeat) {
        try {
          audio.currentTime = 0;
          await audio.play();
        } catch (error) {
          console.error("Repeat playback error:", error);
        }

        return;
      }

      playNext();
    }

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [repeat, currentIndex, shuffle, allSongs]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!song || !audioRef.current) return;

    const audio = audioRef.current;

    audio.pause();
    audio.src = getAudioUrl(song);
    audio.volume = volume;
    audio.load();

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    async function attemptAutoplay() {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log(
          "Autoplay blocked. User can press play."
        );
      }
    }

    attemptAutoplay();

    return () => {
      audio.pause();
    };
  }, [song]);

  async function togglePlay() {
    const audio = audioRef.current;

    if (!audio || !song) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Playback error:", error);
    }
  }

  async function playPrevious() {
    if (!allSongs.length) return;

    if (
      audioRef.current &&
      audioRef.current.currentTime > 3
    ) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    let previousIndex;

    if (shuffle) {
      previousIndex = Math.floor(
        Math.random() * allSongs.length
      );
    } else {
      previousIndex =
        currentIndex <= 0
          ? allSongs.length - 1
          : currentIndex - 1;
    }

    const previousSong = allSongs[previousIndex];

    if (!previousSong?._id) return;

    navigate(`/song/${previousSong._id}`);
  }

  function playNext() {
    if (!allSongs.length) return;

    let nextIndex;

    if (shuffle) {
      if (allSongs.length === 1) {
        nextIndex = 0;
      } else {
        do {
          nextIndex = Math.floor(
            Math.random() * allSongs.length
          );
        } while (nextIndex === currentIndex);
      }
    } else {
      nextIndex =
        currentIndex >= allSongs.length - 1 ||
        currentIndex === -1
          ? 0
          : currentIndex + 1;
    }

    const nextSong = allSongs[nextIndex];

    if (!nextSong?._id) return;

    navigate(`/song/${nextSong._id}`);
  }

  function handleSeek(event) {
    const audio = audioRef.current;

    if (!audio || !duration) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const clickPosition =
      (event.clientX - rect.left) / rect.width;

    const newTime = clickPosition * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0f17] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

            <p className="text-sm text-slate-400">
              Loading song...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !song) {
    return (
      <main className="min-h-screen bg-[#0b0f17] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[160px]" />
          <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-slate-800 bg-slate-900/70">
              <AlertCircle
                size={38}
                className="text-slate-500"
              />
            </div>

            <h1 className="text-2xl font-bold text-white">
              Song not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              This song may have been deleted or is no
              longer available on Soundly.
            </p>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:scale-105 hover:bg-emerald-300"
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const imageUrl = getImageUrl(song);

  return (
    <main className="min-h-screen bg-[#0b0f17] text-slate-100 antialiased">
      <audio
        ref={audioRef}
        preload="metadata"
      />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-10 blur-3xl"
          />
        )}

        <div className="absolute inset-0 bg-[#0b0f17]/90" />

        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[160px]" />

        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />
      </div>

      <div className="relative min-h-screen pb-32">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-800/50 bg-[#0b0f17]/70 px-6 backdrop-blur-xl md:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-400"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-[420px_1fr] md:gap-16">
            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="aspect-square overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-emerald-500 via-cyan-600 to-slate-950 shadow-2xl shadow-emerald-950/40">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${song.title} cover`}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Radio
                      size={90}
                      className="text-white/25"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={togglePlay}
                className="absolute bottom-5 right-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-2xl shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-300"
              >
                {isPlaying ? (
                  <Pause
                    size={26}
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={26}
                    fill="currentColor"
                    className="ml-1"
                  />
                )}
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Song
              </p>

              <h1 className="mt-4 break-words text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
                {song.title}
              </h1>

              <button
                type="button"
                onClick={() =>
                  navigate(`/artist/${encodeURIComponent(song.artist)}`)
                }
                className="mt-5 text-left text-xl font-medium text-slate-300 transition hover:text-emerald-400 hover:underline"
              >
                {song.artist}
              </button>

              {song.album && (
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Music size={14} />
                  {song.album}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {song.genre && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    {song.genre}
                  </span>
                )}

                {song.trackNumber && (
                  <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
                    Track {song.trackNumber}
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:scale-105 hover:bg-emerald-300"
                >
                  {isPlaying ? (
                    <>
                      <Pause
                        size={17}
                        fill="currentColor"
                      />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play
                        size={17}
                        fill="currentColor"
                      />
                      Play
                    </>
                  )}
                </button>

                <AddToPlaylistButton
                  songIds={[song._id]}
                  label="Add to playlist"
                />

                <button
                  type="button"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    isLiked
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <Heart
                    size={19}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">
                    Artist
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/artist/${encodeURIComponent(song.artist)}`)
                    }
                    className="mt-1 text-left text-sm font-semibold text-slate-200 transition hover:text-emerald-400 hover:underline"
                  >
                    {song.artist}
                  </button>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    File
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-200">
                    {song.fileName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Format
                  </p>
                  <p className="mt-1 text-sm font-semibold uppercase text-slate-200">
                    {song.mimeType
                      ?.split("/")
                      .pop() || "Audio"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="w-10 text-right text-xs text-slate-500">
                {formatTime(currentTime)}
              </span>

              <div
                onClick={handleSeek}
                className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-slate-800"
              >
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-400 to-cyan-400"
                  style={{
                    width:
                      duration > 0
                        ? `${Math.min(
                            (currentTime /
                              duration) *
                              100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>

              <span className="w-10 text-xs text-slate-500">
                {formatTime(duration)}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setShuffle(!shuffle)
                }
                className={`hidden sm:block ${
                  shuffle
                    ? "text-emerald-400"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <Shuffle size={18} />
              </button>

              <button
                type="button"
                onClick={playPrevious}
                className="text-slate-400 transition hover:text-white"
              >
                <SkipBack
                  size={20}
                  fill="currentColor"
                />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-lg transition hover:scale-105 hover:bg-emerald-300"
              >
                {isPlaying ? (
                  <Pause
                    size={20}
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={20}
                    fill="currentColor"
                    className="ml-0.5"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={playNext}
                className="text-slate-400 transition hover:text-white"
              >
                <SkipForward
                  size={20}
                  fill="currentColor"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setRepeat(!repeat)
                }
                className={`hidden sm:block ${
                  repeat
                    ? "text-emerald-400"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <Repeat size={18} />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Volume2
                size={16}
                className="text-slate-500"
              />

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) =>
                  setVolume(
                    Number(event.target.value)
                  )
                }
                className="h-1 w-24 cursor-pointer accent-emerald-400"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
