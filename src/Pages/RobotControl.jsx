import { useState, useEffect } from "react";
import { Bot, Wifi, WifiOff, Clock, Loader2, AlertTriangle, Pause, Play, User, Activity, ListChecks, Sparkles, Plus, Trash2, ShieldQuestion, Pencil, Check, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { apiFetch } from "../api/client";

const STATUS_POLL_MS = 5000;
const LIVE_POLL_MS = 3000;

function statusStyles(status) {
  if (status === "Activo") {
    return { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", icon: Wifi };
  }
  if (status === "Inactivo") {
    return { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400", icon: WifiOff };
  }
  return { badge: "bg-slate-500/10 text-slate-400 border-slate-500/20", dot: "bg-slate-500", icon: WifiOff };
}

function formatElapsed(startedAt) {
  if (!startedAt) return "00:00";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function RobotControl() {
  const [robotStatus, setRobotStatus] = useState(null);
  const [liveSession, setLiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pausing, setPausing] = useState(false);
  const [error, setError] = useState("");
  const [, forceTick] = useState(0);

  // --- Banco de preguntas y Modo Desafío ---
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ text: "", options: ["", "", "", ""], answer: "", level: "Fácil" });
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [desafioSourceMode, setDesafioSourceMode] = useState("banco");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [customText, setCustomText] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const [savingDesafio, setSavingDesafio] = useState(false);
  const [desafioSaved, setDesafioSaved] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editForm, setEditForm] = useState({ text: "", options: ["", "", "", ""], answer: "", level: "Fácil" });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await apiFetch("/robot/status");
        setRobotStatus(data);
        setError("");
      } catch (err) {
        setError(err.message || "No se pudo consultar el estado del robot.");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
    const id = setInterval(fetchStatus, STATUS_POLL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function fetchLive() {
      try {
        const data = await apiFetch("/robot/session/live");
        setLiveSession(data);
      } catch {
        // silencioso: no vale la pena mostrar error por un poll fallido
      }
    }
    fetchLive();
    const id = setInterval(fetchLive, LIVE_POLL_MS);
    return () => clearInterval(id);
  }, []);

  // Re-renderiza cada segundo solo para actualizar el cronómetro visible
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function loadQuestionsAndDesafio() {
      try {
        const qs = await apiFetch("/questions");
        setQuestions(qs);

        const { config } = await apiFetch("/questions/desafio/config");
        if (config) {
          setDesafioSourceMode(config.sourceMode);
          setSelectedQuestionId(config.questionId);
          setCustomText(config.customText || "");
          setCustomAnswer(config.customAnswer || "");
        }
      } catch (err) {
        setError(err.message || "No se pudo cargar el banco de preguntas.");
      }
    }
    loadQuestionsAndDesafio();
  }, []);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const filledOptions = newQuestion.options.filter((o) => o.trim());
    if (!newQuestion.text.trim() || filledOptions.length < 2 || !newQuestion.answer.trim()) return;
    setAddingQuestion(true);
    try {
      const created = await apiFetch("/questions", {
        method: "POST",
        body: JSON.stringify({ ...newQuestion, options: filledOptions }),
      });
      setQuestions((prev) => [...prev, created]);
      setNewQuestion({ text: "", options: ["", "", "", ""], answer: "", level: "Fácil" });
    } catch (err) {
      setError(err.message || "No se pudo agregar la pregunta.");
    } finally {
      setAddingQuestion(false);
    }
  };

  const startEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    const paddedOptions = [...(q.options || []), "", "", "", ""].slice(0, 4);
    setEditForm({ text: q.text, options: paddedOptions, answer: q.answer, level: q.level });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
  };

  const handleSaveEditQuestion = async (id) => {
    setSavingEdit(true);
    try {
      const filledOptions = editForm.options.filter((o) => o.trim());
      const updated = await apiFetch(`/questions/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...editForm, options: filledOptions }),
      });
      setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
      setEditingQuestionId(null);
    } catch (err) {
      setError(err.message || "No se pudo editar la pregunta.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await apiFetch(`/questions/${id}`, { method: "DELETE" });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuestionId === id) setSelectedQuestionId(null);
    } catch (err) {
      setError(err.message || "No se pudo eliminar la pregunta.");
    }
  };

  const handleSaveDesafio = async () => {
    setSavingDesafio(true);
    try {
      await apiFetch("/questions/desafio/config", {
        method: "PUT",
        body: JSON.stringify({
          sourceMode: desafioSourceMode,
          questionId: desafioSourceMode === "banco" ? selectedQuestionId : null,
          customText: desafioSourceMode === "custom" ? customText : null,
          customAnswer: desafioSourceMode === "custom" ? customAnswer : null,
        }),
      });
      setDesafioSaved(true);
      setTimeout(() => setDesafioSaved(false), 2000);
    } catch (err) {
      setError(err.message || "No se pudo guardar la configuración de Modo Desafío.");
    } finally {
      setSavingDesafio(false);
    }
  };

  const handleTogglePause = async () => {
    if (!liveSession) return;
    setPausing(true);
    try {
      const nextPaused = liveSession.status !== "paused";
      const updated = await apiFetch("/robot/session/pause", {
        method: "PUT",
        body: JSON.stringify({ paused: nextPaused }),
      });
      setLiveSession((prev) => ({ ...prev, status: updated.paused ? "paused" : "running", pauseRequested: updated.paused }));
    } catch (err) {
      setError(err.message || "No se pudo cambiar el estado de la sesión.");
    } finally {
      setPausing(false);
    }
  };

  const status = robotStatus?.status || "Desconectado";
  const styles = statusStyles(status);
  const StatusIcon = styles.icon;

  const isSessionActive = liveSession && liveSession.status !== "idle";
  const isBelowThreshold = liveSession?.belowThreshold;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 font-sans">
      <Navbar />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Control del Robot</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Estado de conexión y telemetría en vivo del hardware ESP32.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        {/* ALERTA DE UMBRAL */}
        {isSessionActive && isBelowThreshold && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-rose-400 uppercase tracking-wide">Foco atencional bajo el umbral</p>
              <p className="text-xs text-rose-300/80 mt-0.5">
                {liveSession.studentName} está por debajo del umbral configurado. Considera intervenir o pausar la sesión.
              </p>
            </div>
          </div>
        )}

        {/* TARJETA PRINCIPAL DE ESTADO DEL ROBOT */}
        <div className="bg-[#0b1329] border border-slate-900 p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${styles.badge}`}>
              <Bot size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Estado del Robot</p>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm font-bold">Consultando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse`} />
                  <span className="text-2xl font-black text-white">{status}</span>
                </div>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold ${styles.badge}`}>
            <StatusIcon size={14} />
            {status === "Activo" ? "Conectado a la red local" : "Sin señal reciente del dispositivo"}
          </div>
        </div>

        {/* SESIÓN EN VIVO */}
        <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
              <Activity size={14} /> Sesión en Curso
            </h3>
            {isSessionActive && (
              <button
                onClick={handleTogglePause}
                disabled={pausing}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-60 ${
                  liveSession.status === "paused"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-amber-600 hover:bg-amber-500 text-white"
                }`}
              >
                {pausing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : liveSession.status === "paused" ? (
                  <Play size={14} />
                ) : (
                  <Pause size={14} />
                )}
                {liveSession.status === "paused" ? "Reanudar" : "Pausar"}
              </button>
            )}
          </div>

          {!isSessionActive ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="p-3 bg-slate-900/40 rounded-2xl mb-3">
                <Bot size={20} className="text-slate-600" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay sesión en curso</p>
              <p className="text-[11px] text-slate-600 mt-1">Aquí verás en vivo el foco atencional cuando el robot inicie una sesión.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white capitalize">{liveSession.studentName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                      {liveSession.status === "paused" ? "Pausada" : "En curso"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono font-bold">
                  <Clock size={13} /> {formatElapsed(liveSession.startedAt)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`rounded-xl p-4 border ${isBelowThreshold ? "bg-rose-500/10 border-rose-500/30" : "bg-slate-950 border-slate-800"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Foco Actual</p>
                  <p className={`text-2xl font-black ${isBelowThreshold ? "text-rose-400" : "text-white"}`}>
                    {liveSession.currentFocus != null ? `${Math.round(liveSession.currentFocus)}%` : "—"}
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Ondas Alpha</p>
                  <p className="text-2xl font-black text-indigo-400">
                    {liveSession.currentAlpha != null ? Math.round(liveSession.currentAlpha) : "—"}
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Ondas Beta</p>
                  <p className="text-2xl font-black text-slate-300">
                    {liveSession.currentBeta != null ? Math.round(liveSession.currentBeta) : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DETALLES DEL ÚLTIMO HEARTBEAT */}
        <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
            <Clock size={14} /> Última Señal Recibida
          </h3>

          {loading ? (
            <p className="text-xs text-slate-600">Cargando...</p>
          ) : robotStatus?.lastSeen ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Fecha y hora</p>
                <p className="text-sm font-mono text-indigo-300">
                  {new Date(robotStatus.lastSeen).toLocaleString("es-EC")}
                </p>
              </div>
              {robotStatus.deviceInfo && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Info del dispositivo</p>
                  <p className="text-sm font-mono text-indigo-300">{robotStatus.deviceInfo}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              Todavía no se ha recibido ninguna señal del ESP32. Verifica que esté encendido y conectado a la red Wi-Fi configurada.
            </p>
          )}

          <p className="text-[10px] text-slate-600 leading-relaxed pt-2 border-t border-slate-800/60">
            Estado cada {STATUS_POLL_MS / 1000}s · Sesión en vivo cada {LIVE_POLL_MS / 1000}s ·
            "Inactivo" tras 10s sin señal.
          </p>
        </div>

        {/* MODO DESAFÍO: QUÉ PREGUNTA MOSTRAR SI EL NIÑO FALLA */}
        <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
            <ShieldQuestion size={14} /> Modo Desafío
          </h3>
          <p className="text-[11px] text-slate-600 -mt-2">
            Esta es la pregunta que el ESP32 mostrará en pantalla cuando el estudiante falle la pregunta regular.
          </p>

          <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 max-w-xs">
            <button
              type="button"
              onClick={() => setDesafioSourceMode("banco")}
              className={`flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wide py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
                desafioSourceMode === "banco"
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <ListChecks size={12} /> Del Banco
            </button>
            <button
              type="button"
              onClick={() => setDesafioSourceMode("custom")}
              className={`flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wide py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
                desafioSourceMode === "custom"
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Sparkles size={12} /> Personalizada
            </button>
          </div>

          {desafioSourceMode === "banco" ? (
            <div className="space-y-1 max-w-md">
              <label className="text-[10px] uppercase font-bold text-slate-500">Elegir pregunta predeterminada</label>
              <select
                value={selectedQuestionId ?? ""}
                onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/40"
              >
                <option value="" disabled>Selecciona una pregunta...</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>{q.text} — Rpta: {q.answer}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2 max-w-md">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enunciado de la pregunta"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-rose-500/40"
              />
              <input
                type="text"
                value={customAnswer}
                onChange={(e) => setCustomAnswer(e.target.value)}
                placeholder="Respuesta correcta"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-rose-500/40"
              />
            </div>
          )}

          <button
            onClick={handleSaveDesafio}
            disabled={savingDesafio}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-60 flex items-center gap-2"
          >
            {savingDesafio && <Loader2 size={14} className="animate-spin" />}
            {desafioSaved ? "Guardado ✓" : savingDesafio ? "Guardando..." : "Guardar Modo Desafío"}
          </button>
        </div>

        {/* BANCO GENERAL DE PREGUNTAS */}
        <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
            <ListChecks size={14} /> Banco General de Preguntas
          </h3>

          <form onSubmit={handleAddQuestion} className="space-y-3 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
            <input
              type="text"
              placeholder="Enunciado de la pregunta"
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {newQuestion.options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Opción ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const updated = [...newQuestion.options];
                    updated[idx] = e.target.value;
                    // Si esta opción era la respuesta correcta y cambió el texto, actualízala también
                    const nextAnswer = newQuestion.answer === opt ? e.target.value : newQuestion.answer;
                    setNewQuestion({ ...newQuestion, options: updated, answer: nextAnswer });
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newQuestion.answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                className="flex-1 bg-slate-950 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500"
              >
                <option value="">Selecciona la respuesta correcta...</option>
                {newQuestion.options.filter((o) => o.trim()).map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={newQuestion.level}
                onChange={(e) => setNewQuestion({ ...newQuestion, level: e.target.value })}
                className="sm:w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="Fácil">Fácil</option>
                <option value="Medio">Medio</option>
                <option value="Difícil">Difícil</option>
              </select>
              <button
                type="submit"
                disabled={addingQuestion || newQuestion.options.filter((o) => o.trim()).length < 2 || !newQuestion.answer}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>
            <p className="text-[10px] text-slate-600">Completa al menos 2 opciones y elige cuál es la correcta.</p>
          </form>

          {questions.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">Aún no hay preguntas en el banco.</p>
          ) : (
            <div className="space-y-2">
              {questions.map((q) =>
                editingQuestionId === q.id ? (
                  <div key={q.id} className="bg-slate-950 border border-indigo-500/40 p-3 rounded-xl space-y-2">
                    <input
                      type="text"
                      value={editForm.text}
                      onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {editForm.options.map((opt, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`Opción ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...editForm.options];
                            updated[idx] = e.target.value;
                            const nextAnswer = editForm.answer === opt ? e.target.value : editForm.answer;
                            setEditForm({ ...editForm, options: updated, answer: nextAnswer });
                          }}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                        />
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={editForm.answer}
                        onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                        className="flex-1 bg-slate-900 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500"
                      >
                        <option value="">Respuesta correcta...</option>
                        {editForm.options.filter((o) => o.trim()).map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <select
                        value={editForm.level}
                        onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                        className="sm:w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                      >
                        <option value="Fácil">Fácil</option>
                        <option value="Medio">Medio</option>
                        <option value="Difícil">Difícil</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEditQuestion}
                        className="text-[10px] font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEditQuestion(q.id)}
                        disabled={savingEdit || editForm.options.filter((o) => o.trim()).length < 2 || !editForm.answer}
                        className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-40 flex items-center gap-1"
                      >
                        {savingEdit ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={q.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{q.text}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(q.options || []).map((opt, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              opt === q.answer
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-900 text-slate-500 border border-slate-800"
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1.5">{q.level}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEditQuestion(q)}
                        className="text-slate-500 hover:text-indigo-400 p-1.5 hover:bg-indigo-500/10 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
