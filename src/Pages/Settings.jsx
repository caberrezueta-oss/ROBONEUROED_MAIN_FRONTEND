import { useState } from "react";
import Navbar from "../components/Navbar";
import { 
  User, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Activity, 
  Clock, 
  Brain, 
  CheckCircle,
  Plus,
  Search,
  Bot
} from "lucide-react";

function Students() {
  // ESTADO PARA EXPANDIR LA TARJETA DEL ALUMNO (DESPLEGABLE)
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  
  // ESTADO PARA PASAR A LA VISTA "EN PROGRESO" CUANDO EL PROFESOR LANZA UNA SESIÓN
  const [activeSession, setActiveSession] = useState(null);

  // DATA ESTRUCTURADA (Aquí es donde tu amigo conectará el useEffect con el fetch del Backend)
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "María González",
      age: 5,
      hyperactivity: "Moderado",
      sessions: [
        { id: "S-101", date: "2026-07-01", attention: 78, score: 90, duration: "30 min" },
        { id: "S-102", date: "2026-06-28", attention: 82, score: 85, duration: "25 min" }
      ]
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      age: 6,
      hyperactivity: "Alto",
      sessions: [
        { id: "S-201", date: "2026-07-02", attention: 55, score: 70, duration: "20 min" }
      ]
    }
  ]);

  const toggleExpand = (id) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  const startSession = (student) => {
    // El profesor activa la sesión del alumno; el robot físico interceptará esto desde el backend
    setActiveSession({
      studentId: student.id,
      studentName: `${student.name}`,
      currentAttention: 85, // Este valor vendrá en tiempo real del backend por WebSockets o Polling
      correctAnswers: 4,
      elapsedTime: "12:45"
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16 font-sans">
      <Navbar />

      <div className="p-8 max-w-7xl mx-auto">
        
        {/* CASO 1: MONITORIZACIÓN "EN PROGRESO" (VISTA DE ALTO IMPACTO) */}
        {activeSession && (
          <div className="mb-12 bg-slate-950 border border-purple-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(124,58,237,0.15)] animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
              <div>
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  • Intervención en Tiempo Real
                </span>
                <h2 className="text-3xl font-black mt-2 tracking-tight">Sesión Activa: <span className="text-purple-400">{activeSession.studentName}</span></h2>
              </div>
              <button 
                onClick={() => setActiveSession(null)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Finalizar y Guardar
              </button>
            </div>

            {/* GRID DE MÉTRICAS IMPACTANTES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CARD: FOCO ATENCIONAL */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Atención Sostenida</p>
                  <Brain className="text-blue-400 size-6" />
                </div>
                <div>
                  <h3 className="text-5xl font-black text-blue-400">{activeSession.currentAttention}%</h3>
                  {/* Barra de progreso de neón */}
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeSession.currentAttention}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* CARD: ACIERTOS DEL ROBOT */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aciertos con el Robot</p>
                  <Bot className="text-emerald-400 size-6" />
                </div>
                <div>
                  <h3 className="text-5xl font-black text-emerald-400">{activeSession.correctAnswers} <span className="text-xl text-slate-500">/ 5</span></h3>
                  <p className="text-slate-400 text-xs mt-3 font-medium">Interacciones físicas del alumno validadas.</p>
                </div>
              </div>

              {/* CARD: CRONÓMETRO */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tiempo Transcurrido</p>
                  <Clock className="text-purple-400 size-6" />
                </div>
                <div>
                  <h3 className="text-5xl font-black text-slate-100 tracking-mono">{activeSession.elapsedTime}</h3>
                  <p className="text-slate-400 text-xs mt-3 font-medium">Límite recomendado: 30 minutos.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* CASO 2: ALUMNOS REGISTRADOS CON DESPLEGABLES */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Panel de Control Docente</h1>
          <p className="text-slate-400 mt-1">Selecciona un alumno para desplegar su expediente o iniciar sesión.</p>
        </div>

        {/* LISTA DE TARJETAS DESPLEGABLES */}
        <div className="space-y-4">
          {students.map((student) => {
            const isExpanded = expandedStudentId === student.id;

            return (
              <div 
                key={student.id} 
                className={`bg-slate-950 border transition-all rounded-2xl overflow-hidden ${
                  isExpanded ? "border-purple-500/50 shadow-lg" : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* CABECERA DE LA TARJETA (SIEMPRE VISIBLE) */}
                <div 
                  onClick={() => toggleExpand(student.id)} 
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 border border-slate-800 text-purple-400 rounded-xl">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">{student.name}</h3>
                      <p className="text-slate-400 text-xs font-medium mt-0.5">Edad: {student.age} años • Diagnóstico TDAH: <span className="font-bold text-slate-300">{student.hyperactivity}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {/* LANZAR SESIÓN */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Evita abrir el desplegable al dar click al botón
                        startSession(student);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play size={14} fill="white" /> Iniciar Intervención
                    </button>
                    
                    {/* INDICADOR DESPLEGABLE */}
                    <div className="text-slate-400 pl-2">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* CONTENIDO DESPLEGABLE (SESIONES REGISTRADAS) */}
                {isExpanded && (
                  <div className="border-t border-slate-900 bg-slate-900/40 p-6 animate-slide-down">
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Activity size={14} /> Historial Clínico de Sesiones Guardadas
                    </h4>

                    <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                            <th className="p-4">ID Sesión</th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Duración</th>
                            <th className="p-4 text-center">Foco Atencional Medio</th>
                            <th className="p-4 text-center">Precisión</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-medium text-slate-300 divide-y divide-slate-900">
                          {student.sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-slate-900/50">
                              <td className="p-4 font-mono text-slate-500 font-bold">{session.id}</td>
                              <td className="p-4 text-slate-400">{session.date}</td>
                              <td className="p-4 text-slate-400">{session.duration}</td>
                              <td className="p-4 text-center">
                                <span className="text-blue-400 font-bold">{session.attention}%</span>
                              </td>
                              <td className="p-4 text-center text-emerald-400 font-bold">{session.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Students;