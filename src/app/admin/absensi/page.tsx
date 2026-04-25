"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";

type Student = { id: string; name: string; kelas: string; createdAt: string };
type Record = { id: string; date: string; time: string; status: string; student: { name: string; kelas: string } };

export default function AdminAbsensi() {
  const [tab, setTab] = useState<"students" | "records" | "settings">("records");
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [attLat, setAttLat] = useState("");
  const [attLng, setAttLng] = useState("");
  const [attRadius, setAttRadius] = useState("100");

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/absensi/students");
    setStudents(await res.json());
  }, []);

  const fetchRecords = useCallback(async () => {
    const res = await fetch(`/api/absensi/records?date=${dateFilter}`);
    setRecords(await res.json());
  }, [dateFilter]);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/config");
    const cfg = await res.json();
    setAttLat(cfg.attendance_lat || "");
    setAttLng(cfg.attendance_lng || "");
    setAttRadius(cfg.attendance_radius || "100");
  }, []);

  useEffect(() => {
    Promise.all([fetchStudents(), fetchRecords(), fetchSettings()]).then(() => setLoading(false));
  }, [fetchStudents, fetchRecords, fetchSettings]);

  useEffect(() => { fetchRecords(); }, [dateFilter, fetchRecords]);

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
        <p className="text-blue-700 text-sm mt-1">Kelola siswa terdaftar, riwayat kehadiran, dan lokasi absensi.</p>
      </div>

      <div className="flex bg-blue-50 rounded-2xl p-1.5 border border-blue-100">
        {[
          { key: "records", label: "Riwayat", icon: "history" },
          { key: "students", label: "Siswa", icon: "groups" },
          { key: "settings", label: "Pengaturan", icon: "settings" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${tab === t.key ? "bg-blue-700 text-white shadow-lg" : "text-blue-700 hover:bg-blue-100"}`}>
            <span className="material-symbols-outlined text-lg">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === "records" && (
        <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
          <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-700">calendar_today</span>
              <h2 className="text-lg font-extrabold text-blue-950">Riwayat Kehadiran</h2>
            </div>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-blue-200 text-sm text-blue-900 outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="p-6">
            {records.length === 0 ? (
              <div className="text-center py-12 text-blue-400">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">event_busy</span>
                <p className="font-bold">Belum ada kehadiran pada tanggal ini.</p>
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

      {/* Students Tab */}
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
              <p className="text-[10px] text-blue-500">Buka Google Maps â†’ klik lokasi sekolah â†’ salin link dari browser â†’ tempel di sini.</p>
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
