import { useEffect, useState } from "react";
import {
  Home,
  Search,
  Compass,
  Upload,
  Music2,
  User,
  LogOut,
  Plus,
  X,
  ShieldCheck,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function Sidebar({
  playlists: initialPlaylists = [],
  currentUser = null,
}) {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState(initialPlaylists);

  const [showCreatePlaylist, setShowCreatePlaylist] =
    useState(false);

  const [playlistName, setPlaylistName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState("");

  useEffect(() => {
    setPlaylists(initialPlaylists);
  }, [initialPlaylists]);

  useEffect(() => {
    async function loadPlaylists() {
      try {
        const response = await fetch(
          `${API_URL}/api/playlists/my-playlists`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.success) {
          setPlaylists(data.playlists || []);
        }
      } catch (error) {
        console.error("Failed to load playlists:", error);
      }
    }

    loadPlaylists();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async function handleCreatePlaylist(event) {
    event.preventDefault();

    const name = playlistName.trim();

    if (!name) {
      setPlaylistError("Please enter a playlist name.");
      return;
    }

    try {
      setCreatingPlaylist(true);
      setPlaylistError("");

      const response = await fetch(
        `${API_URL}/api/playlists`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create playlist"
        );
      }

      if (data.success && data.playlist) {
        setPlaylists((previous) => [
          data.playlist,
          ...previous,
        ]);

        setPlaylistName("");
        setShowCreatePlaylist(false);

        navigate(`/playlist/${data.playlist._id}`);
      }
    } catch (error) {
      console.error("Create playlist error:", error);
      setPlaylistError(
        error.message || "Failed to create playlist"
      );
    } finally {
      setCreatingPlaylist(false);
    }
  }

  function closeCreatePlaylist() {
    if (creatingPlaylist) return;

    setShowCreatePlaylist(false);
    setPlaylistName("");
    setPlaylistError("");
  }

  const navItems = [
    {
      label: "Home",
      path: "/home",
      icon: Home,
    },
    {
      label: "Search",
      path: "/search",
      icon: Search,
    },
    {
      label: "Explore",
      path: "/explore",
      icon: Compass,
    },
    {
      label: "Upload Music",
      path: "/upload",
      icon: Upload,
    },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
        <div className="flex h-20 items-center px-6">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
              <Music2 className="h-5 w-5 text-slate-950" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Soundly
            </span>
          </button>
        </div>

        <nav className="px-3">
          <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            Menu
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {currentUser?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </NavLink>
            )}
          </div>
        </nav>

        <div className="mt-8 min-h-0 flex-1 overflow-hidden px-3">
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Playlists
            </p>

            <button
              type="button"
              onClick={() => {
                setPlaylistError("");
                setPlaylistName("");
                setShowCreatePlaylist(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-white"
              title="Create playlist"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="h-full overflow-y-auto">
            {playlists.length > 0 ? (
              <div className="space-y-1">
                {playlists.map((playlist) => (
                  <button
                    key={
                      playlist._id ||
                      playlist.id ||
                      playlist.name
                    }
                    type="button"
                    onClick={() =>
                      navigate(`/playlist/${playlist._id}`)
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-900 hover:text-white"
                  >
                    <Music2 className="h-4 w-4 shrink-0" />

                    <span className="truncate">
                      {playlist.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3">
                <button
                  type="button"
                  onClick={() => {
                    setPlaylistError("");
                    setPlaylistName("");
                    setShowCreatePlaylist(true);
                  }}
                  className="text-left text-sm text-slate-700 transition hover:text-slate-400"
                >
                  No playlists yet
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800">
              <User className="h-4 w-4 text-slate-400" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {currentUser?.username ||
                  currentUser?.name ||
                  "Soundly User"}
              </p>

              <p className="truncate text-xs text-slate-600">
                {currentUser?.email || "Music listener"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {showCreatePlaylist && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={closeCreatePlaylist}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Create playlist
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Give your new playlist a name.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreatePlaylist}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist}>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Playlist name
              </label>

              <input
                type="text"
                value={playlistName}
                onChange={(event) => {
                  setPlaylistName(event.target.value);
                  setPlaylistError("");
                }}
                placeholder="My playlist"
                maxLength={100}
                autoFocus
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
              />

              {playlistError && (
                <p className="mt-2 text-sm text-red-400">
                  {playlistError}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreatePlaylist}
                  disabled={creatingPlaylist}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingPlaylist ||
                    !playlistName.trim()
                  }
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingPlaylist
                    ? "Creating..."
                    : "Create playlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
