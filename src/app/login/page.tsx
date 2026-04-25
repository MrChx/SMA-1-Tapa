"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showReset, setShowReset] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
        setIsLoading(false);
        return;
      }
      router.push("/admin");
    } catch {
      setError("Terjadi kesalahan koneksi.");
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetMsg(data.error || "Gagal mengubah password.");
      } else {
        setResetMsg("✅ Password berhasil diubah! Silakan login kembali.");
        setOldPw("");
        setNewPw("");
      }
    } catch {
      setResetMsg("Kesalahan koneksi.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 blur-[100px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(23,91,184,0.08)] border border-blue-100 p-8 md:p-10 relative z-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-100">
            <Image src="/logo.png" alt="SMA 1 Tapa Logo" width={60} height={60} className="object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Portal Admin</h1>
          <p className="text-sm text-blue-700 mt-2">Masuk ke sistem manajemen SMA N 1 Tapa</p>
        </div>

        {!showReset ? (
          <>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl font-medium">{error}</div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Username atau Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-blue-400">person</span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sman1tapa.sch.id"
                    className="w-full pl-12 pr-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Kata Sandi</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-blue-400">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-4 rounded-full font-bold hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg shadow-blue-700/25 mt-4 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </button>
            </form>
            <button
              onClick={() => setShowReset(true)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-6 transition-colors"
            >
              Ubah Kata Sandi →
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <h2 className="text-lg font-extrabold text-blue-950 text-center">Reset Kata Sandi</h2>
              {resetMsg && (
                <div className={`text-sm px-4 py-3 rounded-2xl font-medium border ${resetMsg.startsWith("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                  {resetMsg}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Password Lama</label>
                <input
                  type="password"
                  value={oldPw}
                  onChange={(e) => setOldPw(e.target.value)}
                  className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Password Baru (min. 6 karakter)</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  minLength={6}
                  className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-4 rounded-full font-bold shadow-lg shadow-blue-700/25 flex justify-center items-center gap-2"
              >
                {resetLoading ? "Memproses..." : "Simpan Password Baru"}
              </button>
            </form>
            <button
              onClick={() => { setShowReset(false); setResetMsg(""); }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-6 transition-colors"
            >
              ← Kembali ke Login
            </button>
          </>
        )}

        <div className="mt-8 pt-8 border-t border-blue-50 text-center">
          <p className="text-xs text-blue-700">&copy; {new Date().getFullYear()} Sistem Informasi SMA Negeri 1 Tapa</p>
        </div>
      </div>
    </main>
  );
}
