"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolver: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolver: null,
  });

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setModalState({ isOpen: true, options, resolver: resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (modalState.resolver) {
      modalState.resolver(result);
    }
    setModalState({ isOpen: false, options: null, resolver: null });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {modalState.isOpen && modalState.options && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" 
            onClick={() => handleClose(false)}
          ></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 animate-[slideInUp_0.2s_ease-out]">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${modalState.options.danger !== false ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                <span className="material-symbols-outlined text-[32px]">
                  {modalState.options.danger !== false ? "warning" : "help"}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-blue-950 mb-2">{modalState.options.title}</h3>
                <p className="text-sm text-blue-700/80">{modalState.options.message}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8 w-full">
              <button 
                onClick={() => handleClose(false)} 
                className="flex-1 px-4 py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                {modalState.options.cancelText || "Batal"}
              </button>
              <button 
                onClick={() => handleClose(true)} 
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                  modalState.options.danger !== false 
                    ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                }`}
              >
                {modalState.options.confirmText || "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
