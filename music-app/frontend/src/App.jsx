import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import UploadMusic from "./pages/Upload";
import Search from "./pages/Search";
import Song from "./pages/Song";
import Album from "./pages/Album";
import Artist from "./pages/Artist";
import Admin from "./pages/Admin";
import Explore from "./pages/Explore";
import Playlist from "./pages/Playlist";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/upload" element={<UploadMusic />} />
          <Route path="/explore" element={<Explore />} />

          <Route path="/song/:id" element={<Song />} />
          <Route path="/album/:id" element={<Album />} />
          <Route path="/artist/:artistName" element={<Artist />} />
          <Route path="/playlist/:id" element={<Playlist />} />\

          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}