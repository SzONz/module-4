import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Play,
    Pause,
    Shuffle,
    Music2,
    Disc3,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function Artist() {
    const { artistName } = useParams();
    const navigate = useNavigate();

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(null);

    const decodedArtistName = decodeURIComponent(artistName || "");

    useEffect(() => {
        async function loadArtistSongs() {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/api/music/all`, {
            credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
            throw new Error(data.message || "Failed to load songs");
            }

            const allSongs = data.music || [];

            const artistSongs = allSongs.filter(
            (song) =>
                song.artist?.trim().toLowerCase() ===
                decodedArtistName.trim().toLowerCase()
            );

            setSongs(artistSongs);
        } catch (error) {
            console.error("Failed to load artist:", error);
        } finally {
            setLoading(false);
        }
        }

        loadArtistSongs();
    }, [decodedArtistName]);

    const singles = useMemo(() => {
        return songs.filter((song) => !song.albumId);
    }, [songs]);

    const albums = useMemo(() => {
        const albumMap = new Map();

        songs
        .filter((song) => song.albumId)
        .forEach((song) => {
            const id = String(song.albumId);

            if (!albumMap.has(id)) {
            albumMap.set(id, {
                id,
                title: song.album || "Unknown Album",
                artist: song.artist,
                songs: [],
            });
            }

            albumMap.get(id).songs.push(song);
        });

        return Array.from(albumMap.values()).map((album) => ({
        ...album,
        songs: album.songs.sort(
            (a, b) => (a.trackNumber || 0) - (b.trackNumber || 0)
        ),
        }));
    }, [songs]);

    function getAlbumImage(album) {
        return `${API_URL}/api/albums/${album.id}/cover`;
    }

    function getSongImage(song) {
        if (!song?.imageId) return null;

        return `${API_URL}/api/music/${song._id}/image`;
    }

    function getAudioUrl(song) {
        return `${API_URL}/api/music/${song._id}/stream`;
    }

    async function playSong(song) {
        if (!song?._id) return;

        setCurrentSong(song);

        setTimeout(async () => {
        try {
            if (!audioRef.current) return;

            audioRef.current.src = getAudioUrl(song);
            await audioRef.current.play();

            setIsPlaying(true);
        } catch (error) {
            console.error("Playback failed:", error);
        }
        }, 50);
    }

    async function toggleSong(song) {
        if (!audioRef.current) return;

        if (
        currentSong &&
        String(currentSong._id) === String(song._id)
        ) {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            await audioRef.current.play();
            setIsPlaying(true);
        }

        return;
        }

        playSong(song);
    }

    async function playAllSongs() {
        if (!songs.length) return;

        playSong(songs[0]);
    }

    async function shuffleSongs() {
        if (!songs.length) return;

        const randomSong =
        songs[Math.floor(Math.random() * songs.length)];

        playSong(randomSong);
    }

    function handleAlbumClick(albumId) {
        navigate(`/album/${albumId}`);
    }

    function handleSongClick(song) {
        navigate(`/song/${song._id}`);
    }

    function formatTime(seconds) {
        if (!seconds || Number.isNaN(seconds)) {
        return "0:00";
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function handleTimeUpdate() {
        if (!audioRef.current) return;

        setCurrentTime(audioRef.current.currentTime);
    }

    function handleLoadedMetadata() {
        if (!audioRef.current) return;

        setDuration(audioRef.current.duration);
    }

    function handleEnded() {
        setIsPlaying(false);
    }

    const artistImage = useMemo(() => {
        const songWithImage = songs.find((song) => song.imageId);

        if (songWithImage) {
        return getSongImage(songWithImage);
        }

        if (albums.length > 0) {
        return getAlbumImage(albums[0]);
        }

        return null;
    }, [songs, albums]);

    if (loading) {
        return (
        <div className="min-h-screen bg-slate-950 p-10 text-white">
            <p className="text-slate-400">Loading artist...</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-32">
        <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
        />

        <div className="p-6">
            <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
            >
            <ArrowLeft size={20} />
            Back
            </button>
        </div>

        <section className="px-10 pt-6 pb-10">
            <div className="flex items-end gap-8">
            <div className="w-48 h-48 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shadow-2xl">
                {artistImage ? (
                <img
                    src={artistImage}
                    alt={decodedArtistName}
                    className="w-full h-full object-cover"
                />
                ) : (
                <Music2 size={70} className="text-slate-500" />
                )}
            </div>

            <div>
                <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">
                Artist
                </p>

                <h1 className="text-5xl font-bold mb-4">
                {decodedArtistName}
                </h1>

                <p className="text-slate-400">
                {songs.length} {songs.length === 1 ? "song" : "songs"}
                {" • "}
                {albums.length} {albums.length === 1 ? "album" : "albums"}
                </p>
            </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
            <button
                onClick={playAllSongs}
                disabled={!songs.length}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition disabled:opacity-50"
            >
                <Play fill="currentColor" size={24} />
            </button>

            <button
                onClick={shuffleSongs}
                disabled={!songs.length}
                className="px-5 py-3 rounded-full border border-slate-700 hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
            >
                <Shuffle size={18} />
                Shuffle
            </button>
            </div>
        </section>

        {albums.length > 0 && (
            <section className="px-10 mb-12">
            <div className="flex items-center gap-3 mb-6">
                <Disc3 size={24} />
                <h2 className="text-2xl font-bold">
                Albums
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {albums.map((album) => (
                <button
                    key={album.id}
                    onClick={() => handleAlbumClick(album.id)}
                    className="text-left group"
                >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-lg">
                    <img
                        src={getAlbumImage(album)}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                        e.currentTarget.style.display = "none";
                        }}
                    />
                    </div>

                    <h3 className="font-semibold truncate">
                    {album.title}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                    Album • {album.songs.length}{" "}
                    {album.songs.length === 1 ? "song" : "songs"}
                    </p>
                </button>
                ))}
            </div>
            </section>
        )}

        {singles.length > 0 && (
            <section className="px-10 mb-12">
            <div className="flex items-center gap-3 mb-6">
                <Music2 size={24} />
                <h2 className="text-2xl font-bold">
                Singles
                </h2>
            </div>

            <div className="space-y-2">
                {singles.map((song, index) => {
                const isCurrent =
                    currentSong &&
                    String(currentSong._id) === String(song._id);

                return (
                    <div
                    key={song._id}
                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-slate-900"
                    >
                    <span className="w-8 text-center text-slate-500">
                        {index + 1}
                    </span>

                    <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-800 flex-shrink-0">
                        {getSongImage(song) ? (
                        <img
                            src={getSongImage(song)}
                            alt={song.title}
                            className="w-full h-full object-cover"
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music2
                            size={20}
                            className="text-slate-500"
                            />
                        </div>
                        )}
                    </div>

                    <button
                        onClick={() => toggleSong(song)}
                        className="flex-1 text-left min-w-0"
                    >
                        <p
                        className={`font-medium truncate ${
                            isCurrent
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                        >
                        {song.title}
                        </p>

                        <p className="text-sm text-slate-500 truncate">
                        Single
                        </p>
                    </button>

                    <button
                        onClick={() => toggleSong(song)}
                        className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-800 transition"
                    >
                        {isCurrent && isPlaying ? (
                        <Pause size={18} />
                        ) : (
                        <Play size={18} />
                        )}
                    </button>

                    <button
                        onClick={() => handleSongClick(song)}
                        className="text-sm text-slate-500 hover:text-white px-3"
                    >
                        Open
                    </button>
                    </div>
                );
                })}
            </div>
            </section>
        )}

        {songs.length === 0 && (
            <div className="px-10 py-20 text-center">
            <Music2
                size={50}
                className="mx-auto text-slate-700 mb-4"
            />

            <h2 className="text-xl font-semibold">
                No songs found
            </h2>

            <p className="text-slate-500 mt-2">
                This artist doesn't have any uploaded music yet.
            </p>
            </div>
        )}

        {currentSong && (
            <div className="fixed bottom-0 left-64 right-0 bg-slate-900 border-t border-slate-800 px-6 py-4 z-50">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-800 flex-shrink-0">
                {getSongImage(currentSong) ? (
                    <img
                    src={getSongImage(currentSong)}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                    <Music2 size={20} />
                    </div>
                )}
                </div>

                <div className="w-48 min-w-0">
                <p className="font-medium truncate">
                    {currentSong.title}
                </p>

                <p className="text-sm text-slate-500 truncate">
                    {currentSong.artist}
                </p>
                </div>

                <button
                onClick={() => toggleSong(currentSong)}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center"
                >
                {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                ) : (
                    <Play size={18} fill="currentColor" />
                )}
                </button>

                <div className="flex-1 flex items-center gap-3">
                <span className="text-xs text-slate-500 w-10 text-right">
                    {formatTime(currentTime)}
                </span>

                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                    const value = Number(e.target.value);

                    setCurrentTime(value);

                    if (audioRef.current) {
                        audioRef.current.currentTime = value;
                    }
                    }}
                    className="flex-1"
                />

                <span className="text-xs text-slate-500 w-10">
                    {formatTime(duration)}
                </span>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}