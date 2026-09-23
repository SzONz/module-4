import { useEffect, useState } from "react";
import { ListPlus, X, Check, Loader2 } from "lucide-react";

const API_URL = "http://localhost:5000";

export default function AddToPlaylistButton({
  songIds = [],
  label = "Add to playlist",
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingPlaylistId, setAddingPlaylistId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const validSongIds = songIds.filter(Boolean);

  useEffect(() => {
    if (!open) return;

    async function loadPlaylists() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/playlists/my-playlists`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load playlists"
          );
        }

        setPlaylists(data.playlists || []);
      } catch (err) {
        console.error("Failed to load playlists:", err);
        setError(
          err.message || "Failed to load your playlists"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [open]);

  async function addToPlaylist(playlistId) {
    if (!validSongIds.length) return;

    try {
      setAddingPlaylistId(playlistId);
      setError("");
      setMessage("");

      let addedCount = 0;
      let skippedCount = 0;

      for (const songId of validSongIds) {
        const response = await fetch(
          `${API_URL}/api/playlists/${playlistId}/songs`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              songId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to add song"
          );
        }

        if (data.message?.toLowerCase().includes("already")) {
          skippedCount++;
        } else {
          addedCount++;
        }
      }

      if (validSongIds.length === 1) {
        if (addedCount > 0) {
          setMessage("Song added to playlist.");
        } else {
          setMessage("Song is already in this playlist.");
        }
      } else {
        if (addedCount === validSongIds.length) {
          setMessage(
            `${addedCount} songs added to playlist.`
          );
        } else if (addedCount > 0) {
          setMessage(
            `${addedCount} songs added. ${
              skippedCount
            } were already in the playlist.`
          );
        } else {
          setMessage(
            "All songs are already in this playlist."
          );
        }
      }

      setTimeout(() => {
        setOpen(false);
        setMessage("");
      }, 1200);
    } catch (err) {
      console.error("Add to playlist error:", err);
      setError(
        err.message || "Failed to add songs to playlist"
      );
    } finally {
      setAddingPlaylistId(null);
    }
  }

  function closeModal() {
    if (addingPlaylistId) return;

    setOpen(false);
    setError("");
    setMessage("");
  }

  if (!validSongIds.length) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setMessage("");
          setOpen(true);
        }}
        className={
          compact
            ? "flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-emerald-400/40 hover:text-emerald-400"
            : "flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-400"
        }
        title={compact ? label : undefined}
      >
        <ListPlus size={compact ? 18 : 17} />
        {!compact && label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={closeModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Add to playlist
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {validSongIds.length === 1
                    ? "Choose a playlist for this song."
                    : `Choose a playlist for ${validSongIds.length} songs.`}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-3">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    size={22}
                    className="animate-spin text-emerald-400"
                  />
                </div>
              ) : playlists.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <ListPlus
                    size={32}
                    className="mx-auto text-slate-700"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    No playlists yet
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Create a playlist from the sidebar first.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {playlists.map((playlist) => {
                    const isAdding =
                      addingPlaylistId === playlist._id;

                    return (
                      <button
                        key={playlist._id}
                        type="button"
                        disabled={!!addingPlaylistId}
                        onClick={() =>
                          addToPlaylist(playlist._id)
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-emerald-400">
                          <ListPlus size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {playlist.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {playlist.songs?.length || 0} songs
                          </p>
                        </div>

                        {isAdding && (
                          <Loader2
                            size={18}
                            className="animate-spin text-emerald-400"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="mx-2 mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {message && (
                <div className="mx-2 mt-2 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  <Check size={16} />
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}