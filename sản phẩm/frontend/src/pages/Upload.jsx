import { useEffect, useRef, useState } from "react";
import {
  Upload as UploadIcon,
  ImagePlus,
  Music,
  Disc3,
  X,
  GripVertical,
  ArrowLeft,
  Check,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
];

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function UploadMusic() {
  const navigate = useNavigate();

  const coverInputRef = useRef(null);
  const musicInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [uploadType, setUploadType] = useState("song");

  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [songFile, setSongFile] = useState(null);
  const [tracks, setTracks] = useState([]);

  const [form, setForm] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "Other",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load current user"
          );
        }

        setCurrentUser(data.user);

        setForm((previous) => ({
          ...previous,
          artist:
            previous.artist.trim() ||
            data.user.username ||
            "",
        }));
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );
      }
    }

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }

      tracks.forEach((track) => {
        if (track.previewUrl) {
          URL.revokeObjectURL(track.previewUrl);
        }
      });
    };
  }, []);

  function handleUploadTypeChange(type) {
    setUploadType(type);
    setError("");
    setSuccess("");

    removeCover();

    setSongFile(null);

    tracks.forEach((track) => {
      if (track.previewUrl) {
        URL.revokeObjectURL(track.previewUrl);
      }
    });

    setTracks([]);

    setForm((previous) => ({
      ...previous,
      title: "",
      album: "",
      description: "",
      artist: currentUser?.username || previous.artist,
    }));

    if (musicInputRef.current) {
      musicInputRef.current.value = "";
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleCoverChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Cover must be JPG, PNG, or WebP.");
      return;
    }

    setError("");

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function removeCover() {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCover(null);
    setCoverPreview(null);

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  }

  function handleSongChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!AUDIO_TYPES.includes(file.type)) {
      setError("Please select a supported audio file.");
      return;
    }

    setError("");

    setSongFile(file);

    if (!form.title.trim()) {
      const title = file.name.replace(/\.[^/.]+$/, "");

      setForm((previous) => ({
        ...previous,
        title,
      }));
    }

    if (musicInputRef.current) {
      musicInputRef.current.value = "";
    }
  }

  function removeSongFile() {
    setSongFile(null);
  }

  function handleMusicChange(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const invalidFile = files.find(
      (file) => !AUDIO_TYPES.includes(file.type)
    );

    if (invalidFile) {
      setError(
        `${invalidFile.name} is not a supported audio file.`
      );
      return;
    }

    setError("");

    const newTracks = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      file,
      title: file.name.replace(/\.[^/.]+$/, ""),
      previewUrl: URL.createObjectURL(file),
    }));

    setTracks((previous) => [
      ...previous,
      ...newTracks,
    ]);

    if (musicInputRef.current) {
      musicInputRef.current.value = "";
    }
  }

  function updateTrackTitle(id, title) {
    setTracks((previous) =>
      previous.map((track) =>
        track.id === id
          ? { ...track, title }
          : track
      )
    );
  }

  function removeTrack(id) {
    setTracks((previous) => {
      const track = previous.find(
        (item) => item.id === id
      );

      if (track?.previewUrl) {
        URL.revokeObjectURL(track.previewUrl);
      }

      return previous.filter(
        (item) => item.id !== id
      );
    });
  }

  function moveTrack(index, direction) {
    const newIndex = index + direction;

    if (
      newIndex < 0 ||
      newIndex >= tracks.length
    ) {
      return;
    }

    const updated = [...tracks];

    const temp = updated[index];

    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    setTracks(updated);
  }

  async function uploadSingleSong() {
    if (!songFile) {
      throw new Error("Please select a song.");
    }

    if (!form.title.trim()) {
      throw new Error(
        "Please enter a song title."
      );
    }

    if (!form.artist.trim()) {
      throw new Error(
        "Please enter the artist name."
      );
    }

    const formData = new FormData();

    formData.append("music", songFile);
    formData.append("title", form.title);
    formData.append("artist", form.artist);
    formData.append("album", form.album);
    formData.append("genre", form.genre);

    if (cover) {
      formData.append("background", cover);
    }

    const response = await fetch(
      `${API_URL}/api/music/upload`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      throw new Error(
        text ||
          `Upload failed with status ${response.status}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Song upload failed."
      );
    }

    return data;
  }

  async function uploadAlbum() {
    if (!form.title.trim()) {
      throw new Error(
        "Please enter an album title."
      );
    }

    if (!form.artist.trim()) {
      throw new Error(
        "Please enter the artist name."
      );
    }

    if (!tracks.length) {
      throw new Error(
        "Please add at least one song."
      );
    }

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("artist", form.artist);
    formData.append("genre", form.genre);
    formData.append(
      "description",
      form.description
    );

    if (cover) {
      formData.append("albumCover", cover);
    }

    const trackTitles = tracks.map(
      (track) => track.title
    );

    formData.append(
      "trackTitles",
      JSON.stringify(trackTitles)
    );

    tracks.forEach((track) => {
      formData.append("music", track.file);
    });

    const response = await fetch(
      `${API_URL}/api/albums/upload`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      throw new Error(
        text ||
          `Upload failed with status ${response.status}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Album upload failed."
      );
    }

    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (uploadType === "song") {
        await uploadSingleSong();

        setSuccess(
          "Song uploaded successfully!"
        );
      } else {
        await uploadAlbum();

        setSuccess(
          "Album uploaded successfully!"
        );
      }

      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }

      tracks.forEach((track) => {
        if (track.previewUrl) {
          URL.revokeObjectURL(track.previewUrl);
        }
      });

      setCover(null);
      setCoverPreview(null);
      setSongFile(null);
      setTracks([]);

      setForm({
        title: "",
        artist: currentUser?.username || "",
        album: "",
        genre: "Other",
        description: "",
      });

      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }

      if (musicInputRef.current) {
        musicInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.message || "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400";

  return (
    <div className="min-h-screen bg-slate-950 px-8 py-8 text-white">
      <div className="mx-auto max-w-5xl">

        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mb-8 flex items-center gap-2 text-slate-400 transition hover:text-emerald-400"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
              <UploadIcon size={24} />
            </div>

            <h1 className="text-3xl font-bold">
              Upload Music
            </h1>
          </div>

          <p className="text-slate-400">
            Upload a single song or an entire album
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <button
              type="button"
              onClick={() =>
                handleUploadTypeChange("song")
              }
              className={`flex items-center gap-4 rounded-xl border p-5 text-left transition ${
                uploadType === "song"
                  ? "border-emerald-400 bg-emerald-400/10"
                  : "border-slate-800 bg-slate-950 hover:border-slate-700"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  uploadType === "song"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-800 text-white"
                }`}
              >
                <Music size={24} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Upload a Song
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Upload one track
                </p>
              </div>

              {uploadType === "song" && (
                <Check
                  className="ml-auto text-emerald-400"
                  size={20}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleUploadTypeChange("album")
              }
              className={`flex items-center gap-4 rounded-xl border p-5 text-left transition ${
                uploadType === "album"
                  ? "border-emerald-400 bg-emerald-400/10"
                  : "border-slate-800 bg-slate-950 hover:border-slate-700"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  uploadType === "album"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-800 text-white"
                }`}
              >
                <Disc3 size={24} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Upload an Album
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Upload multiple tracks
                </p>
              </div>

              {uploadType === "album" && (
                <Check
                  className="ml-auto text-emerald-400"
                  size={20}
                />
              )}
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {uploadType === "song" && (
            <div className="space-y-8">

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="grid gap-8 md:grid-cols-[220px_1fr]">

                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-300">
                      Cover Image
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        coverInputRef.current?.click()
                      }
                      className="group relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 transition hover:border-emerald-400"
                    >
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Song cover"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 group-hover:text-emerald-400">
                          <ImagePlus size={36} />
                          <span className="text-sm">
                            Add cover
                          </span>
                        </div>
                      )}
                    </button>

                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverChange}
                      className="hidden"
                    />

                    {coverPreview && (
                      <button
                        type="button"
                        onClick={removeCover}
                        className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:border-red-500 hover:text-red-400"
                      >
                        Remove cover
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Song Title
                      </label>

                      <input
                        name="title"
                        value={form.title}
                        onChange={handleFormChange}
                        placeholder="Enter song title"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Artist
                      </label>

                      <input
                        name="artist"
                        value={form.artist}
                        onChange={handleFormChange}
                        placeholder={
                          currentUser?.username ||
                          "Artist name"
                        }
                        className={inputClass}
                      />

                      {currentUser?.username && (
                        <p className="mt-2 text-xs text-slate-500">
                          Default artist:{" "}
                          <span className="text-emerald-400">
                            {currentUser.username}
                          </span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Album
                      </label>

                      <input
                        name="album"
                        value={form.album}
                        onChange={handleFormChange}
                        placeholder="Optional album name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Genre
                      </label>

                      <select
                        name="genre"
                        value={form.genre}
                        onChange={handleFormChange}
                        className={inputClass}
                      >
                        <option>Other</option>
                        <option>Pop</option>
                        <option>Rock</option>
                        <option>Hip-Hop</option>
                        <option>Rap</option>
                        <option>R&B</option>
                        <option>Electronic</option>
                        <option>Jazz</option>
                        <option>Classical</option>
                        <option>Country</option>
                        <option>Lo-Fi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <label className="mb-3 block text-sm font-medium text-slate-300">
                  Audio File
                </label>

                {!songFile ? (
                  <button
                    type="button"
                    onClick={() =>
                      musicInputRef.current?.click()
                    }
                    className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 px-6 py-12 transition hover:border-emerald-400"
                  >
                    <Music
                      size={42}
                      className="mb-4 text-emerald-400"
                    />

                    <p className="font-medium">
                      Choose your song
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      MP3, WAV, FLAC, M4A and more
                    </p>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
                      <Music size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {songFile.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {(
                          songFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeSongFile}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                <input
                  ref={musicInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleSongChange}
                  className="hidden"
                />
              </section>
            </div>
          )}

          {uploadType === "album" && (
            <div className="space-y-8">

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="grid gap-8 md:grid-cols-[220px_1fr]">

                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-300">
                      Album Cover
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        coverInputRef.current?.click()
                      }
                      className="group relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 transition hover:border-emerald-400"
                    >
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Album cover"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 group-hover:text-emerald-400">
                          <ImagePlus size={36} />
                          <span className="text-sm">
                            Add album cover
                          </span>
                        </div>
                      )}
                    </button>

                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverChange}
                      className="hidden"
                    />

                    {coverPreview && (
                      <button
                        type="button"
                        onClick={removeCover}
                        className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:border-red-500 hover:text-red-400"
                      >
                        Remove cover
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Album Title
                      </label>

                      <input
                        name="title"
                        value={form.title}
                        onChange={handleFormChange}
                        placeholder="Enter album title"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Artist
                      </label>

                      <input
                        name="artist"
                        value={form.artist}
                        onChange={handleFormChange}
                        placeholder={
                          currentUser?.username ||
                          "Artist name"
                        }
                        className={inputClass}
                      />

                      {currentUser?.username && (
                        <p className="mt-2 text-xs text-slate-500">
                          Default artist:{" "}
                          <span className="text-emerald-400">
                            {currentUser.username}
                          </span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Genre
                      </label>

                      <select
                        name="genre"
                        value={form.genre}
                        onChange={handleFormChange}
                        className={inputClass}
                      >
                        <option>Other</option>
                        <option>Pop</option>
                        <option>Rock</option>
                        <option>Hip-Hop</option>
                        <option>Rap</option>
                        <option>R&B</option>
                        <option>Electronic</option>
                        <option>Jazz</option>
                        <option>Classical</option>
                        <option>Country</option>
                        <option>Lo-Fi</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Description
                      </label>

                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleFormChange}
                        placeholder="Tell listeners about this album..."
                        rows={4}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Album Tracks
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add and arrange your songs
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-400">
                    {tracks.length}{" "}
                    {tracks.length === 1
                      ? "track"
                      : "tracks"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    musicInputRef.current?.click()
                  }
                  className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 px-6 py-8 transition hover:border-emerald-400"
                >
                  <Music
                    size={28}
                    className="text-emerald-400"
                  />

                  <div className="text-left">
                    <p className="font-medium">
                      Add songs
                    </p>

                    <p className="text-sm text-slate-500">
                      Select multiple audio files at once
                    </p>
                  </div>
                </button>

                <input
                  ref={musicInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleMusicChange}
                  className="hidden"
                />

                {tracks.length > 0 && (
                  <div className="space-y-3">
                    {tracks.map((track, index) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3"
                      >
                        <GripVertical
                          size={18}
                          className="shrink-0 text-slate-600"
                        />

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-sm font-bold text-slate-950">
                          {index + 1}
                        </div>

                        <input
                          value={track.title}
                          onChange={(event) =>
                            updateTrackTitle(
                              track.id,
                              event.target.value
                            )
                          }
                          className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                        />

                        <div className="hidden max-w-48 truncate text-xs text-slate-600 md:block">
                          {track.file.name}
                        </div>

                        <div className="flex items-center gap-1">

                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() =>
                              moveTrack(
                                index,
                                -1
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-20"
                          >
                            <ChevronUp size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={
                              index ===
                              tracks.length - 1
                            }
                            onClick={() =>
                              moveTrack(
                                index,
                                1
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-20"
                          >
                            <ChevronDown size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeTrack(track.id)
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon size={20} />

                {uploadType === "song"
                  ? "Upload Song"
                  : "Upload Album"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
