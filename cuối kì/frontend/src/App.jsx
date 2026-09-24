import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";

import TeacherPage from "./pages/TeacherPage";
import PositionPage from "./pages/PositionPage";

function App() {
    return (
        <div className="min-h-screen bg-[#f4f5f7] flex flex-col font-sans">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-xs text-white">
                            🎓
                        </span>

                        <span>Technology School</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1 text-xs">
                        <NavLink
                            to="/teachers"
                            className={({ isActive }) =>
                                `rounded-md px-3 py-1.5 font-medium transition-colors ${
                                    isActive
                                        ? "bg-indigo-50 font-semibold text-indigo-600"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`
                            }
                        >
                            👨‍🏫 Giáo viên
                        </NavLink>

                        <NavLink
                            to="/positions"
                            className={({ isActive }) =>
                                `rounded-md px-3 py-1.5 font-medium transition-colors ${
                                    isActive
                                        ? "bg-indigo-50 font-semibold text-indigo-600"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`
                            }
                        >
                            💼 Vị trí công tác
                        </NavLink>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                        A
                    </div>

                    <span className="text-xs font-medium text-slate-700">
                        Admin
                    </span>
                </div>
            </header>

            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<TeacherPage />} />
                    <Route path="/teachers" element={<TeacherPage />} />
                    <Route path="/positions" element={<PositionPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
