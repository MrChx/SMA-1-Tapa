"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";

type Member = { id: string; category: string; name: string; role: string; photoUrl: string | null };

export default function AdminDirektori() {
  const [activeTab, setActiveTab] = useState<"Guru" | "Staf" | "Siswa">("Guru");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formId, setFormId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/direktori");
    setMembers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const filtered = members.filter((m) => m.category === activeTab);

  const handleOpenAdd = () => { setModalMode("create"); setFormId(null); setFormName(""); setFormRole(""); setFormPhoto(null); setIsModalOpen(true); };
  const handleOpenEdit = (m: Member) => { setModalMode("edit"); setFormId(m.id); setFormName(m.name); setFormRole(m.role); setFormPhoto(m.photoUrl); setIsModalOpen(true); };
  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Data?",
      message: "Data yang dihapus tidak dapat dikembalikan lagi."
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/direktori/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Data dihapus", "Berhasil menghapus dari direktori.");
      fetchMembers();
    } catch {
      showToast("error", "Gagal menghapus", "Terjadi kesalahan.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData();      
    fd.append("file", e.target.files[0]);
    fd.append("folder", "direktori");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setFormPhoto(data.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { category: activeTab, name: formName, role: formRole, photoUrl: formPhoto };
    try {
      let res;
      if (modalMode === "create") {
        res = await fetch("/api/direktori", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        res = await fetch(`/api/direktori/${formId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      if (!res.ok) throw new Error();
      showToast("success", modalMode === "create" ? "Data ditambahkan" : "Data diperbarui", `${formName} berhasil disimpan.`);
      setIsModalOpen(false);
      fetchMembers();
    } catch {
      showToast("error", "Gagal menyimpan", "Periksa koneksi dan coba lagi.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Manajemen Direktori</h1>
          <p className="text-blue-700 text-sm mt-1">Kelola data dan profil Guru, Staf Jajaran, dan Siswa.</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-700/20 active:scale-95">
          <span className="material-symbols-outlined text-xl">person_add</span> Tambah Data
        </button>
      </div>

      <div className="bg-white border border-blue-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
        <div className="flex border-b border-blue-100 bg-blue-50/50">
          {(["Guru", "Staf", "Siswa"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-center font-bold text-sm md:text-base border-b-2 transition-all ${activeTab === tab ? "border-blue-700 text-blue-700 bg-white" : "border-transparent text-blue-500 hover:text-blue-700 hover:bg-blue-50"}`}>{tab}</button>
          ))}
        </div>
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2 text-sm">Memuat data...</p></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-white border-b border-blue-100 text-blue-400 uppercase tracking-widest text-[10px] font-bold"><th className="px-6 py-4">Profil</th><th className="px-6 py-4">Nama Lengkap</th><th className="px-6 py-4">Jabatan</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-blue-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="py-16 text-center text-blue-400"><div className="flex flex-col items-center gap-3"><span className="material-symbols-outlined text-5xl opacity-40">box</span><p className="font-medium text-sm">Belum ada data untuk <b>{activeTab}</b>.</p><button onClick={handleOpenAdd} className="text-blue-600 font-bold text-sm hover:underline mt-2">Tambahkan Sekarang</button></div></td></tr>
                ) : filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 w-20"><div className="w-12 h-12 rounded-xl overflow-hidden bg-blue-100 border border-blue-200">{m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-300">person</span></div>}</div></td>
                    <td className="px-6 py-4"><span className="font-extrabold text-blue-950">{m.name}</span></td>
                    <td className="px-6 py-4"><span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">{m.role}</span></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(m)} className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors border border-yellow-200 shadow-sm"><span className="material-symbols-outlined text-[20px] block">edit</span></button>
                      <button onClick={() => handleDelete(m.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-200 shadow-sm"><span className="material-symbols-outlined text-[20px] block">delete</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/30">
              <h2 className="text-xl font-extrabold text-blue-950">{modalMode === "create" ? `Tambah ${activeTab}` : `Edit ${activeTab}`}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-500 hover:text-blue-900 bg-white p-1 rounded-lg border border-blue-100 shadow-sm"><span className="material-symbols-outlined block">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="flex flex-col items-center space-y-4 pt-2">
                <div onClick={() => document.getElementById("photo-upload")?.click()} className="relative w-28 h-28 rounded-[2rem] border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition-all overflow-hidden group">
                  {formPhoto ? <><img src={formPhoto} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-white">border_color</span></div></> : <><span className="material-symbols-outlined text-blue-400 text-3xl mb-1">add_photo_alternate</span><span className="text-[10px] font-bold uppercase text-blue-600">Unggah Foto</span></>}
                </div>
                <input type="file" id="photo-upload" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Nama Lengkap & Gelar</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" placeholder="Contoh: Dra. Sri Mulyani" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Jabatan Terkini</label>
                <input type="text" value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" placeholder="Contoh: Guru Bahasa Indonesia" required />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-blue-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full font-bold text-blue-600 hover:bg-blue-50 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-700/25">{saving ? "Menyimpan..." : "Simpan Data"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
