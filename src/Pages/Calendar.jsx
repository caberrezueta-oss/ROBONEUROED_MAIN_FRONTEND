import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import { apiFetch } from "../api/client";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X, Trash2, Loader2, Clock } from "lucide-react";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function Calendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: "", studentName: "", time: "09:00", notes: "" });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [sessionsData, studentsData] = await Promise.all([
        apiFetch("/scheduled-sessions"),
        apiFetch("/students"),
      ]);
      setSessions(sessionsData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message || "No se pudo cargar el calendario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cells = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const sessionsByDay = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const d = new Date(s.scheduledAt);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const key = d.getDate();
        if (!map[key]) map[key] = [];
        map[key].push(s);
      }
    });
    return map;
  }, [sessions, viewYear, viewMonth]);

  const selectedDaySessions = sessionsByDay[selectedDay] || [];

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const openCreateModal = () => {
    setForm({ studentId: "", studentName: "", time: "09:00", notes: "" });
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.studentName.trim()) return;
    setSaving(true);
    try {
      const scheduledAt = new Date(viewYear, viewMonth, selectedDay);
      const [h, m] = form.time.split(":");
      scheduledAt.setHours(Number(h), Number(m), 0, 0);

      await apiFetch("/scheduled-sessions", {
        method: "POST",
        body: JSON.stringify({
          studentId: form.studentId || null,
          studentName: form.studentName,
          scheduledAt: scheduledAt.toISOString(),
          notes: form.notes,
        }),
      });
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || "No se pudo programar la sesión.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!toDelete) return;
    try {
      await apiFetch(`/scheduled-sessions/${toDelete.id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== toDelete.id));
    } catch (err) {
      setError(err.message || "No se pudo eliminar la sesión programada.");
    } finally {
      setToDelete(null);
    }
  };

  const isToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 font-sans">
      <Navbar />

      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Calendario de Sesiones</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Planifica y organiza las próximas sesiones con cada estudiante.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-slate-600 mb-3" size={26} />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando calendario...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CALENDARIO */}
            <div className="lg:col-span-2 bg-[#0b1329] border border-slate-900 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <CalendarDays size={16} className="text-indigo-400" />
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={goToPrevMonth} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all duration-300 ease-in-out cursor-pointer">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={goToNextMonth} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all duration-300 ease-in-out cursor-pointer">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAY_LABELS.map((w) => (
                  <div key={w} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-wide py-1">
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                  if (!day) return <div key={idx} />;
                  const hasSessions = sessionsByDay[day]?.length > 0;
                  const selected = day === selectedDay;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(day)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-all duration-300 ease-in-out cursor-pointer relative ${
                        selected
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                          : isToday(day)
                          ? "bg-slate-800 text-white border border-slate-700"
                          : "text-slate-400 hover:bg-slate-900 border border-transparent"
                      }`}
                    >
                      {day}
                      {hasSessions && <span className="w-1 h-1 rounded-full bg-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SESIONES DEL DÍA SELECCIONADO */}
            <div className="bg-[#0b1329] border border-slate-900 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide">
                  {selectedDay} de {MONTH_NAMES[viewMonth]}
                </h3>
                <button
                  onClick={openCreateModal}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} /> Nueva
                </button>
              </div>

              {selectedDaySessions.length === 0 ? (
                <div className="py-8 text-center">
                  <CalendarDays size={22} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-[11px] text-slate-600">Sin sesiones programadas este día.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDaySessions
                    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                    .map((s) => (
                      <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-start gap-2">
                        <div>
                          <p className="text-xs font-bold text-white capitalize">{s.studentName}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {new Date(s.scheduledAt).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {s.notes && <p className="text-[10px] text-slate-600 mt-1">{s.notes}</p>}
                        </div>
                        <button
                          onClick={() => setToDelete(s)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-all duration-300 ease-in-out cursor-pointer flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NUEVA SESIÓN PROGRAMADA */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer">
              <X size={16} />
            </button>
            <h3 className="text-base font-black text-white uppercase tracking-wide mb-5 flex items-center gap-2">
              <Plus size={16} className="text-indigo-400" /> Programar Sesión — {selectedDay}/{viewMonth + 1}
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Estudiante</label>
                <select
                  value={form.studentId}
                  onChange={(e) => {
                    const student = students.find((s) => String(s.id) === e.target.value);
                    setForm({ ...form, studentId: e.target.value, studentName: student?.name || "" });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">Selecciona un estudiante...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Hora</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Notas (opcional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ej: Enfocarse en ejercicios de memoria"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !form.studentId}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Guardando..." : "Programar Sesión"}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Eliminar sesión programada"
        message={toDelete ? `¿Eliminar la sesión de "${toDelete.studentName}"?` : ""}
        confirmLabel="Sí, eliminar"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
