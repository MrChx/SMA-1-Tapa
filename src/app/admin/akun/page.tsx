"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

type AdminUser = { id: string; name: string; email: string; role: string; createdAt: string };

export default function AdminAkun() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("SUPER_ADMIN");
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/akun");
      if (res.status === 403) {
        router.push("/admin");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        showToast("error", "Gagal Memuat", err.error || "Tidak dapat memuat data akun.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAdmins(data);
    } catch (e: any) {
      showToast("error", "Gagal Memuat", "Tidak dapat terhubung ke server.");
    }
    setLoading(false);
  }, [router, showToast]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleOpenAdd = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("SUPER_ADMIN");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Akun?",
      message: `Akun "${name}" akan dihapus permanen dan tidak bisa login lagi.`
    });
    if (!isConfirmed) return;

    try {
      const res = await authFetch(`/api/admin/akun/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("success", "Akun dihapus", "Data akun berhasil dihapus.");
      fetchAdmins();
    } catch (e: any) {
      showToast("error", "Gagal", e.message || "Gagal menghapus akun.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await authFetch("/api/admin/akun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, email: formEmail, password: formPassword, role: formRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("success", "Berhasil", "Akun berhasil dibuat.");
      setIsModalOpen(false);
      fetchAdmins();
    } catch (e: any) {
      showToast("error", "Gagal", e.message || "Gagal membuat akun.");
    }

    setSaving(false);
  };

  if (loading) return <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2">Memuat...</p></div>;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Manajemen Akun Admin</h1>
          <p className="text-blue-700 text-sm mt-1">Kelola akses admin utama dan admin khusus organisasi.</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-700/20 active:scale-95">
          <span className="material-symbols-outlined text-xl">person_add</span> Tambah Akun
        </button>
      </div>

      <div className="bg-white border border-blue-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-full min-h-[500px] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-100 text-blue-400 uppercase tracking-widest text-[10px] font-bold">
                <th className="px-4 py-4">Nama Lengkap</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Akses / Role</th>
                <th className="px-4 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {admins.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-blue-400"><p className="font-medium text-sm">Belum ada akun.</p></td></tr>
              ) : admins.map((m) => (
                <tr key={m.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-4"><span className="font-extrabold text-blue-950">{m.name}</span></td>
                  <td className="px-4 py-4"><span className="text-blue-700 font-medium">{m.email}</span></td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${m.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
                      {m.role === "SUPER_ADMIN" ? "Admin Utama" : `Admin ${m.role}`}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right space-x-2">
                    <button onClick={() => handleDelete(m.id, m.name)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-200 shadow-sm"><span className="material-symbols-outlined text-[20px] block">delete</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/30">
              <h2 className="text-xl font-extrabold text-blue-950">Tambah Akun Admin</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-500 hover:text-blue-900 bg-white p-1 rounded-lg border border-blue-100 shadow-sm"><span className="material-symbols-outlined block">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Nama Lengkap</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Email</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Password</label>
                <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" minLength={6} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Akses / Organisasi</label>
                <div className="relative">
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none appearance-none cursor-pointer" required>
                    <option value="SUPER_ADMIN">Admin Utama (Akses Semua)</option>
                    <option value="OSIS">Admin OSIS</option>
                    <option value="Rohis">Admin Rohis</option>
                    <option value="Pramuka">Admin Pramuka</option>
                    <option value="PMR">Admin PMR</option>
                    <option value="PIK-R">Admin PIK-R</option>
                  </select>
                  <span className="material-symbols-outlined text-blue-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-blue-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full font-bold text-blue-600 hover:bg-blue-50 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-700/25">{saving ? "Menyimpan..." : "Buat Akun"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
