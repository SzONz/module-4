import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/components/Sidebar";

export default function MainLayout({ playlists = [] }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to get user"
          );
        }

        setCurrentUser(data.user);
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );
      }
    }

    fetchCurrentUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar
        playlists={playlists}
        currentUser={currentUser}
      />

      <main className="min-h-screen pl-64">
        <Outlet />
      </main>
    </div>
  );
}