"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";

type Student = { id: string; name: string; kelas: string; createdAt: string };
type Record = { id: string; date: string; time: string; status: string; student: { name: string; kelas: string } };
type KelasItem = { id: string; name: string };

export default function AdminAbsensi() {
  const [tab, setTab] = useState<"records" | "students" | "kelas" | "settings">("records");
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [kelasFilter, setKelasFilter] = useState("");
  const { showToast } = useToast();
  const confirm = useConfirm();

  // Settings
  const [attLat, setAttLat] = useState("");
  const [attLng, setAttLng] = useState("");
  const [attRadius, setAttRadius] = useState("100");

  // Kelas form
  const [newKelasName, setNewKelasName] = useState("");
  const [addingKelas, setAddingKelas] = useState(false);

  const fetchKelasList = useCallback(async () => {
    const res = await fetch("/api/absensi/kelas");
    setKelasList(await res.json());
  }, []);

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/absensi/students");
    setStudents(await res.json());
  }, []);

  const fetchRecords = useCallback(async () => {
    const params = new URLSearchParams();
    if (dateFilter) params.set("date", dateFilter);
    if (kelasFilter) params.set("kelas", kelasFilter);
    const res = await fetch(`/api/absensi/records?${params}`);
    setRecords(await res.json());
  }, [dateFilter, kelasFilter]);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/config");
    const cfg = await res.json();
    setAttLat(cfg.attendance_lat || "");
    setAttLng(cfg.attendance_lng || "");
    setAttRadius(cfg.attendance_radius || "100");
  }, []);

  useEffect(() => {
    Promise.all([fetchKelasList(), fetchStudents(), fetchRecords(), fetchSettings()]).then(() => setLoading(false));
  }, [fetchKelasList, fetchStudents, fetchRecords, fetchSettings]);

  useEffect(() => { fetchRecords(); }, [dateFilter, kelasFilter, fetchRecords]);

  // ─── Kelas CRUD ───
  const handleAddKelas = async () => {
    if (!newKelasName.trim()) return;
    setAddingKelas(true);
    try {
      const res = await fetch("/api/absensi/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKelasName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("success", "Berhasil", `Kelas "${newKelasName.trim()}" berhasil ditambahkan.`);
      setNewKelasName("");
      fetchKelasList();
    } catch (e: any) {
      showToast("error", "Gagal", e.message || "Gagal menambahkan kelas.");
    } finally {
      setAddingKelas(false);
    }
  };

  const handleDeleteKelas = async (id: string, name: string) => {
    const ok = await confirm({ title: "Hapus Kelas?", message: `Kelas "${name}" akan dihapus. Siswa dengan kelas ini tidak akan terpengaruh.` });
    if (!ok) return;
    try {
      const res = await fetch(`/api/absensi/kelas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Berhasil", "Kelas berhasil dihapus.");
      fetchKelasList();
    } catch {
      showToast("error", "Gagal", "Gagal menghapus kelas.");
    }
  };

  // ─── Student CRUD ───
  const handleDeleteStudent = async (id: string) => {
    const ok = await confirm({ title: "Hapus Siswa?", message: "Semua data absensi siswa ini juga akan dihapus." });
    if (!ok) return;
    try {
      const res = await fetch(`/api/absensi/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Berhasil", "Siswa berhasil dihapus.");
      fetchStudents();
    } catch {
      showToast("error", "Gagal", "Gagal menghapus siswa.");
    }
  };

  // ─── Settings ───
  const saveSettings = async () => {
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance_lat: attLat, attendance_lng: attLng, attendance_radius: attRadius }),
      });
      if (!res.ok) throw new Error();
      showToast("success", "Tersimpan", "Pengaturan lokasi absensi berhasil disimpan.");
    } catch {
      showToast("error", "Gagal", "Gagal menyimpan pengaturan.");
    }
  };

  const parseGmapsLink = (link: string) => {
    const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      setAttLat(match[1]);
      setAttLng(match[2]);
      showToast("success", "Koordinat Ditemukan", `Lat: ${match[1]}, Lng: ${match[2]}`);
    } else {
      showToast("error", "Format Tidak Dikenali", "Tempel link Google Maps yang mengandung koordinat (@lat,lng).");
    }
  };

  if (loading) return <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2">Memuat...</p></div>;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Manajemen Absensi</h1>
        <p className="text-blue-700 text-sm mt-1">Kelola kelas, siswa terdaftar, riwayat kehadiran, dan lokasi absensi.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-blue-50 rounded-2xl p-1.5 border border-blue-100 overflow-x-auto">
        {[
          { key: "records", label: "Riwayat", icon: "history" },
          { key: "students", label: "Siswa", icon: "groups" },
          { key: "kelas", label: "Kelas", icon: "school" },
          { key: "settings", label: "Pengaturan", icon: "settings" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${tab === t.key ? "bg-blue-700 text-white shadow-lg" : "text-blue-700 hover:bg-blue-100"}`}>
            <span className="material-symbols-outlined text-lg">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ═══ RIWAYAT TAB ═══ */}
      {tab === "records" && (
        <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
          <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-700">calendar_today</span>
              <h2 className="text-lg font-extrabold text-blue-950">Riwayat Kehadiran</h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <select value={kelasFilter} onChange={(e) => setKelasFilter(e.target.value)} className="px-4 py-2 pr-8 rounded-xl border border-blue-200 text-sm text-blue-900 outline-none focus:ring-2 focus:ring-blue-300 appearance-none bg-white cursor-pointer">
                  <option value="">Semua Kelas</option>
                  {kelasList.map((k) => <option key={k.id} value={k.name}>{k.name}</option>)}
                </select>
                <span className="material-symbols-outlined text-blue-400 text-sm absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
              </div>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-blue-200 text-sm text-blue-900 outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div className="p-6">
            {records.length === 0 ? (
              <div className="text-center py-12 text-blue-400">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">event_busy</span>
                <p className="font-bold">Belum ada kehadiran{kelasFilter ? ` untuk kelas ${kelasFilter}` : ""} pada tanggal ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-blue-100 text-blue-600">
                    <th className="text-left py-3 px-4 font-bold">No</th>
                    <th className="text-left py-3 px-4 font-bold">Nama</th>
                    <th className="text-left py-3 px-4 font-bold">Kelas</th>
                    <th className="text-left py-3 px-4 font-bold">Waktu</th>
                    <th className="text-left py-3 px-4 font-bold">Status</th>
                  </tr></thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                        <td className="py-3 px-4 text-blue-400 font-bold">{i + 1}</td>
                        <td className="py-3 px-4 font-bold text-blue-950">{r.student.name}</td>
                        <td className="py-3 px-4 text-blue-700">{r.student.kelas}</td>
                        <td className="py-3 px-4 text-blue-600">{r.time}</td>
                        <td className="py-3 px-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-right text-xs text-blue-400 font-bold">Total: {records.length} siswa hadir</div>
          </div>
        </section>
      )}

      {/* ═══ SISWA TAB ═══ */}
      {tab === "students" && (
        <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
          <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-700">groups</span>
            <h2 className="text-lg font-extrabold text-blue-950">Siswa Terdaftar ({students.length})</h2>
          </div>
          <div className="p-6">
            {students.length === 0 ? (
              <div className="text-center py-12 text-blue-400">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">person_off</span>
                <p className="font-bold">Belum ada siswa yang terdaftar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-blue-950">{s.name}</p>
                        <p className="text-xs text-blue-600">Kelas {s.kelas}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteStudent(s.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ KELAS TAB ═══ */}
      {tab === "kelas" && (
        <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
          <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-700">school</span>
            <h2 className="text-lg font-extrabold text-blue-950">Manajemen Kelas ({kelasList.length})</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Add Class Form */}
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-600">Tambah Kelas Baru</label>
              <div className="flex gap-3">
                <input
                  value={newKelasName}
                  onChange={(e) => setNewKelasName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddKelas(); }}
                  placeholder="Contoh: X IPA 1, XI IPS 2, XII MIPA 3"
                  className="flex-1 px-5 py-3 rounded-xl border border-blue-200 outline-none text-sm text-blue-900 focus:ring-2 focus:ring-blue-300 bg-white"
                />
                <button onClick={handleAddKelas} disabled={addingKelas || !newKelasName.trim()} className="bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 active:scale-95 transition-all shrink-0 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add</span> Tambah
                </button>
              </div>
              <p className="text-[10px] text-blue-500">Kelas yang ditambahkan di sini akan muncul sebagai pilihan dropdown saat siswa melakukan registrasi absensi.</p>
            </div>

            {/* Class List */}
            {kelasList.length === 0 ? (
              <div className="text-center py-12 text-blue-400">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">school</span>
                <p className="font-bold">Belum ada kelas yang ditambahkan.</p>
                <p className="text-sm mt-1">Tambahkan kelas di atas agar siswa bisa memilih saat registrasi.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {kelasList.map((k) => (
                  <div key={k.id} className="flex items-center justify-between px-5 py-4 bg-blue-50/50 rounded-2xl border border-blue-100 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 text-lg">class</span>
                      </div>
                      <span className="font-bold text-blue-950">{k.name}</span>
                    </div>
                    <button onClick={() => handleDeleteKelas(k.id, k.name)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ SETTINGS TAB ═══ */}
      {tab === "settings" && (
        <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
          <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-700">location_on</span>
            <h2 className="text-lg font-extrabold text-blue-950">Lokasi Absensi</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-600">Tempel Link Google Maps</label>
              <div className="flex gap-3">
                <input id="gmaps-input" placeholder="https://maps.google.com/.../@-0.549,122.123,..." className="flex-1 px-5 py-3 rounded-xl border border-blue-200 outline-none text-sm text-blue-900 focus:ring-2 focus:ring-blue-300" />
                <button onClick={() => { const v = (document.getElementById("gmaps-input") as HTMLInputElement).value; parseGmapsLink(v); }} className="bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 active:scale-95 transition-all shrink-0">Ekstrak</button>
              </div>
              <p className="text-[10px] text-blue-500">Buka Google Maps → klik lokasi sekolah → salin link dari browser → tempel di sini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-600">Latitude</label>
                <input value={attLat} onChange={(e) => setAttLat(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-blue-50 border border-blue-100 outline-none text-blue-950 font-mono focus:ring-2 focus:ring-blue-300" placeholder="-0.549" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-600">Longitude</label>
                <input value={attLng} onChange={(e) => setAttLng(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-blue-50 border border-blue-100 outline-none text-blue-950 font-mono focus:ring-2 focus:ring-blue-300" placeholder="122.123" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-600">Radius (meter)</label>
                <input value={attRadius} onChange={(e) => setAttRadius(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-blue-50 border border-blue-100 outline-none text-blue-950 font-mono focus:ring-2 focus:ring-blue-300" placeholder="100" />
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={saveSettings} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-transform flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">save</span> Simpan Lokasi
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
