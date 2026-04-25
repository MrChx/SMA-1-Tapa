"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";

export default function AdminProfil() {
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [heroPhoto, setHeroPhoto] = useState("");
  const [heroTheme, setHeroTheme] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [kepsekPhoto, setKepsekPhoto] = useState("");
  const [kepsekName, setKepsekName] = useState("");
  const [kepsekQuote, setKepsekQuote] = useState("");
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");
  const [pilar, setPilar] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [locationName, setLocationName] = useState("");
  const [infrastructure, setInfrastructure] = useState("");

  useEffect(() => {
    fetch("/api/config").then(r => r.json()).then(cfg => {
      setHeroPhoto(cfg.hero_photo || ""); setHeroTheme(cfg.hero_theme || ""); setHeroDesc(cfg.hero_desc || "");
      setKepsekPhoto(cfg.kepsek_photo || ""); setKepsekName(cfg.kepsek_name || ""); setKepsekQuote(cfg.kepsek_quote || "");
      setVisi(cfg.visi || ""); setMisi(cfg.misi || ""); setPilar(cfg.pilar || "");
      setMapLink(cfg.map_link || ""); setLocationName(cfg.location_name || ""); setInfrastructure(cfg.infrastructure || "");
      setLoading(false);
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData(); fd.append("file", e.target.files[0]); fd.append("folder", "profil");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setter(data.url);
  };

  const saveSection = async (keys: Record<string, string>, label: string) => {
    try {
      const res = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(keys) });
      if (!res.ok) throw new Error();
      showToast("success", "Berhasil", `Bagian ${label} berhasil disimpan.`);
    } catch {
      showToast("error", "Gagal menyimpan", `Terjadi kesalahan saat menyimpan bagian ${label}.`);
    }
  };

  const removePhoto = async (key: string, setter: (v: string) => void) => {
    const isConfirmed = await confirm({
      title: "Hapus Foto?",
      message: "Tindakan ini tidak dapat dibatalkan. Foto akan dihapus dari sistem."
    });
    if (!isConfirmed) return;

    try {
      setter("");
      const res = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: "" }) });
      if (!res.ok) throw new Error();
      showToast("success", "Foto Dihapus", "Foto berhasil dihapus dari sistem.");
    } catch {
      showToast("error", "Gagal Menghapus", "Terjadi kesalahan saat menghapus foto.");
    }
  };

  if (loading) return <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2">Memuat konfigurasi...</p></div>;

  return (
    <div className="space-y-8 lg:space-y-12 pb-12 max-w-4xl mx-auto">
      <div><h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Profil & Visi Misi Utama</h1><p className="text-blue-700 text-sm mt-1">Konfigurasi laman Profil: identitas, kepala sekolah, infrastruktur.</p></div>

      {/* Section 1: Hero */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
        <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3"><span className="material-symbols-outlined text-blue-700">stars</span><h2 className="text-lg font-extrabold text-blue-950">Jargon & Kartu Utama</h2></div>
        <form onSubmit={e => { e.preventDefault(); saveSection({ hero_photo: heroPhoto, hero_theme: heroTheme, hero_desc: heroDesc }, "Kartu Utama"); }} className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 flex flex-col space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-700">Foto Sampul Hero</label>
              <div onClick={() => !heroPhoto && document.getElementById("hero-upload")?.click()} className={`relative w-full h-40 rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 transition-colors overflow-hidden group ${!heroPhoto && 'cursor-pointer hover:bg-blue-100'}`}>
                {heroPhoto ? <><img src={heroPhoto} className="w-full h-full object-cover" alt="Hero" /><button type="button" onClick={(e) => { e.stopPropagation(); removePhoto('hero_photo', setHeroPhoto); }} className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-xl shadow-sm transition-transform active:scale-95"><span className="material-symbols-outlined text-sm block">delete</span></button></> : <><span className="material-symbols-outlined text-blue-400 text-3xl mb-1">image</span><span className="text-[10px] font-bold text-blue-600">Unggah Foto</span></>}
              </div>
              <input type="file" id="hero-upload" className="hidden" accept="image/*" onChange={e => handleUpload(e, setHeroPhoto)} />
            </div>
            <div className="w-full md:w-2/3 space-y-5">
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Tema Jargon</label><input type="text" value={heroTheme} onChange={e => setHeroTheme(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 font-bold" /></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Deskripsi</label><textarea value={heroDesc} onChange={e => setHeroDesc(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 resize-none" rows={3} /></div>
            </div>
          </div>
          <div className="border-t border-blue-50 pt-6 flex justify-end"><button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-transform flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">save</span> Simpan</button></div>
        </form>
      </section>

      {/* Section 2: Kepsek, Visi, Misi */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
        <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3"><span className="material-symbols-outlined text-blue-700">assignment_ind</span><h2 className="text-lg font-extrabold text-blue-950">Profil Pimpinan, Visi & Misi</h2></div>
        <form onSubmit={e => { e.preventDefault(); saveSection({ kepsek_photo: kepsekPhoto, kepsek_name: kepsekName, kepsek_quote: kepsekQuote, visi, misi, pilar }, "Visi Misi"); }} className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="w-full md:w-1/3 flex flex-col items-center space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-700 self-start">Foto Kepsek</label>
              <div onClick={() => !kepsekPhoto && document.getElementById("kepsek-upload")?.click()} className={`relative w-40 h-48 rounded-[2rem] border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 transition-colors overflow-hidden group shadow-inner ${!kepsekPhoto && 'cursor-pointer hover:border-blue-500'}`}>
                {kepsekPhoto ? <><img src={kepsekPhoto} className="w-full h-full object-cover" alt="Kepsek" /><button type="button" onClick={(e) => { e.stopPropagation(); removePhoto('kepsek_photo', setKepsekPhoto); }} className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-xl shadow-sm transition-transform active:scale-95"><span className="material-symbols-outlined text-sm block">delete</span></button></> : <><span className="material-symbols-outlined text-blue-400 text-4xl mb-2">person_add</span><span className="text-[10px] font-bold text-blue-600 text-center px-4">Unggah Foto</span></>}
              </div>
              <input type="file" id="kepsek-upload" className="hidden" accept="image/*" onChange={e => handleUpload(e, setKepsekPhoto)} />
            </div>
            <div className="w-full md:w-2/3 space-y-5">
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Nama Kepsek</label><input type="text" value={kepsekName} onChange={e => setKepsekName(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 font-bold" /></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Kalimat Sambutan</label><textarea value={kepsekQuote} onChange={e => setKepsekQuote(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 resize-none" rows={3} /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-blue-50">
            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Visi</label><textarea value={visi} onChange={e => setVisi(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 resize-none h-32" /></div>
            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Misi</label><textarea value={misi} onChange={e => setMisi(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 resize-none h-32" /></div>
            <div className="md:col-span-2 space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Pilar</label><input type="text" value={pilar} onChange={e => setPilar(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950" /></div>
          </div>
          <div className="border-t border-blue-50 pt-6 flex justify-end"><button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-transform flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">save</span> Simpan Visi Misi</button></div>
        </form>
      </section>

      {/* Section 3: Denah */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
        <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3"><span className="material-symbols-outlined text-blue-700">map</span><h2 className="text-lg font-extrabold text-blue-950">Denah & Infrastruktur</h2></div>
        <form onSubmit={e => { e.preventDefault(); saveSection({ map_link: mapLink, location_name: locationName, infrastructure }, "Denah"); }} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Nama Lokasi</label><input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950" /></div>
            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Link Denah / GPS</label><input type="text" value={mapLink} onChange={e => setMapLink(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950" /></div>
          </div>
          <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Infrastruktur</label><textarea value={infrastructure} onChange={e => setInfrastructure(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 resize-none h-32" /></div>
          <div className="border-t border-blue-50 pt-6 flex justify-end"><button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-transform flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">save</span> Simpan Denah</button></div>
        </form>
      </section>
    </div>
  );
}
