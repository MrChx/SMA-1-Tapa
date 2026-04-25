"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";

type GalleryItem = { id: string; category: string; title: string; summary: string; content: string; thumbnailUrl: string | null };

export default function AdminGaleri() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formId, setFormId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const fetchItems = useCallback(async () => { setLoading(true); const res = await fetch("/api/galeri"); setItems(await res.json()); setLoading(false); }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleOpenAdd = () => { setModalMode("create"); setFormId(null); setFormCategory(""); setFormTitle(""); setFormSummary(""); setFormContent(""); setFormPhoto(null); setIsModalOpen(true); };
  const handleOpenEdit = (i: GalleryItem) => { setModalMode("edit"); setFormId(i.id); setFormCategory(i.category); setFormTitle(i.title); setFormSummary(i.summary); setFormContent(i.content); setFormPhoto(i.thumbnailUrl); setIsModalOpen(true); };
  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Kegiatan?",
      message: "Dokumentasi kegiatan ini akan dihapus secara permanen."
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/galeri/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Kegiatan dihapus", "Dokumentasi berhasil dihapus.");
      fetchItems();
    } catch {
      showToast("error", "Gagal menghapus", "Terjadi kesalahan saat menghapus.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData(); fd.append("file", e.target.files[0]); fd.append("folder", "galeri");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setFormPhoto(data.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const body = { category: formCategory, title: formTitle, summary: formSummary, content: formContent, thumbnailUrl: formPhoto };
    try {
      let res;
      if (modalMode === "create") { res = await fetch("/api/galeri", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
      else { res = await fetch(`/api/galeri/${formId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
      if (!res.ok) throw new Error();
      showToast("success", modalMode === "create" ? "Kegiatan ditambahkan" : "Kegiatan diperbarui", `"${formTitle}" berhasil disimpan.`);
      setIsModalOpen(false);
      fetchItems();
    } catch {
      showToast("error", "Gagal menyimpan", "Periksa koneksi dan coba lagi.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div><h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Manajemen Galeri Kegiatan</h1><p className="text-blue-700 text-sm mt-1">Kelola arsip dokumentasi dan narasi kegiatan sekolah.</p></div>
        <button onClick={handleOpenAdd} className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-700/20 active:scale-95"><span className="material-symbols-outlined text-xl">add_photo_alternate</span> Tambah Dokumentasi</button>
      </div>

      <div className="bg-white border border-blue-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2 text-sm">Memuat data...</p></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-blue-50/50 border-b border-blue-100 text-blue-400 uppercase tracking-widest text-[10px] font-bold"><th className="px-6 py-4">Thumbnail</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Judul</th><th className="px-6 py-4">Ringkasan</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-blue-50">
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-blue-400"><div className="flex flex-col items-center gap-3"><span className="material-symbols-outlined text-5xl opacity-40">collections_bookmark</span><p className="font-medium text-sm">Belum ada dokumentasi kegiatan.</p><button onClick={handleOpenAdd} className="text-blue-600 font-bold text-sm hover:underline mt-2">Buat Postingan Baru</button></div></td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 w-28"><div className="w-20 h-14 rounded-lg overflow-hidden bg-blue-100 border border-blue-200">{item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-300 text-sm">image</span></div>}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">{item.category}</span></td>
                    <td className="px-6 py-4"><span className="font-extrabold text-blue-950 block">{item.title}</span></td>
                    <td className="px-6 py-4 max-w-xs"><p className="text-sm text-blue-700 truncate">{item.summary}</p></td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => handleOpenEdit(item)} className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors border border-yellow-200 shadow-sm"><span className="material-symbols-outlined text-[20px] block">edit</span></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-200 shadow-sm"><span className="material-symbols-outlined text-[20px] block">delete</span></button>
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
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/30">
              <h2 className="text-xl font-extrabold text-blue-950">{modalMode === "create" ? "Tambah Kegiatan" : "Edit Kegiatan"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-blue-500 hover:text-blue-900 bg-white p-1 rounded-lg border border-blue-100 shadow-sm"><span className="material-symbols-outlined block">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="flex flex-col space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Thumbnail Foto</label>
                <div onClick={() => document.getElementById("photo-upload")?.click()} className="relative w-full h-40 md:h-56 rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition-all overflow-hidden group">
                  {formPhoto ? <><img src={formPhoto} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-white text-3xl">border_color</span></div></> : <><span className="material-symbols-outlined text-blue-400 text-4xl mb-2">add_photo_alternate</span><span className="text-sm font-bold text-blue-600">Klik untuk unggah</span></>}
                </div>
                <input type="file" id="photo-upload" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Kategori</label><input type="text" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" placeholder="Contoh: Akademik" required /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Judul Kegiatan</label><input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" placeholder="Judul" required /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Ringkasan</label><textarea value={formSummary} onChange={(e) => setFormSummary(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none resize-none" rows={2} required /></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Isi Narasi (Full)</label><textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none resize-none" rows={5} required /></div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-blue-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full font-bold text-blue-600 hover:bg-blue-50 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-700/25">{saving ? "Menyimpan..." : "Simpan Postingan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
