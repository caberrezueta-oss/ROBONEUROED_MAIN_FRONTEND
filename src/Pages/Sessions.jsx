import { useState, useEffect } from "react";
import { Search, Eye, Calendar, Clock, Timer, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { apiFetch } from "../api/client";

export default function Sessions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSessions() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/sessions");
        setSessionLogs(data);
      } catch (err) {
        setError(err.message || "No se pudo cargar la bitácora de sesiones.");
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const filteredLogs = sessionLogs.filter(log =>
    log.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ENCABEZADO DE LA BITÁCORA */}
        <div className="mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-wider text-white">
            Bitácora de Sesiones Históricas
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
            Registro auditable de telemetría y respuestas del robot físico.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-bold mb-6">
            {error}
          </div>
        )}

        {/* TABLA CONTENEDORA */}
        <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-6 shadow-2xl">
          
          {/* CONTROLADORES SUPERIORES */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 text-slate-600" size={13} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por alumno o ID..." 
                className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-600 transition-all font-medium"
              />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase select-none">
              Mostrando {filteredLogs.length} logs guardados
            </span>
          </div>

          {/* TABLA PROPIAMENTE DICHA */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="animate-spin text-slate-600 mb-3" size={22} />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando bitácora...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-slate-900/40 rounded-2xl mb-4">
                <Timer size={22} className="text-slate-600" />
              </div>
              {sessionLogs.length === 0 ? (
                <>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aún no hay sesiones registradas</p>
                  <p className="text-[11px] text-slate-600 mt-1">Los registros aparecerán aquí en cuanto se complete la primera sesión con el robot.</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin resultados</p>
                  <p className="text-[11px] text-slate-600 mt-1">No hay sesiones que coincidan con tu búsqueda.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900/80 text-[10px] font-black tracking-widest text-slate-500 uppercase select-none">
                    <th className="pb-4 pl-2">ID de Bitácora</th>
                    <th className="pb-4">Estudiante</th>
                    <th className="pb-4">Fecha de Ejecución</th>
                    <th className="pb-4">Duración</th>
                    <th className="pb-4">Evaluación de Foco</th>
                    <th className="pb-4 text-right pr-2">Métricas</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-slate-300 divide-y divide-slate-900/30">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="group hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 pl-2 text-indigo-400 font-bold tracking-wider">{log.id}</td>
                      <td className="py-4 font-black text-white text-sm tracking-wide">{log.student}</td>
                      <td className="py-4 text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-600" /> {log.date}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-600" /> {log.duration}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`font-black px-2.5 py-1 rounded text-[9px] tracking-wide uppercase ${
                          log.type === "success" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-teal-500/10 text-teal-400"
                        }`}>
                          {log.focus}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button className="text-slate-500 hover:text-white p-1.5 bg-slate-900/0 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all cursor-pointer">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
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
      </main>
    </div>
  );
}
