import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Database, Cpu, ShieldAlert, CheckCircle, Loader2, Wifi, WifiOff, Copy, Check, KeyRound, Users } from "lucide-react";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Configuration() {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [robotStatus, setRobotStatus] = useState("Desconectado");
  const [uriCopied, setUriCopied] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    if (!selectedUserId || !newPassword) return;
    setResettingPassword(true);
    try {
      const data = await apiFetch(`/auth/users/${selectedUserId}/reset-password`, {
        method: "PUT",
        body: JSON.stringify({ newPassword }),
      });
      setResetMessage(data.message || "Contraseña actualizada correctamente.");
      setNewPassword("");
    } catch (err) {
      setResetError(err.message || "No se pudo actualizar la contraseña.");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCopyUri = async () => {
    try {
      await navigator.clipboard.writeText(config.dbHost);
      setUriCopied(true);
      setTimeout(() => setUriCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar al portapapeles:", err);
    }
  };

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/config");
        setConfig(data);
      } catch (err) {
        setError(err.message || "No se pudo cargar la configuración.");
      } finally {
        setLoading(false);
      }
    }
    loadConfig();

    async function loadRobotStatus() {
      try {
        const data = await apiFetch("/robot/status");
        setRobotStatus(data.status);
      } catch {
        // silencioso
      }
    }
    loadRobotStatus();
    const id = setInterval(loadRobotStatus, 5000);

    if (user?.role === "admin") {
      apiFetch("/auth/users")
        .then(setUsers)
        .catch(() => {});
    }

    return () => clearInterval(id);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await apiFetch("/config", {
        method: "PUT",
        body: JSON.stringify(config),
      });
      setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-slate-600 mb-3" size={26} />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-12 font-sans antialiased">
      <Navbar />

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">
              Configuración del Sistema
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Ajustes de infraestructura hardware-software y credenciales de red.</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold whitespace-nowrap ${
            robotStatus === "Activo"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : robotStatus === "Inactivo"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          }`}>
            {robotStatus === "Activo" ? <Wifi size={14} /> : <WifiOff size={14} />}
            Robot: {robotStatus}
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={16} /> Parámetros guardados correctamente en la base de datos.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* POSTGRES CONFIG */}
          <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-colors p-6 rounded-[2rem] shadow-xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database size={14} className="text-indigo-400" /> Origen de Datos (PostgreSQL)
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Cadena de Conexión URI</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={config.dbHost}
                  onChange={(e) => setConfig({...config, dbHost: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-24 py-3 text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500 transition-all duration-300 ease-in-out"
                />
                <button
                  type="button"
                  onClick={handleCopyUri}
                  className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {uriCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {uriCopied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>
          </div>

          {/* TELEMETRY HARDWARE CONFIG */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-600/40 transition-colors p-6 rounded-[2rem] shadow-xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu size={14} className="text-slate-400" /> Parámetros del Dispositivo EEG / Robot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Puerto de Enlace Local</label>
                <input 
                  type="text" 
                  value={config.hardwarePort}
                  onChange={(e) => setConfig({...config, hardwarePort: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Frecuencia de Muestreo (Sampling)</label>
                <select 
                  value={config.samplingRate}
                  onChange={(e) => setConfig({...config, samplingRate: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
                >
                  <option value="125Hz">125 Hz</option>
                  <option value="250Hz">250 Hz</option>
                  <option value="500Hz">500 Hz</option>
                </select>
              </div>
            </div>
          </div>

          {/* ALERTS AND SAFETY THRESHOLDS */}
          <div className="bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-colors p-6 rounded-[2rem] shadow-xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert size={14} className="text-rose-400" /> Umbral Clínico de Atención
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Foco Atencional Mínimo Requerido:</span>
                <span className="text-indigo-400 font-bold font-mono">{config.minAttentionThreshold}%</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="90" 
                value={config.minAttentionThreshold}
                onChange={(e) => setConfig({...config, minAttentionThreshold: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[10px] text-slate-500 leading-normal">Si la telemetría cae por debajo de este porcentaje durante la ejecución de tareas robóticas, la consola lanzará automáticamente la interrupción por hardware hacia el entorno del alumno.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Guardando..." : "Guardar Configuración Global"}
            </button>
          </div>

        </form>

        {/* GESTIÓN DE USUARIOS — SOLO VISIBLE PARA ADMIN */}
        {user?.role === "admin" && (
          <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-colors duration-300 ease-in-out p-6 rounded-[2rem] shadow-xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users size={14} className="text-indigo-400" /> Gestión de Usuarios
            </h3>
            <p className="text-[11px] text-slate-500 -mt-2">
              Como administrador, puedes restablecer la contraseña de cualquier usuario sin necesidad de correo electrónico.
            </p>

            {resetMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle size={14} /> {resetMessage}
              </div>
            )}
            {resetError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-bold">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Usuario</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">Selecciona...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Nueva Contraseña</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={resettingPassword || !selectedUserId || !newPassword}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:col-span-1"
              >
                {resettingPassword ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                Restablecer
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
