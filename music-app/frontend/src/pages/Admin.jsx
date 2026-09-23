import { useEffect, useState } from "react";
import {
  Users,
  Music,
  Disc3,
  Trash2,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [music, setMusic] = useState([]);
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);

    try {
      const [usersResponse, musicResponse, albumsResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/admin/users", {
            credentials: "include",
          }),

          fetch("http://localhost:5000/api/admin/music", {
            credentials: "include",
          }),

          fetch("http://localhost:5000/api/admin/albums", {
            credentials: "include",
          }),
        ]);

      const usersData = await usersResponse.json();
      const musicData = await musicResponse.json();
      const albumsData = await albumsResponse.json();

      if (!usersResponse.ok) {
        throw new Error(
          usersData.message || "Failed to load users"
        );
      }

      if (!musicResponse.ok) {
        throw new Error(
          musicData.message || "Failed to load music"
        );
      }

      if (!albumsResponse.ok) {
        throw new Error(
          albumsData.message || "Failed to load albums"
        );
      }

      setUsers(usersData.users || []);
      setMusic(musicData.music || []);
      setAlbums(albumsData.albums || []);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;

    const { type, item } = deleteTarget;

    let url = "";

    if (type === "user") {
      url = `http://localhost:5000/api/admin/users/${item._id}`;
    }

    if (type === "music") {
      url = `http://localhost:5000/api/music/${item._id}`;
    }

    if (type === "album") {
      url = `http://localhost:5000/api/albums/${item._id}`;
    }

    setDeleting(`${type}-${item._id}`);

    try {
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete item"
        );
      }

      if (type === "user") {
        setUsers((previous) =>
          previous.filter(
            (user) => user._id !== item._id
          )
        );
      }

      if (type === "music") {
        setMusic((previous) =>
          previous.filter(
            (song) => song._id !== item._id
          )
        );
      }

      if (type === "album") {
        setAlbums((previous) =>
          previous.filter(
            (album) => album._id !== item._id
          )
        );

        // Album deletion also deletes its tracks.
        setMusic((previous) =>
          previous.filter(
            (song) =>
              String(song.albumId) !==
              String(item._id)
          )
        );
      }

      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    } finally {
      setDeleting(null);
    }
  };

  const openDelete = (type, item) => {
    setDeleteTarget({
      type,
      item,
    });
  };

  const getUploadedByName = (item) => {
    if (!item.uploadedBy) {
      return "Unknown user";
    }

    if (typeof item.uploadedBy === "object") {
      return (
        item.uploadedBy.username ||
        item.uploadedBy.email ||
        "Unknown user"
      );
    }

    return "Unknown user";
  };

  return (
    <main className="min-h-screen bg-[#0b0f17] px-6 py-10 text-slate-100 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>

              <p className="text-sm text-slate-400">
                Manage Soundly users, music, and albums.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "users"
                ? "bg-emerald-400 text-black"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users size={18} />
            Users
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("music")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "music"
                ? "bg-emerald-400 text-black"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Music size={18} />
            Music
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">
              {music.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("albums")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "albums"
                ? "bg-emerald-400 text-black"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Disc3 size={18} />
            Albums
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">
              {albums.length}
            </span>
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-emerald-400"
              />
            </div>
          ) : (
            <>
              {activeTab === "users" && (
                <div>
                  <div className="border-b border-white/10 px-6 py-5">
                    <h2 className="text-xl font-semibold">
                      All Users
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Every registered Soundly account.
                    </p>
                  </div>

                  {users.length === 0 ? (
                    <EmptyState text="No users found." />
                  ) : (
                    <div className="divide-y divide-white/5">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          className="flex flex-col gap-4 px-6 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-300">
                              {user.username
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">
                                  {user.username}
                                </h3>

                                {user.role === "admin" && (
                                  <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                                    Admin
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {user.role !== "admin" && (
                            <DeleteButton
                              onClick={() =>
                                openDelete(
                                  "user",
                                  user
                                )
                              }
                              loading={
                                deleting ===
                                `user-${user._id}`
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "music" && (
                <div>
                  <div className="border-b border-white/10 px-6 py-5">
                    <h2 className="text-xl font-semibold">
                      All Music
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Every uploaded standalone song and album track.
                    </p>
                  </div>

                  {music.length === 0 ? (
                    <EmptyState text="No music found." />
                  ) : (
                    <div className="divide-y divide-white/5">
                      {music.map((song) => (
                        <div
                          key={song._id}
                          className="flex flex-col gap-4 px-6 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-white">
                              {song.title}
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                              {song.artist}
                              {song.album
                                ? ` • ${song.album}`
                                : ""}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              Uploaded by{" "}
                              {getUploadedByName(
                                song
                              )}
                            </p>
                          </div>

                          <DeleteButton
                            onClick={() =>
                              openDelete(
                                "music",
                                song
                              )
                            }
                            loading={
                              deleting ===
                              `music-${song._id}`
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "albums" && (
                <div>
                  <div className="border-b border-white/10 px-6 py-5">
                    <h2 className="text-xl font-semibold">
                      All Albums
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Every album uploaded to Soundly.
                    </p>
                  </div>

                  {albums.length === 0 ? (
                    <EmptyState text="No albums found." />
                  ) : (
                    <div className="divide-y divide-white/5">
                      {albums.map((album) => (
                        <div
                          key={album._id}
                          className="flex flex-col gap-4 px-6 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-white">
                              {album.title}
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                              {album.artist}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {album.genre || "Other"}
                              {" • "}
                              Uploaded by{" "}
                              {getUploadedByName(
                                album
                              )}
                            </p>
                          </div>

                          <DeleteButton
                            onClick={() =>
                              openDelete(
                                "album",
                                album
                              )
                            }
                            loading={
                              deleting ===
                              `album-${album._id}`
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-xl font-bold text-white">
              Delete this {deleteTarget.type}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              This action cannot be undone.
              {deleteTarget.type === "album" &&
                " Deleting the album will also delete its tracks and files."}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteItem}
                disabled={!!deleting}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DeleteButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}

      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">
      {text}
    </div>
  );
}