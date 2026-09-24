import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Disc3,
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Clock3,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function Album() {
  const { id } = useParams();
  const navigate = useNavigate();

  const audioRef = useRef(null);

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentTrackIndex, setCurrentTrackIndex] =
    useState(-1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const [shuffle, setShuffle] = useState(false);
  const [repeatAlbum, setRepeatAlbum] = useState(false);

  const [shuffleQueue, setShuffleQueue] = useState([]);

  useEffect(() => {
    async function fetchAlbum() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/albums/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load album"
          );
        }

        setAlbum(data.album);
      } catch (err) {
        console.error(
          "Failed to load album:",
          err
        );

        setError(
          err.message || "Failed to load album"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAlbum();
    }
  }, [id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    function handleTimeUpdate() {
      setCurrentTime(audio.currentTime);
    }

    function handleLoadedMetadata() {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    }

    function handlePlay() {
      setIsPlaying(true);
    }

    function handlePause() {
      setIsPlaying(false);
    }

    function handleEnded() {
      handleTrackEnded();
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
  });

  function getCoverUrl() {
    if (
      !album?._id ||
      !album?.coverImageId
    ) {
      return null;
    }

    return `${API_URL}/api/albums/${album._id}/cover`;
  }

  function getAudioUrl(track) {
    if (!track?._id) {
      return null;
    }

    return `${API_URL}/api/music/${track._id}/stream`;
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).getFullYear();
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

  function formatPlayerTime(seconds) {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  function createShuffleQueue(
    tracks,
    currentIndex
  ) {
    const indexes = tracks
      .map((_, index) => index)
      .filter(
        (index) => index !== currentIndex
      );

    for (
      let i = indexes.length - 1;
      i > 0;
      i--
    ) {
      const randomIndex = Math.floor(
        Math.random() * (i + 1)
      );

      [
        indexes[i],
        indexes[randomIndex],
      ] = [
        indexes[randomIndex],
        indexes[i],
      ];
    }

    return indexes;
  }

  async function playTrack(index) {
    const tracks = album?.tracks || [];
    const track = tracks[index];

    if (!track) return;

    const audio = audioRef.current;

    if (!audio) return;

    const audioUrl = getAudioUrl(track);

    if (!audioUrl) return;

    try {
      setCurrentTrackIndex(index);
      setCurrentTime(0);
      setDuration(0);

      if (shuffle) {
        setShuffleQueue((currentQueue) =>
          currentQueue.filter(
            (queueIndex) =>
              queueIndex !== index
          )
        );
      }

      audio.src = audioUrl;
      audio.load();

      audio.volume = volume;

      await audio.play();

      setIsPlaying(true);
    } catch (err) {
      console.error(
        "Failed to play track:",
        err
      );

      setIsPlaying(false);
    }
  }

  async function togglePlay() {
    const tracks = album?.tracks || [];

    if (!tracks.length) return;

    const audio = audioRef.current;

    if (!audio) return;

    if (currentTrackIndex === -1) {
      await playTrack(0);
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.error(
        "Playback error:",
        err
      );
    }
  }

  async function playNext() {
    const tracks = album?.tracks || [];

    if (!tracks.length) return;

    if (currentTrackIndex === -1) {
      await playTrack(0);
      return;
    }

    if (shuffle) {
      let queue = [...shuffleQueue];

      if (!queue.length) {
        queue = createShuffleQueue(
          tracks,
          currentTrackIndex
        );
      }

      const nextIndex = queue.shift();

      setShuffleQueue(queue);

      if (nextIndex !== undefined) {
        await playTrack(nextIndex);
        return;
      }

      if (repeatAlbum) {
        const newQueue =
          createShuffleQueue(
            tracks,
            currentTrackIndex
          );

        const nextShuffleIndex =
          newQueue.shift();

        setShuffleQueue(newQueue);

        if (
          nextShuffleIndex !== undefined
        ) {
          await playTrack(
            nextShuffleIndex
          );
        }
      } else {
        setIsPlaying(false);

        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      }

      return;
    }

    const nextIndex =
      currentTrackIndex + 1;

    if (nextIndex >= tracks.length) {
      if (repeatAlbum) {
        setShuffleQueue([]);

        await playTrack(0);
        return;
      }

      setIsPlaying(false);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }

      return;
    }

    await playTrack(nextIndex);
  }

  async function handleTrackEnded() {
    await playNext();
  }

  async function playPrevious() {
    const tracks = album?.tracks || [];
    if (!tracks.length) return;
      const audio = audioRef.current;
    if (!audio) return;
    if (
      currentTrackIndex >= 0 &&
      audio.currentTime > 3
    ) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (currentTrackIndex <= 0) {
      await playTrack(0);
      return;
    }
    await playTrack(
      currentTrackIndex - 1
    );
  }

  function handleSeek(event) {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Number(
      event.target.value
    );
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }

  function toggleShuffle() {
    setShuffle((current) => {
      const newValue = !current;
      if (newValue) {
        const tracks = album?.tracks || [];

        if (tracks.length) {
          setShuffleQueue(
            createShuffleQueue(
              tracks,
              currentTrackIndex
            )
          );
        }
      } else {
        setShuffleQueue([]);
      }

      return newValue;
    });
  }

  function toggleRepeatAlbum() {
    setRepeatAlbum(
      (current) => !current
    );
  }

  function toggleMute() {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.7);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0f17] text-white">
        <div className="px-8 pt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-400"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div className="mx-auto max-w-6xl px-8 py-16">
          <div className="animate-pulse">
            <div className="flex flex-col gap-8 md:flex-row md:items-end">
              <div className="h-64 w-64 flex-shrink-0 rounded-2xl bg-slate-800" />

              <div className="flex-1">
                <div className="mb-4 h-4 w-20 rounded bg-slate-800" />

                <div className="mb-4 h-12 w-2/3 rounded bg-slate-800" />

                <div className="h-5 w-1/3 rounded bg-slate-800" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !album) {
    return (
      <main className="min-h-screen bg-[#0b0f17] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[160px]" />

          <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-slate-800 bg-slate-900/70">
              <Music2
                size={38}
                className="text-slate-500"
              />
            </div>

            <h1 className="text-2xl font-bold text-white">
              Album not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {error ||
                "This album may have been deleted or is no longer available on Soundly."}
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

  const tracks = album.tracks || [];
  const coverUrl = getCoverUrl();

  const currentTrack =
    currentTrackIndex >= 0
      ? tracks[currentTrackIndex]
      : null;

  return (
    <main className="min-h-screen bg-[#0b0f17] pb-44 text-slate-100 antialiased">
      <audio
        ref={audioRef}
        preload="metadata"
      />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.07] blur-3xl"
          />
        )}

        <div className="absolute inset-0 bg-[#0b0f17]/90" />

        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[160px]" />

        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />
      </div>

      <div className="relative">
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

        <section className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-16">
          <div className="grid items-end gap-10 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr] md:gap-14">
            <div className="mx-auto w-full max-w-[360px]">
              <div className="aspect-square overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-emerald-500 via-cyan-600 to-slate-950 shadow-2xl shadow-emerald-950/40">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={`${album.title} cover`}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Disc3
                      size={100}
                      strokeWidth={1}
                      className="text-white/25"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Album
              </p>

              <h1 className="mt-4 break-words text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
                {album.title}
              </h1>

              <button
                type="button"
                onClick={() =>
                  navigate(`/artist/${encodeURIComponent(album.artist)}`)
                }
                className="mt-5 text-left text-xl font-medium text-slate-300 transition hover:text-emerald-400 hover:underline"
              >
                {album.artist}
              </button>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                {album.createdAt && (
                  <>
                    <span>
                      {formatDate(
                        album.createdAt
                      )}
                    </span>

                    <span>•</span>
                  </>
                )}

                <span>
                  {tracks.length}{" "}
                  {tracks.length === 1
                    ? "song"
                    : "songs"}
                </span>

                {album.genre && (
                  <>
                    <span>•</span>

                    <span>
                      {album.genre}
                    </span>
                  </>
                )}
              </div>

              {album.description && (
                <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-400">
                  {album.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      currentTrackIndex ===
                        0 &&
                      isPlaying
                    ) {
                      togglePlay();
                    } else {
                      playTrack(0);
                    }
                  }}
                  disabled={!tracks.length}
                  className="flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:scale-105 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  {currentTrackIndex ===
                    0 &&
                  isPlaying ? (
                    <Pause
                      size={18}
                      fill="currentColor"
                    />
                  ) : (
                    <Play
                      size={18}
                      fill="currentColor"
                    />
                  )}

                  {currentTrackIndex ===
                    0 &&
                  isPlaying
                    ? "Pause"
                    : "Play All"}
                </button>

                <button
                  type="button"
                  onClick={toggleShuffle}
                  disabled={!tracks.length}
                  title="Shuffle album"
                  className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                    shuffle
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <Shuffle size={18} />

                  <span className="hidden sm:inline">
                    Shuffle Album
                  </span>
                </button>

                <button
                  type="button"
                  onClick={
                    toggleRepeatAlbum
                  }
                  disabled={!tracks.length}
                  title="Replay full album"
                  className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                    repeatAlbum
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <Repeat size={18} />

                  <span className="hidden sm:inline">
                    Replay Album
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:px-8">
          {tracks.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-12 text-center">
              <Music2
                size={48}
                className="mx-auto mb-4 text-slate-600"
              />

              <h2 className="text-lg font-semibold text-white">
                No tracks yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                This album doesn't contain any
                songs.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40">
              <div className="grid grid-cols-[48px_1fr_80px] items-center gap-4 border-b border-slate-800/70 px-5 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                <div>#</div>

                <div>Title</div>

                <div className="flex justify-end">
                  <Clock3 size={15} />
                </div>
              </div>

              {tracks.map((track, index) => {
                const isCurrent =
                  currentTrackIndex ===
                  index;

                return (
                  <button
                    key={track._id}
                    type="button"
                    onClick={() =>
                      playTrack(index)
                    }
                    className={`group grid w-full grid-cols-[48px_1fr_80px] items-center gap-4 border-b border-slate-800/40 px-5 py-4 text-left transition last:border-b-0 ${
                      isCurrent
                        ? "bg-emerald-400/[0.08]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {isCurrent &&
                      isPlaying ? (
                        <div className="flex items-end gap-[3px]">
                          <span className="h-3 w-[3px] animate-pulse rounded-full bg-emerald-400" />

                          <span className="h-5 w-[3px] animate-pulse rounded-full bg-emerald-400 [animation-delay:150ms]" />

                          <span className="h-4 w-[3px] animate-pulse rounded-full bg-emerald-400 [animation-delay:300ms]" />
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-slate-500 group-hover:hidden">
                            {track.trackNumber ||
                              index + 1}
                          </span>

                          <Play
                            size={17}
                            fill="currentColor"
                            className="hidden text-emerald-400 group-hover:block"
                          />
                        </>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-semibold transition ${
                          isCurrent
                            ? "text-emerald-400"
                            : "text-slate-100 group-hover:text-emerald-400"
                        }`}
                      >
                        {track.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {track.artist ||
                          album.artist}
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      {formatDuration(
                        track.duration
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {currentTrack && (
        <div className="fixed bottom-0 left-64 right-0 z-50 border-t border-slate-800/80 bg-[#090d14]/95 px-5 py-4 shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 text-right text-[11px] text-slate-500">
                {formatPlayerTime(
                  currentTime
                )}
              </span>

              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
                className="h-1 flex-1 cursor-pointer accent-emerald-400"
              />

              <span className="w-10 text-[11px] text-slate-500">
                {formatPlayerTime(
                  duration
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music2
                        size={20}
                        className="text-slate-500"
                      />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentTrack.title}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {currentTrack.artist ||
                      album.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={playPrevious}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white"
                  title="Previous track"
                >
                  <SkipBack
                    size={18}
                    fill="currentColor"
                  />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-slate-950 transition hover:scale-105 hover:bg-emerald-300"
                  title={
                    isPlaying
                      ? "Pause"
                      : "Play"
                  }
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
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={playNext}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white"
                  title="Next track"
                >
                  <SkipForward
                    size={18}
                    fill="currentColor"
                  />
                </button>
              </div>

              <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-slate-400 transition hover:text-white"
                  title={
                    volume === 0
                      ? "Unmute"
                      : "Mute"
                  }
                >
                  {volume === 0 ? (
                    <VolumeX size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </button>

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
                  className="w-24 cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {(shuffle || repeatAlbum) && (
              <div className="flex items-center justify-center gap-3 text-[11px] font-medium">
                {shuffle && (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Shuffle size={13} />
                    Shuffle Album
                  </span>
                )}

                {repeatAlbum && (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Repeat size={13} />
                    Replay Album
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}