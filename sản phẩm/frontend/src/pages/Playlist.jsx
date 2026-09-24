import {
    ArrowLeft,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Music2,
    Trash2,
    AlertCircle,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function Playlist() {
    const { id } = useParams();
    const navigate = useNavigate();

    const audioRef = useRef(null);

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [currentSong, setCurrentSong] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);

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
        async function loadPlaylist() {
        try {
            setLoading(true);
            setNotFound(false);

            const response = await fetch(
            `${API_URL}/api/playlists/${id}`,
            {
                method: "GET",
                credentials: "include",
            }
            );

            const data = await response.json();

            if (!response.ok) {
            throw new Error(
                data.message || "Failed to load playlist"
            );
            }

            if (!data.playlist) {
            setNotFound(true);
            return;
            }

            setPlaylist(data.playlist);
        } catch (error) {
            console.error(
            "Failed to load playlist:",
            error
            );

            setPlaylist(null);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
        }

        if (id) {
        loadPlaylist();
        }
    }, [id]);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        function handleTimeUpdate() {
        setCurrentTime(audio.currentTime);
        }

        function handleLoadedMetadata() {
        setDuration(
            Number.isFinite(audio.duration)
            ? audio.duration
            : 0
        );
        }

        function handlePlay() {
        setIsPlaying(true);
        }

        function handlePause() {
        setIsPlaying(false);
        }

        function handleEnded() {
        playNext();
        }

        function handleError() {
        console.error(
            "Audio playback error:",
            audio.error
        );

        setIsPlaying(false);
        }

        audio.addEventListener(
        "timeupdate",
        handleTimeUpdate
        );

        audio.addEventListener(
        "loadedmetadata",
        handleLoadedMetadata
        );

        audio.addEventListener(
        "play",
        handlePlay
        );

        audio.addEventListener(
        "pause",
        handlePause
        );

        audio.addEventListener(
        "ended",
        handleEnded
        );

        audio.addEventListener(
        "error",
        handleError
        );

        return () => {
        audio.removeEventListener(
            "timeupdate",
            handleTimeUpdate
        );

        audio.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata
        );

        audio.removeEventListener(
            "play",
            handlePlay
        );

        audio.removeEventListener(
            "pause",
            handlePause
        );

        audio.removeEventListener(
            "ended",
            handleEnded
        );

        audio.removeEventListener(
            "error",
            handleError
        );
        };
    }, [currentIndex, playlist]);

    useEffect(() => {
        if (audioRef.current) {
        audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (!currentSong || !audioRef.current) {
        return;
        }

        const audio = audioRef.current;
        const audioUrl = getAudioUrl(currentSong);

        if (!audioUrl) {
        return;
        }

        audio.pause();

        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        audio.src = audioUrl;
        audio.volume = volume;
        audio.load();

        return () => {
        audio.pause();
        };
    }, [currentSong]);

    async function playSong(song, index) {
        if (!song?._id) return;

        const audio = audioRef.current;

        if (!audio) return;

        if (
        currentSong?._id === song._id
        ) {
        try {
            if (audio.paused) {
            await audio.play();
            } else {
            audio.pause();
            }
        } catch (error) {
            console.error(
            "Playback error:",
            error
            );
        }

        return;
        }

        setCurrentSong(song);
        setCurrentIndex(index);

        setTimeout(async () => {
        try {
            const newAudio = audioRef.current;

            if (!newAudio) return;

            await newAudio.play();
        } catch (error) {
            console.error(
            "Could not play playlist song:",
            error
            );
        }
        }, 50);
    }

    async function togglePlay() {
        const audio = audioRef.current;

        if (!audio || !currentSong) return;

        try {
        if (audio.paused) {
            await audio.play();
        } else {
            audio.pause();
        }
        } catch (error) {
        console.error(
            "Playback error:",
            error
        );
        }
    }

    function playPrevious() {
        if (!playlist?.songs?.length) return;

        const audio = audioRef.current;

        if (
        audio &&
        audio.currentTime > 3
        ) {
        audio.currentTime = 0;
        setCurrentTime(0);
        return;
        }

        const previousIndex =
            currentIndex <= 0
            ? playlist.songs.length - 1
            : currentIndex - 1;

        const previousSong =
        playlist.songs[previousIndex];

        if (!previousSong?._id) return;

        setCurrentSong(previousSong);
        setCurrentIndex(previousIndex);
    }

    function playNext() {
        if (!playlist?.songs?.length) return;

        if (playlist.songs.length === 1) {
        const onlySong = playlist.songs[0];

        setCurrentSong(onlySong);
        setCurrentIndex(0);

        return;
        }

        const nextIndex =
        currentIndex >=
            playlist.songs.length - 1 ||
        currentIndex === -1
            ? 0
            : currentIndex + 1;

        const nextSong =
        playlist.songs[nextIndex];

        if (!nextSong?._id) return;

        setCurrentSong(nextSong);
        setCurrentIndex(nextIndex);
    }

    function handleSeek(event) {
        const audio = audioRef.current;

        if (!audio || !duration) return;

        const rect =
        event.currentTarget.getBoundingClientRect();

        const clickPosition =
        (event.clientX - rect.left) /
        rect.width;

        const newTime =
        clickPosition * duration;

        audio.currentTime = newTime;

        setCurrentTime(newTime);
    }

    async function removeSong(songId) {
        if (!playlist?._id) return;

        try {
        const response = await fetch(
            `${API_URL}/api/playlists/${playlist._id}/songs/${songId}`,
            {
            method: "DELETE",
            credentials: "include",
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
            data.message ||
                "Failed to remove song"
            );
        }

        setPlaylist(data.playlist);

        if (currentSong?._id === songId) {
            audioRef.current?.pause();

            setCurrentSong(null);
            setCurrentIndex(-1);
            setCurrentTime(0);
            setDuration(0);
            setIsPlaying(false);
        }
        } catch (error) {
        console.error(
            "Remove song error:",
            error
        );
        }
    }

    if (loading) {
        return (
        <main className="min-h-screen bg-[#0b0f17] text-white">
            <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

                <p className="text-sm text-slate-400">
                Loading playlist...
                </p>
            </div>
            </div>
        </main>
        );
    }

    if (notFound || !playlist) {
        return (
        <main className="min-h-screen bg-[#0b0f17] text-white">
            <div className="flex min-h-screen items-center justify-center px-6">
            <div className="text-center">
                <AlertCircle
                size={45}
                className="mx-auto mb-5 text-slate-600"
                />

                <h1 className="text-2xl font-bold">
                Playlist not found
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                This playlist may have been deleted
                or is no longer available.
                </p>

                <button
                type="button"
                onClick={() => navigate("/home")}
                className="mt-6 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950"
                >
                Back to Home
                </button>
            </div>
            </div>
        </main>
        );
    }

    const songs = playlist.songs || [];

    const currentImage = getImageUrl(
        currentSong
    );

    const progress =
        duration > 0
        ? Math.min(
            (currentTime / duration) * 100,
            100
            )
        : 0;

    return (
        <main className="min-h-screen bg-[#0b0f17] text-slate-100">
        <audio
            ref={audioRef}
            preload="metadata"
        />

        <div className="min-h-screen pb-48">
            <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-800/60 bg-[#0b0f17]/80 px-6 backdrop-blur-xl">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-400"
            >
                <ArrowLeft size={16} />
                Back
            </button>
            </header>

            <section className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-600 to-slate-950 shadow-2xl shadow-emerald-950/40">
                <Music2
                    size={64}
                    className="text-white/30"
                />
                </div>

                <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                    Playlist
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">
                    {playlist.name}
                </h1>

                {playlist.description && (
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                    {playlist.description}
                    </p>
                )}

                <p className="mt-4 text-sm text-slate-500">
                    {songs.length}{" "}
                    {songs.length === 1
                    ? "song"
                    : "songs"}
                </p>
                </div>
            </div>
            </section>

            <section className="mx-auto max-w-6xl px-6">
            {songs.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
                <Music2
                    size={42}
                    className="mx-auto text-slate-700"
                />

                <h2 className="mt-4 text-lg font-bold text-white">
                    This playlist is empty
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Add songs from their song pages.
                </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40">
                {songs.map((song, index) => {
                    const isCurrent =
                    currentSong?._id ===
                    song._id;

                    const imageUrl =
                    getImageUrl(song);

                    return (
                    <div
                        key={song._id}
                        className={`group flex items-center gap-4 border-b border-slate-800/60 px-4 py-3 transition last:border-b-0 ${
                        isCurrent
                            ? "bg-emerald-500/5"
                            : "hover:bg-slate-900"
                        }`}
                    >
                        <div className="w-8 shrink-0 text-center">
                        {isCurrent &&
                        isPlaying ? (
                            <Pause
                            size={15}
                            className="mx-auto text-emerald-400"
                            />
                        ) : (
                            <span className="text-sm text-slate-600">
                            {index + 1}
                            </span>
                        )}
                        </div>

                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                        {imageUrl ? (
                            <img
                            src={imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                            <Music2
                                size={18}
                                className="text-slate-600"
                            />
                            </div>
                        )}
                        </div>

                        <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            onClick={() =>
                            playSong(
                                song,
                                index
                            )
                            }
                            className={`block max-w-full truncate text-left text-sm font-semibold transition ${
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
                            navigate(
                                `/artist/${encodeURIComponent(
                                song.artist
                                )}`
                            )
                            }
                            className="mt-1 block max-w-full truncate text-left text-xs text-slate-500 transition hover:text-emerald-400"
                        >
                            {song.artist}
                        </button>
                        </div>

                        <div className="hidden w-40 truncate text-xs text-slate-600 md:block">
                        {song.album || "Single"}
                        </div>

                        <button
                        type="button"
                        onClick={() =>
                            playSong(
                            song,
                            index
                            )
                        }
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                            isCurrent &&
                            isPlaying
                            ? "bg-emerald-400 text-slate-950"
                            : "bg-slate-800 text-slate-300 hover:bg-emerald-400 hover:text-slate-950"
                        }`}
                        >
                        {isCurrent &&
                        isPlaying ? (
                            <Pause
                            size={15}
                            fill="currentColor"
                            />
                        ) : (
                            <Play
                            size={15}
                            fill="currentColor"
                            />
                        )}
                        </button>

                        <button
                        type="button"
                        onClick={() =>
                            removeSong(
                            song._id
                            )
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                        title="Remove from playlist"
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                    );
                })}
                </div>
            )}
            </section>
        </div>

        {currentSong && (
            <div className="fixed bottom-0 left-64 right-0 z-50 border-t border-slate-800/80 bg-slate-950/95 px-6 py-4 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center gap-3">
                <span className="w-10 text-right text-xs text-slate-500">
                    {formatTime(currentTime)}
                </span>

                <div
                    onClick={handleSeek}
                    className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-slate-800"
                >
                    <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{
                        width: `${progress}%`,
                    }}
                    />
                </div>

                <span className="w-10 text-xs text-slate-500">
                    {formatTime(duration)}
                </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-6">
                <div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                    {currentImage ? (
                        <img
                        src={currentImage}
                        alt=""
                        className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                        <Music2
                            size={16}
                            className="text-slate-600"
                        />
                        </div>
                    )}
                    </div>

                    <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                        {currentSong.title}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                        {currentSong.artist}
                    </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-5">
                    <button
                    type="button"
                    onClick={playPrevious}
                    className="text-slate-400 transition hover:text-white"
                    >
                    <SkipBack
                        size={19}
                        fill="currentColor"
                    />
                    </button>

                    <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:scale-105 hover:bg-emerald-300"
                    >
                    {isPlaying ? (
                        <Pause
                        size={19}
                        fill="currentColor"
                        />
                    ) : (
                        <Play
                        size={19}
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
                        size={19}
                        fill="currentColor"
                    />
                    </button>
                </div>

                <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
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
                        Number(
                            event.target.value
                        )
                        )
                    }
                    className="h-1 w-24 cursor-pointer accent-emerald-400"
                    />
                </div>
                </div>
            </div>
            </div>
        )}
        </main>
    );
}