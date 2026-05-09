"use client";

import { useEffect, useState, useCallback } from "react";

export type ToastType = "error" | "success" | "info";

interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

let toastId = 0;
let addToastGlobal: ((text: string, type?: ToastType) => void) | null = null;

/**
 * Call from anywhere to show a toast. The ToastProvider must be mounted.
 */
export function showToast(text: string, type: ToastType = "error") {
  if (addToastGlobal) {
    addToastGlobal(text, type);
  } else {
    // Fallback if provider not mounted yet
    console.error("[Toast]", text);
  }
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: ToastType = "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, text, type }]);

    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => {
      addToastGlobal = null;
    };
  }, [addToast]);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-5 py-4 shadow-lg backdrop-blur-sm animate-slide-in flex items-start gap-3 ${
            toast.type === "error"
              ? "bg-red-50/95 border-red-200 text-red-800"
              : toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                : "bg-accent-bg/95 border-border text-forest"
          }`}
          role="alert"
        >
          {/* Icon */}
          <span className="flex-shrink-0 mt-0.5">
            {toast.type === "error" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            ) : toast.type === "success" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            )}
          </span>

          {/* Message */}
          <p className="text-sm leading-relaxed flex-1">{toast.text}</p>

          {/* Dismiss */}
          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
