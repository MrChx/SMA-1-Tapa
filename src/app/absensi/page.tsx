"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type FaceApi = typeof import("face-api.js");
let faceapi: FaceApi | null = null;

const CAPTURE_STEPS = [
  { label: "Wajah Lurus ke Depan", icon: "face", instruction: "Arahkan wajah Anda lurus ke kamera" },
  { label: "Wajah ke Atas", icon: "arrow_upward", instruction: "Angkat dagu, lihat sedikit ke atas" },
  { label: "Wajah ke Bawah", icon: "arrow_downward", instruction: "Tundukkan kepala, lihat sedikit ke bawah" },
  { label: "Wajah ke Kanan", icon: "arrow_forward", instruction: "Palingkan wajah Anda ke kanan" },
  { label: "Wajah ke Kiri", icon: "arrow_back", instruction: "Palingkan wajah Anda ke kiri" },
];

export default function AbsensiPage() {
  const [tab, setTab] = useState<"register" | "absen">("absen");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);

  const [regName, setRegName] = useState("");
  const [regKelas, setRegKelas] = useState("");
  const [kelasList, setKelasList] = useState<{ id: string; name: string }[]>([]);
  const [regStep, setRegStep] = useState(-1);
  const [regStatus, setRegStatus] = useState("");
  const [regError, setRegError] = useState("");
  const [stableCount, setStableCount] = useState(0);
  const [capturedCount, setCapturedCount] = useState(0);
  const regEmbeddingsRef = useRef<number[][]>([]);

  const [absStatus, setAbsStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
  const [absMessage, setAbsMessage] = useState("");
  const [absStudentName, setAbsStudentName] = useState("");
  const [absStudentKelas, setAbsStudentKelas] = useState("");
  const [absIsLate, setAbsIsLate] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"loading" | "ok" | "error">("loading");
  const gpsCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        faceapi = await import("face-api.js");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
      } catch (e) {
        console.error("Failed to load face-api models:", e);
      } finally {
        setLoadingModels(false);
      }
    };
    load();
    fetch("/api/absensi/kelas").then(r => r.json()).then(setKelasList).catch(() => {});
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 360 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error("Camera error:", e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    busyRef.current = false;
  }, []);

  const detectFace = useCallback(async (): Promise<Float32Array | null> => {
    if (!faceapi || !videoRef.current || videoRef.current.readyState < 2) return null;
    try {
      const det = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      return det ? det.descriptor : null;
    } catch { return null; }
  }, []);

  const startRegistration = async () => {
    if (!regName.trim() || !regKelas.trim()) return;
    regEmbeddingsRef.current = [];
    setRegStep(0);
    setRegError("");
    setStableCount(0);
    setCapturedCount(0);
    await startCamera();
  };

  useEffect(() => {
    if (regStep < 0 || regStep > 4 || !modelsLoaded) return;

    let stable = 0;
    busyRef.current = false;

    const tick = async () => {
      if (busyRef.current) return; // skip if previous detection still running
      busyRef.current = true;

      const desc = await detectFace();
      if (desc) {
        stable++;
        setStableCount(stable);
        if (stable >= 3) {
          const emb = Array.from(desc);
          regEmbeddingsRef.current.push(emb);
          setCapturedCount(regEmbeddingsRef.current.length);
          stable = 0;
          setStableCount(0);

          const totalCaptured = regEmbeddingsRef.current.length;
          if (totalCaptured >= 5) {
            setRegStep(5);
          } else {
            setRegStep(totalCaptured);
          }
          busyRef.current = false;
          return;
        }
      } else {
        stable = 0;
        setStableCount(0);
      }
      busyRef.current = false;
    };

    intervalRef.current = setInterval(tick, 800);
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [regStep, modelsLoaded, detectFace]);

  useEffect(() => {
    if (regStep !== 5) return;
    const submit = async () => {
      setRegStatus("Menyimpan data wajah...");
      try {
        const res = await fetch("/api/absensi/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: regName,
            kelas: regKelas,
            embeddings: regEmbeddingsRef.current,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Server error");
        stopCamera();
        setRegStep(6);
        setRegStatus("");
      } catch (e: unknown) {
        stopCamera();
        setRegError(e instanceof Error ? e.message : "Gagal mendaftarkan.");
        setRegStep(-1);
        regEmbeddingsRef.current = [];
        setCapturedCount(0);
        setStableCount(0);
        setRegStatus("");
      }
    };
    submit();
  }, [regStep, regName, regKelas, stopCamera]);

  const startAttendance = async () => {
    setAbsStatus("detecting");
    setAbsMessage("Mempersiapkan kamera dan GPS...");
    setAbsStudentName("");
    gpsCoordsRef.current = null;

    setGpsStatus("loading");
    if (!navigator.geolocation) {
      setGpsStatus("error");
      setAbsStatus("error");
      setAbsMessage("Browser Anda tidak mendukung GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsCoordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGpsStatus("ok");
      },
      () => {
        setGpsStatus("error");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );

    await startCamera();
    setAbsMessage("Arahkan wajah Anda ke kamera...");
    busyRef.current = false;

    intervalRef.current = setInterval(async () => {
      if (busyRef.current) return;
      busyRef.current = true;

      const desc = await detectFace();
      if (!desc) { busyRef.current = false; return; }

      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      setAbsMessage("Wajah terdeteksi! Memproses absensi...");

      if (!gpsCoordsRef.current) {
        for (let i = 0; i < 25; i++) {
          await new Promise((r) => setTimeout(r, 200));
          if (gpsCoordsRef.current) break;
        }
      }

      const coords = gpsCoordsRef.current;
      if (!coords) {
        setAbsStatus("error");
        setAbsMessage("Lokasi GPS tidak tersedia. Pastikan izin lokasi diberikan.");
        stopCamera();
        return;
      }

      try {
        const res = await fetch("/api/absensi/attend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embedding: Array.from(desc), lat: coords.lat, lng: coords.lng }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Server error");
        setAbsStudentName(data.name);
        setAbsStudentKelas(data.kelas);
        setAbsMessage(data.message);
        setAbsIsLate(!!data.isLate);
        setAbsStatus("success");
      } catch (e: unknown) {
        setAbsStatus("error");
        setAbsMessage(e instanceof Error ? e.message : "Gagal memproses absensi.");
      }
      stopCamera();
    }, 800);
  };

  const resetAttendance = () => {
    setAbsStatus("idle");
    setAbsMessage("");
    setAbsStudentName("");
    setGpsStatus("loading");
    gpsCoordsRef.current = null;
    stopCamera();
  };

  const resetRegistration = () => {
    setRegStep(-1);
    setRegName("");
    setRegKelas("");
    regEmbeddingsRef.current = [];
    setRegError("");
    setRegStatus("");
    setStableCount(0);
    setCapturedCount(0);
    stopCamera();
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">Sistem Absensi Cerdas</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-blue-950 tracking-tight mb-3">
            Absensi <span className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">Wajah</span>
          </h1>
          <p className="text-blue-700/70 max-w-lg mx-auto">Absensi otomatis menggunakan pengenalan wajah dan verifikasi lokasi GPS.</p>
        </div>

        {loadingModels && (
          <div className="text-center py-16 space-y-4">
            <span className="material-symbols-outlined text-5xl text-blue-300 animate-spin block">progress_activity</span>
            <p className="text-blue-500 font-bold">Memuat model AI pengenalan wajah...</p>
            <p className="text-blue-400 text-sm">Mohon tunggu beberapa saat.</p>
          </div>
        )}

        {!loadingModels && !modelsLoaded && (
          <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-200 space-y-3">
            <span className="material-symbols-outlined text-5xl text-red-400 block">error</span>
            <p className="text-red-700 font-bold">Gagal memuat model AI.</p>
            <p className="text-red-500 text-sm">Pastikan koneksi stabil lalu muat ulang halaman.</p>
          </div>
        )}

        {modelsLoaded && (
          <>
            <div className="flex bg-blue-50 rounded-2xl p-1.5 mb-8 border border-blue-100">
              <button onClick={() => { setTab("absen"); resetRegistration(); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === "absen" ? "bg-blue-700 text-white shadow-lg shadow-blue-700/20" : "text-blue-700 hover:bg-blue-100"}`}>
                <span className="material-symbols-outlined text-lg align-middle mr-1">how_to_reg</span> Absensi
              </button>
              <button onClick={() => { setTab("register"); resetAttendance(); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === "register" ? "bg-blue-700 text-white shadow-lg shadow-blue-700/20" : "text-blue-700 hover:bg-blue-100"}`}>
                <span className="material-symbols-outlined text-lg align-middle mr-1">person_add</span> Registrasi
              </button>
            </div>

            {tab === "absen" && (
              <div className="space-y-6">
                {absStatus === "idle" && (
                  <div className="bg-white rounded-[2rem] border border-blue-100 p-8 md:p-12 text-center space-y-6 shadow-sm">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-5xl text-blue-500">face</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-blue-950 mb-2">Siap Absen?</h2>
                      <p className="text-blue-700/70 text-sm max-w-sm mx-auto">Pastikan wajah terlihat jelas dan Anda berada di lokasi sekolah.</p>
                    </div>
                    <button onClick={startAttendance} className="bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-800 active:scale-95 transition-all shadow-xl shadow-blue-700/20">
                      <span className="material-symbols-outlined align-middle mr-2">photo_camera</span>Mulai Absensi
                    </button>
                  </div>
                )}

                {absStatus === "detecting" && (
                  <div className="space-y-4">
                    <div className="relative rounded-[2rem] overflow-hidden border-4 border-blue-200 bg-black shadow-xl aspect-[4/3]">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ transform: "scaleX(-1)" }} />
                      <div className="absolute top-4 left-4 bg-blue-700/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Mendeteksi...
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${gpsStatus === "ok" ? "bg-green-500/80 text-white" : gpsStatus === "error" ? "bg-red-500/80 text-white" : "bg-yellow-500/80 text-white"}`}>
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {gpsStatus === "loading" ? "Mengambil lokasi..." : gpsStatus === "ok" ? "Lokasi GPS diterima" : "GPS gagal"}
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-blue-600 font-medium text-sm">{absMessage}</p>
                  </div>
                )}

                {absStatus === "success" && (
                  <div className={`bg-white rounded-[2rem] border-2 p-8 md:p-12 text-center space-y-5 shadow-sm animate-[fadeIn_0.3s_ease-out] ${absIsLate ? "border-amber-300" : "border-green-200"}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${absIsLate ? "bg-amber-100" : "bg-green-100"}`}>
                      <span className={`material-symbols-outlined text-5xl ${absIsLate ? "text-amber-500" : "text-green-600"}`}>{absIsLate ? "schedule" : "check_circle"}</span>
                    </div>
                    <h2 className={`text-2xl font-bold ${absIsLate ? "text-amber-700" : "text-green-800"}`}>{absIsLate ? "Anda Terlambat!" : "Absensi Berhasil!"}</h2>
                    <p className={`text-4xl font-black ${absIsLate ? "text-amber-600" : "text-green-600"}`}>{absStudentName}</p>
                    <p className={`text-sm font-bold ${absIsLate ? "text-amber-700" : "text-green-700"}`}>Kelas {absStudentKelas}</p>
                    {absIsLate && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 inline-flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-500">warning</span>
                        <span className="text-amber-700 text-sm font-bold">Absensi tercatat sebagai TERLAMBAT</span>
                      </div>
                    )}
                    <p className={`text-sm ${absIsLate ? "text-amber-600/80" : "text-green-600/80"}`}>{absMessage}</p>
                    <button onClick={resetAttendance} className={`text-white px-8 py-3 rounded-full font-bold active:scale-95 transition-all ${absIsLate ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"}`}>Selesai</button>
                  </div>
                )}

                {absStatus === "error" && (
                  <div className="bg-white rounded-[2rem] border-2 border-red-200 p-8 md:p-12 text-center space-y-5 shadow-sm">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-5xl text-red-500">error</span>
                    </div>
                    <h2 className="text-xl font-bold text-red-800">Absensi Gagal</h2>
                    <p className="text-red-600 text-sm">{absMessage}</p>
                    <button onClick={resetAttendance} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 active:scale-95 transition-all">Coba Lagi</button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ REGISTRASI TAB ═══ */}
            {tab === "register" && (
              <div className="space-y-6">
                {regStep === -1 && (
                  <div className="bg-white rounded-[2rem] border border-blue-100 p-8 md:p-10 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-700">person_add</span></div>
                      <h2 className="text-xl font-bold text-blue-950">Data Siswa Baru</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-blue-600 ml-1">Nama Lengkap</label>
                        <input value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-blue-50 border border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 outline-none text-blue-950 font-medium" placeholder="Masukkan nama lengkap" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-blue-600 ml-1">Kelas</label>
                        <div className="relative">
                          <select value={regKelas} onChange={(e) => setRegKelas(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-blue-50 border border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 outline-none text-blue-950 font-medium appearance-none cursor-pointer">
                            <option value="">Pilih kelas...</option>
                            {kelasList.map((k) => <option key={k.id} value={k.name}>{k.name}</option>)}
                          </select>
                          <span className="material-symbols-outlined text-blue-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                        </div>
                        {kelasList.length === 0 && <p className="text-xs text-amber-600 ml-1">Belum ada kelas tersedia. Hubungi admin untuk menambahkan kelas.</p>}
                      </div>
                    </div>
                    {regError && <p className="text-red-600 text-sm font-bold bg-red-50 px-4 py-2 rounded-xl">{regError}</p>}
                    <button onClick={startRegistration} disabled={!regName.trim() || !regKelas.trim()} className="w-full bg-blue-700 disabled:bg-blue-300 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-800 active:scale-[0.98] transition-all shadow-lg shadow-blue-700/20">
                      Lanjut Scan Wajah →
                    </button>
                  </div>
                )}

                {regStep >= 0 && regStep <= 4 && (
                  <div className="space-y-4">
                    {/* Step Progress */}
                    <div className="flex items-center gap-2 justify-center">
                      {CAPTURE_STEPS.map((_, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${i < regStep ? "bg-green-500 text-white scale-90" : i === regStep ? "bg-blue-700 text-white scale-110 shadow-lg shadow-blue-700/30" : "bg-blue-100 text-blue-400"}`}>
                          {i < regStep ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Camera */}
                    <div className="relative rounded-[2rem] overflow-hidden border-4 border-blue-200 bg-black shadow-xl aspect-[4/3]">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ transform: "scaleX(-1)" }} />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-60 md:w-52 md:h-68 border-[3px] border-dashed border-white/40 rounded-[50%]"></div>
                      </div>
                      {/* Progress ring */}
                      <div className="absolute top-4 right-4">
                        <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                            <circle cx="22" cy="22" r="18" fill="none" stroke={stableCount >= 3 ? "#22c55e" : "#60a5fa"} strokeWidth="3" strokeDasharray={`${(stableCount / 3) * 113} 113`} strokeLinecap="round" className="transition-all duration-500" />
                          </svg>
                          <span className="absolute text-white font-bold text-xs">{regStep + 1}/5</span>
                        </div>
                      </div>
                      {/* Step captured indicator */}
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold">
                        {capturedCount} dari 5 tersimpan
                      </div>
                    </div>

                    {/* Instruction */}
                    <div className="bg-blue-700 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-2xl">{CAPTURE_STEPS[regStep].icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg">{CAPTURE_STEPS[regStep].label}</p>
                        <p className="text-sm text-blue-100">{CAPTURE_STEPS[regStep].instruction}</p>
                      </div>
                    </div>
                  </div>
                )}

                {regStep === 5 && (
                  <div className="bg-white rounded-[2rem] border border-blue-100 p-12 text-center space-y-4">
                    <span className="material-symbols-outlined text-5xl text-blue-400 animate-spin block">progress_activity</span>
                    <p className="text-blue-700 font-bold">{regStatus || "Menyimpan data wajah ke server..."}</p>
                  </div>
                )}

                {regStep === 6 && (
                  <div className="bg-white rounded-[2rem] border-2 border-green-200 p-8 md:p-12 text-center space-y-5 animate-[fadeIn_0.3s_ease-out]">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-5xl text-green-600">how_to_reg</span>
                    </div>
                    <h2 className="text-2xl font-bold text-green-800">Registrasi Berhasil!</h2>
                    <p className="text-green-600 text-lg font-bold mt-2">{regName}</p>
                    <p className="text-green-700 text-sm">Kelas {regKelas}</p>
                    <p className="text-green-600/80 text-sm">Data wajah telah tersimpan. Anda sudah bisa melakukan absensi.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button onClick={resetRegistration} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 active:scale-95 transition-all">Daftarkan Siswa Lain</button>
                      <button onClick={() => { resetRegistration(); setTab("absen"); }} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 active:scale-95 transition-all">Mulai Absensi</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-blue-50 rounded-t-[2rem] w-full mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="text-center text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa.</div>
        </div>
      </footer>
    </>
  );
}
