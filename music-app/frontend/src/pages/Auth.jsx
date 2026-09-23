import { useState } from "react";

import {
    Music2,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function Auth() {
    const [mode, setMode] = useState("login");
    const [showPassword, setShowPassword] = useState(false);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isLogin = mode === "login";

    function changeMode(newMode) {
        setMode(newMode);

        setError("");
        setSuccess("");

        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!isLogin) {
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }

            if (password.length < 8) {
                setError("Password must be at least 8 characters.");
                return;
            }
        }

        setLoading(true);

        try {
            const endpoint = isLogin
                ? "/api/auth/login"
                : "/api/auth/signup";

            const body = isLogin
                ? {
                    email,
                    password,
                }
                : {
                    username,
                    email,
                    password,
                    confirmPassword,
                };

            const response = await fetch(
                `${API_URL}${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(body),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Something went wrong."
                );
            }

            console.log("User:", data.user);

            setPassword("");
            setConfirmPassword("");

            window.location.href = "/home";

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#080808] text-white">


        <div className="pointer-events-none fixed inset-0 overflow-hidden">

            <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-green-500/10 blur-[120px]" />

            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[120px]" />

        </div>


        <div className="relative flex min-h-screen items-center justify-center">

            <section className="flex w-full items-center justify-center px-6 py-10">

            <div className="w-full max-w-[420px]">


                <div className="mb-10 flex items-center justify-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500 text-black">

                    <Music2 size={23} />

                </div>

                <span className="text-xl font-bold">
                    Soundly
                </span>

                </div>


                <div className="mb-8 text-center">

                <h2 className="text-3xl font-bold tracking-tight">

                    {isLogin
                    ? "Welcome back"
                    : "Create an account"}

                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">

                    {isLogin
                    ? "Sign in to continue to your music."
                    : "Start discovering music you love."}

                </p>

                </div>


                <div className="mb-8 grid grid-cols-2 rounded-xl bg-zinc-900 p-1">

                <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className={`rounded-lg py-2.5 text-sm font-medium transition ${
                    isLogin
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    Login
                </button>


                <button
                    type="button"
                    onClick={() => changeMode("signup")}
                    className={`rounded-lg py-2.5 text-sm font-medium transition ${
                    !isLogin
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    Sign Up
                </button>

                </div>


                {error && (

                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">

                    {error}

                </div>

                )}


                {success && (

                <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">

                    {success}

                </div>

                )}


                <form
                onSubmit={handleSubmit}
                className="space-y-5"
                >


                {!isLogin && (

                    <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Username
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 transition focus-within:border-green-500">

                        <User
                        size={18}
                        className="text-zinc-600"
                        />

                        <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        placeholder="Your username"
                        required
                        className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                        />

                    </div>

                    </div>

                )}


                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Email
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 transition focus-within:border-green-500">

                    <Mail
                        size={18}
                        className="text-zinc-600"
                    />

                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) =>
                        setEmail(e.target.value)
                        }
                        placeholder="you@example.com"
                        required
                        className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                    />

                    </div>

                </div>


                <div>

                    <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-medium text-zinc-300">
                        Password
                    </label>

                    {isLogin && (

                        <button
                        type="button"
                        className="text-xs font-medium text-green-500 transition hover:text-green-400"
                        >
                        Forgot password?
                        </button>

                    )}

                    </div>


                    <div className="flex h-12 items-center rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 transition focus-within:border-green-500">

                    <Lock
                        size={18}
                        className="text-zinc-600"
                    />

                    <input
                        type={
                        showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={password}
                        onChange={(e) =>
                        setPassword(e.target.value)
                        }
                        placeholder="Your password"
                        required
                        className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                    />


                    <button
                        type="button"
                        onClick={() =>
                        setShowPassword(!showPassword)
                        }
                        className="text-zinc-600 transition hover:text-zinc-300"
                    >

                        {showPassword ? (
                        <EyeOff size={18} />
                        ) : (
                        <Eye size={18} />
                        )}

                    </button>

                    </div>

                </div>


                {!isLogin && (

                    <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Confirm Password
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 transition focus-within:border-green-500">

                        <Lock
                        size={18}
                        className="text-zinc-600"
                        />

                        <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(
                            e.target.value
                            )
                        }
                        placeholder="Confirm your password"
                        required
                        className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                        />

                    </div>

                    </div>

                )}


                {isLogin && (

                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500">

                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-green-500"
                    />

                    Remember me

                    </label>

                )}


                <button
                    type="submit"
                    disabled={loading}
                    className="group flex mt-10 h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-black transition hover:bg-green-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >

                    {loading
                    ? "Please wait..."
                    : isLogin
                        ? "Sign In"
                        : "Create Account"}

                    {!loading && (

                    <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                    />

                    )}

                </button>

                </form>


                <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-zinc-800" />

                <span className="text-[11px] font-medium text-zinc-600">
                    OR
                </span>

                <div className="h-px flex-1 bg-zinc-800" />

                </div>


                <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
                >

                <span className="text-base font-bold">
                    G
                </span>

                Continue with Google

                </button>


                <p className="mt-8 text-center text-xs leading-5 text-zinc-600">

                By continuing, you agree to our{" "}

                <button
                    type="button"
                    className="text-zinc-400 transition hover:text-white"
                >
                    Terms
                </button>

                {" "}and{" "}

                <button
                    type="button"
                    className="text-zinc-400 transition hover:text-white"
                >
                    Privacy Policy
                </button>

                </p>

            </div>

            </section>

        </div>

        </main>
    );
}