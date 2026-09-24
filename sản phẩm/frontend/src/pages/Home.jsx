import {
  Play,
  Pause,
  Heart,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Music2,
  SkipBack,
  SkipForward,
  MoreVertical,
  Shuffle,
  Pencil,
  Repeat,
  Trash2,
  Radio,
  Sparkles,
  X,
  Save,
  TrendingUp,
  Disc3,
  Music,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const recentlyPlayed = [
  {
    title: "Midnight Echoes",
    artist: "Luna Vale",
    color: "from-purple-600 via-indigo-600 to-slate-900",
  },
  {
    title: "Neon Dreams",
    artist: "The Satellites",
    color: "from-fuchsia-600 via-pink-600 to-slate-900",
  },
  {
    title: "Afterglow",
    artist: "Milo Rivers",
    color: "from-amber-500 via-rose-600 to-slate-900",
  },
  {
    title: "City Lights",
    artist: "Nova Lane",
    color: "from-cyan-500 via-blue-600 to-slate-900",
  },
  {
    title: "Golden Hour",
    artist: "Elliot Grey",
    color: "from-yellow-500 via-orange-600 to-slate-900",
  },
  {
    title: "Slow Motion",
    artist: "Velvet Youth",
    color: "from-emerald-500 via-teal-700 to-slate-900",
  },
];

const madeForYou = [
  {
    title: "Daily Mix 1",
    description:
      "Personalized music picked for your listening.",
    color: "from-emerald-400 to-cyan-900",
  },
  {
    title: "Late Night Chill",
    description:
      "Ambient electronics and warm synth pads.",
    color: "from-violet-600 to-slate-950",
  },
  {
    title: "Discover Radar",
    description:
      "Fresh tracks picked for discovery.",
    color: "from-cyan-400 to-indigo-950",
  },
  {
    title: "Heavy Rotation",
    description:
      "Your most played tracks.",
    color: "from-rose-500 to-purple-950",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const [currentSong, setCurrentSong] = useState({
    title: "Select a song",
    artist: "Choose something to play",
    color: "from-slate-700 to-slate-950",
    image: null,
    audioUrl: null,
    id: null,
  });

  const [myMusic, setMyMusic] = useState([]);
  const [myAlbums, setMyAlbums] = useState([]);

  const [allMusic, setAllMusic] = useState([]);
  const [allMusicLoading, setAllMusicLoading] = useState(true);

  const [musicLoading, setMusicLoading] =
    useState(true);

  const [albumLoading, setAlbumLoading] =
    useState(true);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const [currentIndex, setCurrentIndex] =
    useState(-1);
    
  const [queue, setQueue] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);

  const [editingSong, setEditingSong] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const [deletingSong, setDeletingSong] = useState(null);
  const [deletingAlbum, setDeletingAlbum] = useState(null);

  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);


  const openSongEdit = (event, song) => {
  event.stopPropagation();

  setOpenMenu(null);
    setEditingSong({
      ...song,
      title: song.title || "",
      artist: song.artist || "",
      album: song.album || "",
      genre: song.genre || "Other",
    });
  };

const openAlbumEdit = (event, album) => {
  event.stopPropagation();

  setOpenMenu(null);
  setEditingAlbum({
    ...album,
    title: album.title || "",
    artist: album.artist || "",
    genre: album.genre || "Other",
    description: album.description || "",
  });
};

const handleUpdateSong = async (event) => {
  event.preventDefault();

  if (!editingSong) return;

  setSavingEdit(true);

  try {
    const response = await fetch(
      `http://localhost:5000/api/music/${editingSong._id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingSong.title,
          artist: editingSong.artist,
          album: editingSong.album,
          genre: editingSong.genre,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update song"
      );
    }

    setMyMusic((previous) =>
      previous.map((song) =>
        song._id === editingSong._id
          ? data.music
          : song
      )
    );

    setEditingSong(null);
  } catch (error) {
    console.error("Update song error:", error);
    alert(error.message);
  } finally {
    setSavingEdit(false);
  }
};

const handleUpdateAlbum = async (event) => {
  event.preventDefault();

  if (!editingAlbum) return;

  setSavingEdit(true);

  try {
    const response = await fetch(
      `http://localhost:5000/api/albums/${editingAlbum._id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingAlbum.title,
          artist: editingAlbum.artist,
          genre: editingAlbum.genre,
          description: editingAlbum.description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update album"
      );
    }

    setMyAlbums((previous) =>
      previous.map((album) =>
        album._id === editingAlbum._id
          ? {
              ...album,
              ...data.album,
            }
          : album
      )
    );

    setEditingAlbum(null);
  } catch (error) {
    console.error("Update album error:", error);
    alert(error.message);
  } finally {
    setSavingEdit(false);
  }
};

