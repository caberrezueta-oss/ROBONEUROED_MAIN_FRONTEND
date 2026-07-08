import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, Pencil, Calendar, GraduationCap, Loader2, Plus, X, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import { apiFetch } from "../api/client";

function attentionColor(level) {
  if (level >= 70) return { bar: "bg-emerald-500", text: "text-emerald-400", label: "Alto" };
  if (level >= 40) return { bar: "bg-amber-500", text: "text-amber-400", label: "Medio" };
  return { bar: "bg-rose-500", text: "text-rose-400", label: "Bajo" };
}

const emptyForm = { name: "", age: "", condition: "", attentionLevel: 50 };

// Solo letras (con acentos y ñ) y espacios — sin números ni símbolos
function sanitizeName(value) {
  return value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\s]/g, "").slice(0, 60);
}

// Solo dígitos, máximo 2 (edades de 0 a 99)
function sanitizeAge(value) {
  return value.replace(/[^0-9]/g, "").slice(0, 2);
}

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/students");
      setStudents(data);
    } catch (err) {
      setError(err.message || "No se pudo cargar la lista de estudiantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setModalMode("edit");
    setEditingId(student.id);
    setForm({
      name: student.name,
      age: student.age || "",
      condition: student.condition || "",
      attentionLevel: student.attentionLevel,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modalMode === "create") {
        await apiFetch("/students", { method: "POST", body: JSON.stringify(form) });
      } else {
        await apiFetch(`/students/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
      }
      setModalOpen(false);
      loadStudents();
    } catch (err) {
      setError(err.message || "No se pudo guardar el estudiante.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/students/${studentToDelete.id}`, { method: "DELETE" });
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
    } catch (err) {
      setError(err.message || "No se pudo eliminar el estudiante.");
    } finally {
      setDeleting(false);
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.id).includes(searchTerm)
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 font-sans">
      <Navbar />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Panel de Estudiantes</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Control de perfiles neuro-educativos y registros vinculados.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={14} /> Nuevo Estudiante
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 text-slate-600" size={13} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar estudiante por nombre o ID..."
                className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-600 transition-all font-medium"
              />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase select-none whitespace-nowrap">
              {students.length} alumno{students.length !== 1 ? "s" : ""} registrado{students.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="animate-spin text-slate-600 mb-3" size={22} />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando estudiantes...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-slate-900/40 rounded-2xl mb-4">
                <GraduationCap size={22} className="text-slate-600" />
              </div>
              {students.length === 0 ? (
                <>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aún no hay estudiantes registrados</p>
                  <p className="text-[11px] text-slate-600 mt-1 mb-4">Empieza agregando el perfil de tu primer estudiante.</p>
                  <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Plus size={14} /> Agregar tu primer estudiante
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin resultados</p>
                  <p className="text-[11px] text-slate-600 mt-1">No hay estudiantes que coincidan con tu búsqueda.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900/80 text-[10px] font-black tracking-widest text-slate-500 uppercase select-none">
                    <th className="pb-4 pl-2">ID</th>
                    <th className="pb-4">Nombre Completo</th>
                    <th className="pb-4">Nivel de Atención</th>
                    <th className="pb-4">Racha</th>
                    <th className="pb-4">Última Conexión</th>
                    <th className="pb-4 text-right pr-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-slate-300 divide-y divide-slate-900/30">
                  {paginatedStudents.map((s) => {
                    const colors = attentionColor(s.attentionLevel);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => navigate(`/estudiantes/${s.id}`)}
                        className="group hover:bg-slate-900/10 transition-colors cursor-pointer"
                      >
                        <td className="py-4 pl-2 text-indigo-400 font-bold tracking-wider">ALU-{String(s.id).padStart(3, "0")}</td>
                        <td className="py-4 font-black text-white text-sm tracking-wide capitalize">{s.name}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 w-32">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${colors.bar} rounded-full transition-all`} style={{ width: `${s.attentionLevel}%` }} />
                            </div>
                            <span className={`text-[10px] font-bold ${colors.text} w-8 text-right`}>{s.attentionLevel}%</span>
                          </div>
                        </td>
                        <td className="py-4">
                          {s.streak > 0 ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs">
                              <Flame size={13} className="fill-amber-400" /> {s.streak}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[11px]">Sin racha aún</span>
                          )}
                        </td>
                        <td className="py-4 text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-600" /> {s.lastConnection || "Sin registros"}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(s);
                              }}
                              className="text-slate-500 hover:text-indigo-400 p-1.5 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 rounded-lg transition-all cursor-pointer"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStudentToDelete(s);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-900/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 ease-in-out cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 ease-in-out cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: NUEVO / EDITAR ESTUDIANTE */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-black text-white uppercase tracking-wide mb-5 flex items-center gap-2">
              {modalMode === "create" ? <Plus size={16} className="text-indigo-400" /> : <Pencil size={16} className="text-indigo-400" />}
              {modalMode === "create" ? "Nuevo Estudiante" : "Editar Estudiante"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Nombre completo *</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  placeholder="Solo letras y espacios"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: sanitizeName(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Edad</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: sanitizeAge(e.target.value) })}
                  placeholder="Ej: 6"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Condición</label>
                <input
                  type="text"
                  maxLength={80}
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  placeholder="Ej: TDAH Tipo Impulsivo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              {/* BARRA DE NIVEL DE ATENCIÓN - la decide el profesor */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Nivel de Atención (evaluación del profesor)</label>
                  <span className={`text-xs font-bold ${attentionColor(form.attentionLevel).text}`}>{form.attentionLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.attentionLevel}
                  onChange={(e) => setForm({ ...form, attentionLevel: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-600 leading-normal">
                  Esta es tu evaluación subjetiva del nivel de atención general del estudiante, no un dato medido automáticamente.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Guardando..." : modalMode === "create" ? "Registrar Estudiante" : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      <ConfirmModal
        open={!!studentToDelete}
        title="Eliminar estudiante"
        message={studentToDelete ? `¿Seguro que deseas eliminar a "${studentToDelete.name}"? Esta acción no se puede deshacer.` : ""}
        confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}
