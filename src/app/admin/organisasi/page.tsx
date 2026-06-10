"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";
import { authFetch } from "@/lib/authFetch";

type Member = {
  id: string;
  organization: string;
  name: string;
  role: string;
  photoUrl: string | null;
};

type Activity = {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: string;
};

export default function AdminOrganisasi() {
  const [activeTab, setActiveTab] = useState<"OSIS" | "Rohis" | "Pramuka" | "PMR" | "PIK-R">("OSIS");
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<"anggota" | "berita">("anggota");
  const { showToast } = useToast();
  const confirm = useConfirm();

  // Member modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formId, setFormId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Activity modal
  const [isActModalOpen, setIsActModalOpen] = useState(false);
  const [actModalMode, setActModalMode] = useState<"create" | "edit">("create");
  const [actId, setActId] = useState<string | null>(null);
  const [actTitle, setActTitle] = useState("");
  const [actSummary, setActSummary] = useState("");
  const [actContent, setActContent] = useState("");
  const [actThumb, setActThumb] = useState<string | null>(null);
  const [actSaving, setActSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const resAuth = await authFetch("/api/auth/me");
    const authData = await resAuth.json();
    const role = authData.admin?.role || "SUPER_ADMIN";
    setAdminRole(role);

    if (role !== "SUPER_ADMIN") {
      setActiveTab(role as any);
    }

    const [resMembers, resActs] = await Promise.all([
      authFetch("/api/organisasi"),
      authFetch("/api/galeri"),
    ]);
    setMembers(await resMembers.json());
    setActivities(await resActs.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredMembers = members.filter((m) => m.organization === activeTab);
  const filteredActivities = activities.filter((a) => a.category.toLowerCase() === activeTab.toLowerCase());

  const TABS = adminRole === "SUPER_ADMIN"
    ? ["OSIS", "Rohis", "Pramuka", "PMR", "PIK-R"]
    : (adminRole ? [adminRole] : ["OSIS", "Rohis", "Pramuka", "PMR", "PIK-R"]);

  // ─── MEMBER HANDLERS ───
  const handleOpenAdd = () => {
    setModalMode("create"); setFormId(null); setFormName(""); setFormRole(""); setFormPhoto(null); setIsModalOpen(true);
  };
  const handleOpenEdit = (member: Member) => {
    setModalMode("edit"); setFormId(member.id); setFormName(member.name); setFormRole(member.role); setFormPhoto(member.photoUrl); setIsModalOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Hapus Anggota?", message: "Anggota organisasi ini akan dihapus permanen." })) return;
    try {
      const res = await authFetch(`/api/organisasi/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Anggota dihapus", "Data berhasil dihapus dari organisasi.");
      fetchData();
    } catch { showToast("error", "Gagal menghapus", "Terjadi kesalahan saat menghapus data."); }
  };
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData(); fd.append("file", e.target.files[0]); fd.append("folder", "organisasi");
    const res = await authFetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setFormPhoto(data.url);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const body = { organization: activeTab, name: formName, role: formRole, photoUrl: formPhoto };
    try {
      const res = modalMode === "create"
        ? await authFetch("/api/organisasi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await authFetch(`/api/organisasi/${formId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      showToast("success", modalMode === "create" ? "Anggota ditambahkan" : "Data diperbarui", `${formName} berhasil disimpan.`);
      setIsModalOpen(false); fetchData();
    } catch { showToast("error", "Gagal menyimpan", "Periksa koneksi dan coba lagi."); }
    setSaving(false);
  };

  // ─── ACTIVITY HANDLERS ───
  const handleOpenAddAct = () => {
    setActModalMode("create"); setActId(null); setActTitle(""); setActSummary(""); setActContent(""); setActThumb(null); setIsActModalOpen(true);
  };
  const handleOpenEditAct = (act: Activity) => {
    setActModalMode("edit"); setActId(act.id); setActTitle(act.title); setActSummary(act.summary); setActContent(act.content); setActThumb(act.thumbnailUrl); setIsActModalOpen(true);
  };
  const handleDeleteAct = async (id: string) => {
    if (!await confirm({ title: "Hapus Berita?", message: "Berita/kegiatan ini akan dihapus permanen." })) return;
    try {
      const res = await authFetch(`/api/galeri/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Berita dihapus", "Berita/kegiatan berhasil dihapus.");
      fetchData();
    } catch { showToast("error", "Gagal menghapus", "Terjadi kesalahan."); }
  };
  const handleActThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData(); fd.append("file", e.target.files[0]); fd.append("folder", "organisasi-berita");
    const res = await authFetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setActThumb(data.url);
  };
  const handleActSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setActSaving(true);
    const body = { category: activeTab, title: actTitle, summary: actSummary, content: actContent, thumbnailUrl: actThumb };
    try {
      const res = actModalMode === "create"
        ? await authFetch("/api/galeri", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await authFetch(`/api/galeri/${actId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      showToast("success", actModalMode === "create" ? "Berita ditambahkan" : "Berita diperbarui", `"${actTitle}" berhasil disimpan.`);
      setIsActModalOpen(false); fetchData();
    } catch { showToast("error", "Gagal menyimpan", "Periksa koneksi dan coba lagi."); }
    setActSaving(false);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Manajemen Organisasi</h1>
          <p className="text-blue-700 text-sm mt-1">Kelola anggota dan berita kegiatan organisasi.</p>
        </div>
        <button onClick={section === "anggota" ? handleOpenAdd : handleOpenAddAct} className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-700/20 active:scale-95">
          <span className="material-symbols-outlined text-xl">add</span> {section === "anggota" ? "Tambah Anggota" : "Tambah Berita"}
        </button>
      </div>

      {/* Org Tabs */}
      <div className="bg-white border border-blue-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="flex border-b border-blue-100 bg-blue-50/50">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 text-center font-bold text-sm md:text-base border-b-2 transition-all ${activeTab === tab ? "border-blue-700 text-blue-700 bg-white" : "border-transparent text-blue-500 hover:text-blue-700 hover:bg-blue-50"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Section Toggle: Anggota / Berita */}
        <div className="flex bg-blue-50/30 border-b border-blue-100 px-6 py-3 gap-2">
          <button onClick={() => setSection("anggota")} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${section === "anggota" ? "bg-blue-700 text-white shadow" : "text-blue-700 hover:bg-blue-100"}`}>
            <span className="material-symbols-outlined text-lg">groups</span> Anggota
          </button>
          <button onClick={() => setSection("berita")} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${section === "berita" ? "bg-blue-700 text-white shadow" : "text-blue-700 hover:bg-blue-100"}`}>
            <span className="material-symbols-outlined text-lg">newspaper</span> Berita & Kegiatan
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2 text-sm">Memuat data...</p></div>
          ) : section === "anggota" ? (
            /* ═══ ANGGOTA TABLE ═══ */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-blue-100 text-blue-400 uppercase tracking-widest text-[10px] font-bold">
                    <th className="px-6 py-4">Profil</th>
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">Jabatan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {filteredMembers.length === 0 ? (
                    <tr><td colSpan={4} className="py-16 text-center text-blue-400">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl opacity-40">box</span>
                        <p className="font-medium text-sm">Belum ada anggota untuk organisasi <b>{activeTab}</b>.</p>
                        <button onClick={handleOpenAdd} className="text-blue-600 font-bold text-sm hover:underline mt-2">Tambahkan Sekarang</button>
                      </div>
                    </td></tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 w-20">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-blue-100 border border-blue-200">
                            {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-300">person</span></div>}
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="font-extrabold text-blue-950 block">{member.name}</span></td>
                        <td className="px-6 py-4"><span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">{member.role}</span></td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleOpenEdit(member)} className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors border border-yellow-200 shadow-sm" title="Edit"><span className="material-symbols-outlined text-[20px] block">edit</span></button>
                          <button onClick={() => handleDelete(member.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-200 shadow-sm" title="Hapus"><span className="material-symbols-outlined text-[20px] block">delete</span></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* ═══ BERITA & KEGIATAN ═══ */
            <div className="p-6">
              {filteredActivities.length === 0 ? (
                <div className="py-16 text-center text-blue-400">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-5xl opacity-40">article</span>
                    <p className="font-medium text-sm">Belum ada berita/kegiatan untuk <b>{activeTab}</b>.</p>
                    <button onClick={handleOpenAddAct} className="text-blue-600 font-bold text-sm hover:underline mt-2">Tambahkan Sekarang</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredActivities.map((act) => (
                    <div key={act.id} className="bg-blue-50/50 rounded-2xl border border-blue-100 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all">
                      <div className="relative h-40 bg-gradient-to-br from-blue-100 to-blue-200">
                        {act.thumbnailUrl ? (
                          <img src={act.thumbnailUrl} alt={act.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-300 text-4xl">image</span></div>
                        )}
                      </div>
                      <div className="p-5 space-y-2">
                        <h3 className="font-extrabold text-blue-950 text-sm leading-tight line-clamp-2">{act.title}</h3>
                        <p className="text-xs text-blue-600 line-clamp-2">{act.summary}</p>
                        <p className="text-[10px] text-blue-400">{new Date(act.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => handleOpenEditAct(act)} className="flex-1 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl text-xs font-bold hover:bg-yellow-500 hover:text-white transition-all flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                          </button>
                          <button onClick={() => handleDeleteAct(act.id)} className="flex-1 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">delete</span> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MEMBER MODAL ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/30">
              <h2 className="text-xl font-extrabold text-blue-950">{modalMode === "create" ? `Tambah Anggota ${activeTab}` : `Edit Anggota ${activeTab}`}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-500 hover:text-blue-900 bg-white p-1 rounded-lg border border-blue-100 shadow-sm"><span className="material-symbols-outlined block">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="flex flex-col items-center justify-center space-y-4 pt-2">
                <div onClick={() => document.getElementById("photo-upload")?.click()} className="relative w-28 h-28 rounded-[2rem] border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition-all overflow-hidden group">
                  {formPhoto ? (
                    <><img src={formPhoto} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-white">border_color</span></div></>
                  ) : (
                    <><span className="material-symbols-outlined text-blue-400 text-3xl mb-1">add_photo_alternate</span><span className="text-[10px] font-bold uppercase text-blue-600 text-center px-2">Unggah Foto</span></>
                  )}
                </div>
                <input type="file" id="photo-upload" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Nama Lengkap</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" placeholder="Misal: Budi Santoso" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Jabatan (Bebas Tulis)</label>
                <input type="text" value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" placeholder="Misal: Ketua / Wakil" required />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-blue-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full font-bold text-blue-600 hover:bg-blue-50 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white px-8 py-3 rounded-full font-bold hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg shadow-blue-700/25">
                  {saving ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ ACTIVITY MODAL ═══ */}
      {isActModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setIsActModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/30">
              <h2 className="text-xl font-extrabold text-blue-950">{actModalMode === "create" ? `Tambah Berita ${activeTab}` : `Edit Berita ${activeTab}`}</h2>
              <button onClick={() => setIsActModalOpen(false)} className="text-blue-500 hover:text-blue-900 bg-white p-1 rounded-lg border border-blue-100 shadow-sm"><span className="material-symbols-outlined block">close</span></button>
            </div>
            <form onSubmit={handleActSubmit} className="p-8 space-y-5 overflow-y-auto">
              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Foto Thumbnail</label>
                <div onClick={() => document.getElementById("act-thumb-upload")?.click()} className="relative w-full h-40 rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition-all overflow-hidden group">
                  {actThumb ? (
                    <><img src={actThumb} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-white text-3xl">border_color</span></div></>
                  ) : (
                    <><span className="material-symbols-outlined text-blue-400 text-4xl mb-2">add_photo_alternate</span><span className="text-xs font-bold text-blue-600">Klik untuk unggah foto</span></>
                  )}
                </div>
                <input type="file" id="act-thumb-upload" accept="image/*" className="hidden" onChange={handleActThumbUpload} />
              </div>
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Judul Berita</label>
                <input type="text" value={actTitle} onChange={(e) => setActTitle(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" placeholder="Misal: Kegiatan Bakti Sosial OSIS" required />
              </div>
              {/* Summary */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Ringkasan</label>
                <textarea value={actSummary} onChange={(e) => setActSummary(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none resize-none" rows={2} placeholder="Ringkasan singkat kegiatan..." required />
              </div>
              {/* Content */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Isi Lengkap</label>
                <textarea value={actContent} onChange={(e) => setActContent(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none resize-none" rows={5} placeholder="Tuliskan detail kegiatan/berita di sini..." required />
              </div>
              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-blue-50">
                <button type="button" onClick={() => setIsActModalOpen(false)} className="px-6 py-3 rounded-full font-bold text-blue-600 hover:bg-blue-50 transition-colors">Batal</button>
                <button type="submit" disabled={actSaving} className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white px-8 py-3 rounded-full font-bold hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg shadow-blue-700/25">
                  {actSaving ? "Menyimpan..." : "Simpan Berita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
