import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, TrendingUp, Clock, Activity, Flame, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";
import { apiFetch } from "../api/client";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs font-bold text-white">
        Foco: <span className="text-indigo-400 font-mono">{payload[0].value}%</span>
      </p>
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(`/students/${id}/progress`);
        setStudent(data.student);
        setProgress(data.progress.map((p) => ({ ...p, date: p.date })));
      } catch (err) {
        setError(err.message || "No se pudo cargar el progreso del estudiante.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const avgFocus = progress.length
    ? Math.round(progress.reduce((a, b) => a + b.focusScore, 0) / progress.length)
    : 0;
  const totalMinutes = progress.reduce((a, b) => a + (b.duration || 0), 0);

  const handleDownloadPdf = () => {
    if (!student) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("RoboNeuroED — Reporte de Progreso", 14, 20);

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(`Estudiante: ${student.name}`, 14, 32);
    doc.text(`Condición: ${student.condition || "No especificada"}`, 14, 39);
    doc.text(`Fecha del reporte: ${new Date().toLocaleDateString("es-EC")}`, 14, 46);

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Resumen General", 14, 58);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`Sesiones totales: ${progress.length}`, 14, 65);
    doc.text(`Foco atencional promedio: ${avgFocus}%`, 14, 71);
    doc.text(`Tiempo total invertido: ${totalMinutes} minutos`, 14, 77);
    doc.text(`Racha actual: ${student.streak || 0}  (mejor racha: ${student.bestStreak || 0})`, 14, 83);

    autoTable(doc, {
      startY: 92,
      head: [["Fecha", "Foco Atencional", "Duración"]],
      body: progress.map((p) => [p.date, `${p.focusScore}%`, `${p.duration} min`]),
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
    });

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      "Este reporte es generado automáticamente por RoboNeuroED con fines informativos para docentes, padres y terapeutas.",
      14,
      doc.internal.pageSize.height - 10
    );

    doc.save(`Reporte_${student.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 font-sans">
      <Navbar />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/estudiantes")}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Volver a Estudiantes
        </button>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-slate-600 mb-3" size={26} />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando progreso...</p>
          </div>
        ) : student ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase italic capitalize">{student.name}</h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {student.condition || "Sin condición registrada"}
                </p>
              </div>
              <button
                onClick={handleDownloadPdf}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                <FileDown size={14} /> Descargar Reporte PDF
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Sesiones Totales</p>
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><Activity size={14} /></div>
                </div>
                <p className="text-4xl font-black text-white">{progress.length}</p>
              </div>
              <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Foco Promedio</p>
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><TrendingUp size={14} /></div>
                </div>
                <p className="text-4xl font-black text-white">{avgFocus}%</p>
              </div>
              <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Tiempo Total</p>
                  <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><Clock size={14} /></div>
                </div>
                <p className="text-4xl font-black text-white">{totalMinutes} min</p>
              </div>
              <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Racha Actual</p>
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><Flame size={14} /></div>
                </div>
                <p className="text-4xl font-black text-amber-400">{student.streak || 0}</p>
                {student.bestStreak > 0 && (
                  <p className="text-[10px] text-slate-600 mt-1">Mejor racha: {student.bestStreak}</p>
                )}
              </div>
            </div>

            <div className="bg-[#0b1329] border border-slate-900 p-6 rounded-2xl">
              <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-6">Evolución del Foco Atencional</h3>

              {progress.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sin sesiones registradas</p>
                  <p className="text-[11px] text-slate-600 mt-1">La gráfica aparecerá en cuanto este estudiante complete su primera sesión.</p>
                </div>
              ) : (
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progress} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                        axisLine={{ stroke: "#1e293b" }}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        width={35}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="focusScore"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ fill: "#6366f1", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