const handleDeleteSong = async () => {
  if (!deletingSong) return;

  setDeletingItem(true);

  try {
    const response = await fetch(
      `http://localhost:5000/api/music/${deletingSong._id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete song"
      );
    }

    if (currentSong?.id === deletingSong._id) {
      window.dispatchEvent(
        new CustomEvent("soundly:stop")
      );
    }

    setMyMusic((previous) =>
      previous.filter(
        (song) => song._id !== deletingSong._id
      )
    );

    setDeletingSong(null);
  } catch (error) {
    console.error("Delete song error:", error);
    alert(error.message);
  } finally {
    setDeletingItem(false);
  }
};

const handleDeleteAlbum = async () => {
  if (!deletingAlbum) return;

  setDeletingItem(true);

  try {
    const response = await fetch(
      `http://localhost:5000/api/albums/${deletingAlbum._id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete album"
      );
    }

    setMyAlbums((previous) =>
      previous.filter(
        (album) => album._id !== deletingAlbum._id
      )
    );

    setDeletingAlbum(null);
  } catch (error) {
    console.error("Delete album error:", error);
    alert(error.message);
  } finally {
    setDeletingItem(false);
  }
};

  useEffect(() => {
    async function fetchAllMusic() {
      try {
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
            data.message || "Failed to load all music"
          );
        }

        setAllMusic(data.music || []);
      } catch (error) {
        console.error(
          "Failed to load recently added music:",
          error
        );
      } finally {
        setAllMusicLoading(false);
      }
    }

    fetchAllMusic();
  }, []);

  useEffect(() => {
    async function fetchMyMusic() {
      try {
        const response = await fetch(
          `${API_URL}/api/music/my-music`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load your music"
          );
        }

        setMyMusic(data.music || []);
      } catch (error) {
        console.error(
          "Failed to load uploaded music:",
          error
        );
      } finally {
        setMusicLoading(false);
      }
    }

    fetchMyMusic();
  }, []);

  useEffect(() => {
    async function fetchMyAlbums() {
      try {
        const response = await fetch(
          `${API_URL}/api/albums/my-albums`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load your albums"
          );
        }

        setMyAlbums(data.albums || []);
      } catch (error) {
        console.error(
          "Failed to load uploaded albums:",
          error
        );
      } finally {
        setAlbumLoading(false);
      }
    }

    fetchMyAlbums();
  }, []);

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

    function handleEnded() {
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, repeat, shuffle, queue]);

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

  function getAlbumCoverUrl(album) {
    if (!album?._id || !album.coverImageId) return null;
    return `${API_URL}/api/albums/${album._id}/cover`;
  }

  async function playSong(
    song,
    index = -1,
    preserveQueue = false
  ) {
    if (!song) return;

    if (!preserveQueue) {
      setQueue([]);
    }

    const audioUrl =
      song.audioUrl ||
      (song._id ? getAudioUrl(song) : null);

    const image =
      song.image ||
      (song._id ? getImageUrl(song) : null);

    setCurrentSong({
      title: song.title || "Unknown title",
      artist: song.artist || "Unknown artist",
      color:
        song.color ||
        "from-emerald-500 via-cyan-600 to-slate-950",
      image,
      audioUrl,
      id: song._id || song.id || null,
    });

    if (index >= 0) {
      setCurrentIndex(index);
    } else if (song._id) {
      const foundIndex = myMusic.findIndex(
        (item) => item._id === song._id
      );

      setCurrentIndex(foundIndex);
    } else {
      setCurrentIndex(-1);
    }

    setCurrentTime(0);
    setDuration(0);

    if (!audioUrl) {
      setIsPlaying(false);
      return;
    }

    try {
      const audio = audioRef.current;

      if (!audio) return;

      audio.pause();
      audio.src = audioUrl;
      audio.volume = volume;
      audio.load();

      await audio.play();

      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to play song:", error);
      setIsPlaying(false);
    }
  }

  useEffect(() => {
    function handleExternalQueue(event) {
      const songs = event.detail?.songs || [];
      const index = event.detail?.index ?? 0;

      if (!songs.length) return;

      const selectedIndex =
        index >= 0 && index < songs.length ? index : 0;

      setQueue(songs);
      setCurrentIndex(selectedIndex);

      playSong(
        songs[selectedIndex],
        selectedIndex,
        true
      );
    }

    window.addEventListener(
      "soundly:queue",
      handleExternalQueue
    );

    return () => {
      window.removeEventListener(
        "soundly:queue",
        handleExternalQueue
      );
    };
  }, [myMusic]);

  function openSong(song) {
    if (!song?._id) return;

    navigate(`/song/${song._id}`);
  }

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

    function handleExternalQueue(event) {
      const songs = event.detail?.songs || [];
      const index = event.detail?.index ?? 0;

      if (!songs.length) return;

      setQueue(songs);

      setCurrentIndex(index);

      playSong(songs[index], index);
    }

    function handleEnded() {
      if (repeat) {
        const audio = audioRef.current;

        if (!audio) return;

        audio.currentTime = 0;

        audio.play().catch((error) => {
          console.error("Repeat playback error:", error);
        });

        return;
      }

      if (queue.length > 0) {
        const nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
          setCurrentIndex(nextIndex);
          playSong(queue[nextIndex], nextIndex, true);
          return;
        }
      }

      setIsPlaying(false);
      setCurrentTime(0);
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
    };
  }, [currentIndex, repeat, shuffle, queue]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  async function togglePlay() {
    const audio = audioRef.current;

    if (!audio || !currentSong.audioUrl) {
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error(
        "Playback error:",
        error
      );
    }
  }

  async function playPrevious() {
    const activeQueue =
      queue.length > 0 ? queue : myMusic;

    if (!activeQueue.length) return;

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
      if (activeQueue.length === 1) {
        previousIndex = 0;
      } else {
        do {
          previousIndex = Math.floor(
            Math.random() * activeQueue.length
          );
        } while (previousIndex === currentIndex);
      }
    } else {
      previousIndex =
        currentIndex <= 0
          ? activeQueue.length - 1
          : currentIndex - 1;
    }

    setCurrentIndex(previousIndex);

    await playSong(
      activeQueue[previousIndex],
      previousIndex,
      queue.length > 0
    );
  }

  async function playNext() {
    if (queue.length > 0) {
      let nextIndex;

      if (shuffle) {
        if (queue.length === 1) {
          nextIndex = 0;
        } else {
          do {
            nextIndex = Math.floor(
              Math.random() * queue.length
            );
          } while (nextIndex === currentIndex);
        }
      } else {
        nextIndex =
          currentIndex >= queue.length - 1 ||
          currentIndex === -1
            ? 0
            : currentIndex + 1;
      }

      setCurrentIndex(nextIndex);

      await playSong(
        queue[nextIndex],
        nextIndex
      );

      return;
    }

    if (!myMusic.length) return;

    let nextIndex;

    if (shuffle) {
      if (myMusic.length === 1) {
        nextIndex = 0;
      } else {
        do {
          nextIndex = Math.floor(
            Math.random() * myMusic.length
          );
        } while (nextIndex === currentIndex);
      }
    } else {
      nextIndex =
        currentIndex >= myMusic.length - 1 ||
        currentIndex === -1
          ? 0
          : currentIndex + 1;
    }

    await playSong(
      queue[nextIndex],
      nextIndex,
      false
    );
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

  function formatTime(seconds) {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds = Math.floor(
      seconds % 60
    );

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <main className="min-h-screen bg-[#0b0f17] text-slate-100 antialiased selection:bg-emerald-400 selection:text-black">
      <audio
        ref={audioRef}
        preload="metadata"
      />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[160px]" />

        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />
      </div>

      <div className="relative min-h-screen">
        <section className="w-full pb-32">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800/40 bg-[#0b0f17]/70 px-6 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-emerald-400/40 hover:text-emerald-400"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-emerald-400/40 hover:text-emerald-400"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <Sparkles size={14} />
              <span>Upgrade</span>
            </button>
          </header>

          <div className="px-6 py-6 md:px-8">
            <div className="relative mb-10 overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-emerald-900/40 via-cyan-900/20 to-slate-900/40 p-6 md:p-8">
              <div className="relative z-10 max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <TrendingUp size={12} />
                  Your Music
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Your Soundly Library
                </h1>

                <p className="mt-1 text-sm text-slate-300">
                  Listen to your songs, albums,
                  and everything you've uploaded.
                </p>

                {myMusic.length > 0 && (
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        playSong(
                          myMusic[0],
                          0
                        )
                      }
                      className="flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:scale-105 hover:bg-emerald-300"
                    >
                      <Play
                        size={16}
                        fill="currentColor"
                      />

                      Play your music
                    </button>
                  </div>
                )}
              </div>
            </div>

            <section className="mb-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Jump Back In
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recentlyPlayed.map((song) => (
                  <div
                    key={song.title}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 p-2 transition duration-200 hover:border-slate-700 hover:bg-slate-800/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${song.color} shadow-inner`}
                      >
                        <Radio
                          size={18}
                          className="text-white/70"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {song.title}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playSong(song);
                      }}
                      className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-slate-950 opacity-0 shadow-md transition group-hover:opacity-100"
                    >
                      <Play
                        size={14}
                        fill="currentColor"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <MusicSection
              title="Made For You"
              subtitle="Music picked to fit your listening"
              items={madeForYou}
              onPlay={playSong}
            />

            <section className="mb-10">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Recently Added
                  </h2>

                  <p className="text-xs text-slate-400">
                    Latest songs uploaded by the Soundly community
                  </p>
                </div>
              </div>

              {allMusicLoading ? (
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-6 text-center">
                  <p className="text-sm text-slate-400">
                    Loading recently added songs...
                  </p>
                </div>
              ) : allMusic.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center">
                  <Music
                    size={32}
                    className="mx-auto mb-3 text-slate-600"
                  />

                  <h3 className="text-sm font-semibold text-slate-300">
                    No music yet
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Be the first person to upload a song.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {allMusic.slice(0, 6).map((song, index) => {
                    const imageUrl = getImageUrl(song);

                    return (
                      <div
                        key={song._id}
                        className={`group relative rounded-2xl border p-3 transition duration-300 ${
                          currentSong.id === song._id
                            ? "border-emerald-400/50 bg-emerald-400/5"
                            : "border-slate-800/40 bg-slate-900/30 hover:border-slate-700/60 hover:bg-slate-800/40"
                        }`}
                      >
                        <div
                          className="relative mb-3 aspect-square cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-600 to-slate-950 shadow-lg"
                          onClick={() => openSong(song)}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`${song.title} cover`}
                              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Music
                                size={32}
                                className="text-white/30"
                              />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-slate-950/10 transition group-hover:bg-slate-950/40" />

                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();

                                playSong(song, index, true);
                              }}
                              className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-xl transition hover:scale-110"
                              aria-label={`Play ${song.title}`}
                            >
                              {currentSong.id === song._id && isPlaying ? (
                                <Pause
                                  size={18}
                                  fill="currentColor"
                                />
                              ) : (
                                <Play
                                  size={18}
                                  fill="currentColor"
                                  className="ml-0.5"
                                />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="px-1">
                          <button
                            type="button"
                            onClick={() => openSong(song)}
                            className="block w-full text-left"
                          >
                            <h3 className="truncate text-sm font-semibold text-slate-200 transition hover:text-emerald-400">
                              {song.title}
                            </h3>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {song.artist}
                            </p>

                            {song.album && (
                              <p className="mt-1 truncate text-[11px] text-slate-500">
                                {song.album}
                              </p>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>


            <section className="mb-10">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Your Albums
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Albums you've uploaded to Soundly
                  </p>
                </div>

                {myAlbums.length > 0 && (
                  <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-400">
                    {myAlbums.length}{" "}
                    {myAlbums.length === 1 ? "album" : "albums"}
                  </span>
                )}
              </div>

              {albumLoading ? (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-8 text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

                  <p className="text-sm text-slate-400">
                    Loading your albums...
                  </p>
                </div>
              ) : myAlbums.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900">
                    <Disc3
                      size={28}
                      className="text-slate-600"
                    />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-300">
                    No albums yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                    Upload an album and it will appear here.
                    Your albums are only visible in this section
                    when you are the uploader.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {myAlbums.map((album) => {
                    const albumTracks = album.tracks || [];
                    const coverUrl = getAlbumCoverUrl(album);

                    return (
                      <div
                        key={album._id}
                        onClick={() =>
                          navigate(`/album/${album._id}`)
                        }
                        className="group cursor-pointer rounded-2xl border border-slate-800/50 bg-slate-900/30 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-black/20"
                      >
                        <div className="absolute right-3 top-3 z-20">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              setOpenMenu(
                                openMenu === `album-${album._id}`
                                  ? null
                                  : `album-${album._id}`
                              );
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-slate-300 opacity-0 shadow-lg backdrop-blur transition hover:bg-slate-900 hover:text-white group-hover:opacity-100"
                            aria-label={`Options for ${album.title}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenu === `album-${album._id}` && (
                            <div
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                              className="absolute right-0 top-11 w-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl"
                            >
                              <button
                                type="button"
                                onClick={(event) =>
                                  openAlbumEdit(event, album)
                                }
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                              >
                                <Pencil size={15} />
                                Edit album
                              </button>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenu(null);
                                  setDeletingAlbum(album);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                              >
                                <Trash2 size={15} />
                                Delete album
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-950">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={album.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-slate-950">
                              <Music2
                                size={48}
                                className="text-slate-600"
                              />
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              if (!albumTracks.length) return;

                              window.dispatchEvent(
                                new CustomEvent("soundly:queue", {
                                  detail: {
                                    songs: albumTracks,
                                    index: 0,
                                  },
                                })
                              );
                            }}
                            disabled={!albumTracks.length}
                            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-slate-950 opacity-0 shadow-xl transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-0 group-hover:opacity-100"
                            aria-label={`Play ${album.title}`}
                          >
                            <Play
                              size={18}
                              fill="currentColor"
                              className="ml-0.5"
                            />
                          </button>
                        </div>

                        <div className="mt-3 min-w-0">
                          <h3 className="truncate text-sm font-semibold text-white">
                            {album.title}
                          </h3>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {album.artist}
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="truncate text-[11px] text-slate-500">
                              {album.genre || "Other"}
                            </span>

                            <span className="shrink-0 text-[11px] text-slate-500">
                              {albumTracks.length}{" "}
                              {albumTracks.length === 1
                                ? "track"
                                : "tracks"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>


            <section className="mb-10">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Your Uploads
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Music you've uploaded to Soundly
                  </p>
                </div>

                {myMusic.length > 0 && (
                  <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-400">
                    {myMusic.length}{" "}
                    {myMusic.length === 1 ? "song" : "songs"}
                  </span>
                )}
              </div>

              {musicLoading ? (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-8 text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

                  <p className="text-sm text-slate-400">
                    Loading your music...
                  </p>
                </div>
              ) : myMusic.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900">
                    <Radio
                      size={28}
                      className="text-slate-600"
                    />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-300">
                    No uploads yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                    Upload your first song and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {myMusic.map((song, index) => {
                    const imageUrl = getImageUrl(song);

                    const isCurrent =
                      currentSong?.id === song._id;

                    return (
                      <div
                        key={song._id}
                        className={`group relative rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${
                          isCurrent
                            ? "border-emerald-400/50 bg-emerald-400/5"
                            : "border-slate-800/50 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="absolute right-3 top-3 z-20">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              setOpenMenu(
                                openMenu === `song-${song._id}`
                                  ? null
                                  : `song-${song._id}`
                              );
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-slate-300 opacity-0 shadow-lg backdrop-blur transition hover:bg-slate-900 hover:text-white group-hover:opacity-100"
                            aria-label={`Options for ${song.title}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenu === `song-${song._id}` && (
                            <div
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                              className="absolute right-0 top-11 w-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl"
                            >
                              <button
                                type="button"
                                onClick={(event) =>
                                  openSongEdit(event, song)
                                }
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                              >
                                <Pencil size={15} />
                                Edit song
                              </button>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenu(null);
                                  setDeletingSong(song);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                              >
                                <Trash2 size={15} />
                                Delete song
                              </button>
                            </div>
                          )}
                        </div>
                        <div
                          className="relative mb-3 aspect-square cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-600 to-slate-950 shadow-lg"
                          onClick={() => openSong(song)}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`${song.title} cover`}
                              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Radio
                                size={40}
                                className="text-white/30"
                              />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-slate-950/10 transition duration-300 group-hover:bg-slate-950/40" />

                          {isCurrent && (
                            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-emerald-400/20 bg-slate-950/80 px-2 py-1 backdrop-blur">
                              <span className="flex h-3 items-end gap-[2px]">
                                <span className="h-2 w-[2px] animate-pulse rounded-full bg-emerald-400" />
                                <span className="h-3 w-[2px] animate-pulse rounded-full bg-emerald-400 [animation-delay:150ms]" />
                                <span className="h-1.5 w-[2px] animate-pulse rounded-full bg-emerald-400 [animation-delay:300ms]" />
                              </span>

                              <span className="text-[9px] font-medium text-emerald-300">
                                Playing
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                playSong(song, index);
                              }}
                              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-2xl transition hover:scale-110"
                              aria-label={`Play ${song.title}`}
                            >
                              <Play
                                size={19}
                                fill="currentColor"
                                className="ml-0.5"
                              />
                            </button>
                          </div>
                        </div>

                        <div className="px-1">
                          <button
                            type="button"
                            onClick={() => openSong(song)}
                            className="block w-full text-left"
                          >
                            <h3 className="truncate text-sm font-semibold text-slate-200 transition hover:text-emerald-400">
                              {song.title}
                            </h3>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {song.artist}
                            </p>

                            {song.album && (
                              <p className="mt-1 truncate text-[11px] text-slate-500">
                                {song.album}
                              </p>
                            )}

                            {song.trackNumber && (
                              <p className="mt-1 text-[10px] text-emerald-400/70">
                                Track {song.trackNumber}
                              </p>
                            )}
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-800/50 pt-2">
                          <span className="truncate text-[10px] uppercase tracking-wide text-slate-600">
                            {song.genre || "Other"}
                          </span>

                          {isCurrent && (
                            <span className="text-[10px] font-medium text-emerald-400">
                              Now playing
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        </section>
      </div>

      <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2 rounded-2xl border border-slate-700/50 bg-[#0f172a]/90 p-3 shadow-2xl backdrop-blur-xl md:p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 md:w-1/4">
            <div
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${currentSong.color} shadow-md`}
            >
              {currentSong.image ? (
                <img
                  src={currentSong.image}
                  alt={`${currentSong.title} cover`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Radio
                  size={18}
                  className="text-white"
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">
                {currentSong.title}
              </p>

              <p className="truncate text-xs text-slate-400">
                {currentSong.artist}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsLiked(!isLiked)
              }
              className={`ml-2 hidden sm:block ${
                isLiked
                  ? "text-rose-500"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Heart
                size={18}
                fill={
                  isLiked
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          </div>

          <div className="flex max-w-md flex-1 flex-col items-center gap-1.5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setShuffle(!shuffle)
                }
                className={`hidden transition sm:block ${
                  shuffle
                    ? "text-emerald-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Shuffle size={15} />
              </button>

              <button
                type="button"
                onClick={playPrevious}
                disabled={!myMusic.length && !queue.length}
                className="text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <SkipBack
                  size={17}
                  fill="currentColor"
                />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={!currentSong.audioUrl}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-md transition hover:scale-105 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlaying ? (
                  <Pause
                    size={16}
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={16}
                    fill="currentColor"
                    className="ml-0.5"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={playNext}
                disabled={!myMusic.length}
                className="text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <SkipForward
                  size={17}
                  fill="currentColor"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setRepeat(!repeat)
                }
                className={`hidden transition sm:block ${
                  repeat
                    ? "text-emerald-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Repeat size={15} />
              </button>
            </div>

            <div className="flex w-full items-center gap-2">
              <span className="w-8 text-right text-[10px] text-slate-500">
                {formatTime(currentTime)}
              </span>

              <div
                onClick={handleSeek}
                className="group relative h-1 flex-1 cursor-pointer rounded-full bg-slate-800"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all group-hover:brightness-110"
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

              <span className="w-8 text-[10px] text-slate-500">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="hidden items-center justify-end gap-2 md:flex md:w-1/4">
            <Volume2
              size={16}
              className="text-slate-400"
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
              className="h-1 w-20 cursor-pointer accent-emerald-400"
            />
          </div>
        </div>
      </div>

        {editingSong && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setEditingSong(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Edit Song
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Update your song information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingSong(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleUpdateSong}
                className="space-y-4"
              >
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Song title
                  </label>

                  <input
                    type="text"
                    value={editingSong.title}
                    onChange={(event) =>
                      setEditingSong({
                        ...editingSong,
                        title: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Artist
                  </label>

                  <input
                    type="text"
                    value={editingSong.artist}
                    onChange={(event) =>
                      setEditingSong({
                        ...editingSong,
                        artist: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Album
                  </label>

                  <input
                    type="text"
                    value={editingSong.album}
                    onChange={(event) =>
                      setEditingSong({
                        ...editingSong,
                        album: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Genre
                  </label>

                  <input
                    type="text"
                    value={editingSong.genre}
                    onChange={(event) =>
                      setEditingSong({
                        ...editingSong,
                        genre: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingSong(null)}
                    className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />

                    {savingEdit
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingAlbum && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setEditingAlbum(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Edit Album
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Update your album information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleUpdateAlbum}
                className="space-y-4"
              >
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Album title
                  </label>

                  <input
                    type="text"
                    value={editingAlbum.title}
                    onChange={(event) =>
                      setEditingAlbum({
                        ...editingAlbum,
                        title: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Artist
                  </label>

                  <input
                    type="text"
                    value={editingAlbum.artist}
                    onChange={(event) =>
                      setEditingAlbum({
                        ...editingAlbum,
                        artist: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Genre
                  </label>

                  <input
                    type="text"
                    value={editingAlbum.genre}
                    onChange={(event) =>
                      setEditingAlbum({
                        ...editingAlbum,
                        genre: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={editingAlbum.description}
                    onChange={(event) =>
                      setEditingAlbum({
                        ...editingAlbum,
                        description: event.target.value,
                      })
                    }
                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingAlbum(null)}
                    className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />

                    {savingEdit
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingSong && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setDeletingSong(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-950 p-6 shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <Trash2
                  size={22}
                  className="text-red-400"
                />
              </div>

              <h2 className="text-lg font-bold text-white">
                Delete song?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deletingSong.title}
                </span>
                ? This cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingSong(null)}
                  className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSong}
                  disabled={deletingItem}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={16} />

                  {deletingItem
                    ? "Deleting..."
                    : "Delete song"}
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingAlbum && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setDeletingAlbum(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-950 p-6 shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <Trash2
                  size={22}
                  className="text-red-400"
                />
              </div>

              <h2 className="text-lg font-bold text-white">
                Delete album?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                This will delete{" "}
                <span className="font-semibold text-white">
                  {deletingAlbum.title}
                </span>{" "}
                and all of its tracks. This cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingAlbum(null)}
                  className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAlbum}
                  disabled={deletingItem}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={16} />

                  {deletingItem
                    ? "Deleting..."
                    : "Delete album"}
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}

function MusicSection({
  title,
  subtitle,
  items,
  onPlay,
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="group relative cursor-pointer rounded-2xl border border-slate-800/40 bg-slate-900/30 p-3 transition duration-300 hover:border-slate-700/60 hover:bg-slate-800/40"
          >
            <div
              className={`relative mb-3 aspect-square overflow-hidden rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Radio
                  size={32}
                  className="text-white/30"
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onPlay(item)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-xl transition hover:scale-110"
                >
                  <Play
                    size={18}
                    fill="currentColor"
                    className="ml-0.5"
                  />
                </button>
              </div>
            </div>

            <div className="px-1">
              <h3 className="truncate text-sm font-semibold text-slate-200">
                {item.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
