import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      {/* Card */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          danger ? "bg-rose-500/10 text-rose-400" : "bg-indigo-500/10 text-indigo-400"
        }`}>
          <AlertTriangle size={22} />
        </div>

        <h3 className="text-base font-black text-white uppercase tracking-wide mb-2">{title}</h3>
        {message && <p className="text-xs text-slate-400 leading-relaxed mb-6">{message}</p>}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer ${
              danger
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
