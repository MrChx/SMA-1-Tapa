"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";

export default function AdminBeranda() {
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [heroBgDesktop, setHeroBgDesktop] = useState("");
  const [heroBgMobile, setHeroBgMobile] = useState(""); 
  const [stat1Label, setStat1Label] = useState(""); const [stat1Value, setStat1Value] = useState("");
  const [stat2Label, setStat2Label] = useState(""); const [stat2Value, setStat2Value] = useState("");
  const [stat3Label, setStat3Label] = useState(""); const [stat3Value, setStat3Value] = useState("");
  const [stat4Label, setStat4Label] = useState(""); const [stat4Value, setStat4Value] = useState("");
  const [kabarPhoto, setKabarPhoto] = useState("");
  const [kabarTitle, setKabarTitle] = useState(""); const [kabarDesc, setKabarDesc] = useState("");
  const [kabarLink1, setKabarLink1] = useState(""); const [kabarLink2, setKabarLink2] = useState("");
  const [labVideo, setLabVideo] = useState(""); const [labTitle, setLabTitle] = useState("");
  const [labDesc, setLabDesc] = useState(""); const [labFitur1, setLabFitur1] = useState(""); const [labFitur2, setLabFitur2] = useState("");

  const [galeriOptions, setGaleriOptions] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/config").then(r => r.json()), fetch("/api/galeri").then(r => r.json())]).then(([cfg, galeri]) => {
      setHeroBgDesktop(cfg.hero_bg_desktop || ""); setHeroBgMobile(cfg.hero_bg_mobile || "");
      setStat1Label(cfg.stat1_label || ""); setStat1Value(cfg.stat1_value || "");
      setStat2Label(cfg.stat2_label || ""); setStat2Value(cfg.stat2_value || "");
      setStat3Label(cfg.stat3_label || ""); setStat3Value(cfg.stat3_value || "");
      setStat4Label(cfg.stat4_label || ""); setStat4Value(cfg.stat4_value || "");
      setKabarPhoto(cfg.kabar_photo || ""); setKabarTitle(cfg.kabar_title || ""); setKabarDesc(cfg.kabar_desc || "");
      setKabarLink1(cfg.kabar_link1 || ""); setKabarLink2(cfg.kabar_link2 || "");
      setLabVideo(cfg.lab_video || ""); setLabTitle(cfg.lab_title || ""); setLabDesc(cfg.lab_desc || "");
      setLabFitur1(cfg.lab_fitur1 || ""); setLabFitur2(cfg.lab_fitur2 || "");
      setGaleriOptions(galeri.map((g: { id: string; title: string }) => ({ id: g.id, title: g.title })));
      setLoading(false);
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData(); fd.append("file", e.target.files[0]); fd.append("folder", "beranda");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setter(data.url);
  };

  const saveSection = async (keys: Record<string, string>, label: string) => {
    try {
      const res = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(keys) });
      if (!res.ok) throw new Error();
      showToast("success", "Berhasil", `Konfigurasi ${label} berhasil disimpan.`);
    } catch {
      showToast("error", "Gagal menyimpan", `Terjadi kesalahan saat menyimpan konfigurasi ${label}.`);
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

  if (loading) return <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2">Memuat...</p></div>;

  return (
    <div className="space-y-8 lg:space-y-12 pb-12 max-w-4xl mx-auto">
      <div><h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Manajemen Laman Beranda</h1><p className="text-blue-700 text-sm mt-1">Konfigurasi hero, statistik, dan sorotan berita halaman depan.</p></div>

      <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
        <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3"><span className="material-symbols-outlined text-blue-700">view_carousel</span><h2 className="text-lg font-extrabold text-blue-950">Sampul & Statistik</h2></div>
        <form onSubmit={e => { e.preventDefault(); saveSection({ hero_bg_desktop: heroBgDesktop, hero_bg_mobile: heroBgMobile, stat1_label: stat1Label, stat1_value: stat1Value, stat2_label: stat2Label, stat2_value: stat2Value, stat3_label: stat3Label, stat3_value: stat3Value, stat4_label: stat4Label, stat4_value: stat4Value }, "Sampul & Statistik"); }} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Foto Lanskap (Desktop)</label><div onClick={() => !heroBgDesktop && document.getElementById("hero-desktop")?.click()} className={`relative w-full h-40 rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 overflow-hidden group ${!heroBgDesktop && 'cursor-pointer hover:border-blue-500'}`}>{heroBgDesktop ? <><img src={heroBgDesktop} className="w-full h-full object-cover" alt="Desktop" /><button type="button" onClick={(e) => { e.stopPropagation(); removePhoto('hero_bg_desktop', setHeroBgDesktop); }} className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-xl shadow-sm transition-transform active:scale-95"><span className="material-symbols-outlined text-sm block">delete</span></button></> : <><span className="material-symbols-outlined text-blue-400 mb-1">wallpaper</span><span className="text-[10px] font-bold text-blue-600">16:9</span></>}</div><input type="file" id="hero-desktop" className="hidden" accept="image/*" onChange={e => handleUpload(e, setHeroBgDesktop)} /></div>
            <div className="space-y-3"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Foto Potret (Mobile)</label><div onClick={() => !heroBgMobile && document.getElementById("hero-mobile")?.click()} className={`relative w-full h-40 md:w-3/4 mx-auto rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 overflow-hidden group ${!heroBgMobile && 'cursor-pointer hover:border-blue-500'}`}>{heroBgMobile ? <><img src={heroBgMobile} className="w-full h-full object-cover" alt="Mobile" /><button type="button" onClick={(e) => { e.stopPropagation(); removePhoto('hero_bg_mobile', setHeroBgMobile); }} className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-xl shadow-sm transition-transform active:scale-95"><span className="material-symbols-outlined text-sm block">delete</span></button></> : <><span className="material-symbols-outlined text-blue-400 mb-1">smartphone</span><span className="text-[10px] font-bold text-blue-600">9:16</span></>}</div><input type="file" id="hero-mobile" className="hidden" accept="image/*" onChange={e => handleUpload(e, setHeroBgMobile)} /></div>
          </div>
          <div className="space-y-4 pt-4 border-t border-blue-50"><h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2">Kapsul Data Statistik</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[[stat1Label, setStat1Label, stat1Value, setStat1Value], [stat2Label, setStat2Label, stat2Value, setStat2Value], [stat3Label, setStat3Label, stat3Value, setStat3Value], [stat4Label, setStat4Label, stat4Value, setStat4Value]].map(([label, setLabel, value, setValue], i) => (
                <div key={i} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-2">
                  <input value={label as string} onChange={e => (setLabel as (v: string) => void)(e.target.value)} className="w-full text-[10px] uppercase font-bold text-center bg-white border border-blue-200 rounded p-1 text-blue-700" />
                  <input value={value as string} onChange={e => (setValue as (v: string) => void)(e.target.value)} className="w-full text-xl font-black text-center bg-transparent border-b-2 border-blue-300 px-1 text-blue-950 outline-none focus:border-blue-700" />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-blue-50 pt-4 flex justify-end"><button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-transform flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">save</span> Simpan</button></div>
        </form>
      </section>

      <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
        <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3"><span className="material-symbols-outlined text-blue-700">feed</span><h2 className="text-lg font-extrabold text-blue-950">Kabar Akademik</h2></div>
        <form onSubmit={e => { e.preventDefault(); saveSection({ kabar_photo: kabarPhoto, kabar_title: kabarTitle, kabar_desc: kabarDesc, kabar_link1: kabarLink1, kabar_link2: kabarLink2 }, "Kabar Akademik"); }} className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 space-y-3"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Foto Kabar</label><div onClick={() => !kabarPhoto && document.getElementById("kabar-upload")?.click()} className={`relative w-full h-48 rounded-[2rem] border-2 border-dashed border-blue-300 flex flex-col items-center justify-center bg-blue-50 overflow-hidden group ${!kabarPhoto && 'cursor-pointer hover:border-blue-500'}`}>{kabarPhoto ? <><img src={kabarPhoto} className="w-full h-full object-cover" alt="Kabar" /><button type="button" onClick={(e) => { e.stopPropagation(); removePhoto('kabar_photo', setKabarPhoto); }} className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-[1rem] shadow-sm transition-transform active:scale-95"><span className="material-symbols-outlined text-sm block">delete</span></button></> : <><span className="material-symbols-outlined text-blue-400 text-4xl mb-2">add_photo_alternate</span><span className="text-[10px] font-bold text-blue-600">Pilih Gambar</span></>}</div><input type="file" id="kabar-upload" className="hidden" accept="image/*" onChange={e => handleUpload(e, setKabarPhoto)} /></div>
            <div className="w-full md:w-2/3 space-y-5">
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Judul</label><input type="text" value={kabarTitle} onChange={e => setKabarTitle(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 font-bold" /></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Keterangan</label><textarea value={kabarDesc} onChange={e => setKabarDesc(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 resize-none h-24" /></div>
            </div>
          </div>
          <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 space-y-4"><h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2 text-sm">Pilih 2 Berita dari Galeri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Berita 1</label><select value={kabarLink1} onChange={e => setKabarLink1(e.target.value)} className="w-full p-3 rounded-lg border border-blue-200 outline-none text-blue-900 text-sm focus:ring-2 focus:ring-blue-300"><option value="">-- Pilih --</option>{galeriOptions.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
              <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Berita 2</label><select value={kabarLink2} onChange={e => setKabarLink2(e.target.value)} className="w-full p-3 rounded-lg border border-blue-200 outline-none text-blue-900 text-sm focus:ring-2 focus:ring-blue-300"><option value="">-- Pilih --</option>{galeriOptions.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
            </div>
          </div>
          <div className="border-t border-blue-50 pt-4 flex justify-end"><button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-transform flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">save</span> Simpan Berita</button></div>
        </form>
      </section>

      <section className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
        <div className="bg-blue-50/50 px-8 py-5 border-b border-blue-100 flex items-center gap-3"><span className="material-symbols-outlined text-blue-700">science</span><h2 className="text-lg font-extrabold text-blue-950">Sorotan Laboratorium</h2></div>
        <form onSubmit={e => { e.preventDefault(); saveSection({ lab_video: labVideo, lab_title: labTitle, lab_desc: labDesc, lab_fitur1: labFitur1, lab_fitur2: labFitur2 }, "Lab"); }} className="p-8 space-y-6">
          <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">URL Video</label><input type="text" value={labVideo} onChange={e => setLabVideo(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950" /></div>
          <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Judul</label><input type="text" value={labTitle} onChange={e => setLabTitle(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 font-bold" /></div>
          <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Keterangan</label><textarea value={labDesc} onChange={e => setLabDesc(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950 resize-none h-24" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-500">Fitur 1</label><input type="text" value={labFitur1} onChange={e => setLabFitur1(e.target.value)} className="w-full px-5 py-3 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm text-blue-950" /></div>
            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-500">Fitur 2</label><input type="text" value={labFitur2} onChange={e => setLabFitur2(e.target.value)} className="w-full px-5 py-3 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm text-blue-950" /></div>
          </div>
          <div className="border-t border-blue-50 pt-6 flex justify-end"><button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-transform flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">save</span> Simpan Lab</button></div>
        </form>
      </section>
    </div>
  );
}
