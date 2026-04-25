"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  exiting?: boolean;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 400);
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: "420px" }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const icons: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const styles: Record<ToastType, { bg: string; border: string; icon: string; bar: string }> = {
  success: { bg: "bg-white", border: "border-green-200", icon: "text-green-500", bar: "bg-green-500" },
  error: { bg: "bg-white", border: "border-red-200", icon: "text-red-500", bar: "bg-red-500" },
  info: { bg: "bg-white", border: "border-blue-200", icon: "text-blue-500", bar: "bg-blue-500" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const s = styles[toast.type];
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = 4000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div
      className={`pointer-events-auto ${s.bg} border ${s.border} rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden
        ${toast.exiting ? "animate-[slideOut_0.35s_ease-in_forwards]" : "animate-[slideIn_0.35s_ease-out]"}`}
      style={{ minWidth: "320px" }}
    >
      <div className="flex items-start gap-3.5 px-5 py-4">
        <span className={`material-symbols-outlined ${s.icon} text-[22px] mt-0.5 flex-shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icons[toast.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[13px] text-gray-900 leading-tight">{toast.title}</p>
          {toast.message && <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{toast.message}</p>}
        </div>
        <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[3px] w-full bg-gray-100">
        <div className={`h-full ${s.bar} transition-none rounded-full`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
