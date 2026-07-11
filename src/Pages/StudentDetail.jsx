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
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Paleta (misma marca que la web: índigo + esmeralda, sin colores nuevos)
    const INDIGO = [79, 70, 229];
    const INDIGO_LIGHT = [238, 237, 253];
    const EMERALD = [5, 150, 105];
    const SLATE_900 = [15, 23, 42];
    const SLATE_500 = [100, 116, 139];
    const SLATE_200 = [226, 232, 240];

    // ---------- ENCABEZADO ----------
    doc.setFillColor(...SLATE_900);
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setFont(undefined, "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("ROBO", margin, 16);
    const roboWidth = doc.getTextWidth("ROBO");
    doc.setTextColor(...INDIGO);
    doc.text("NEURO", margin + roboWidth, 16);
    const neuroWidth = doc.getTextWidth("NEURO");
    doc.setTextColor(255, 255, 255);
    doc.text("ED", margin + roboWidth + neuroWidth, 16);

    doc.setFont(undefined, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text("Sistema de Telemetría Neuro-Robótica", margin, 21.5);

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const reportTitle = "REPORTE DE PROGRESO";
    doc.text(reportTitle, pageWidth - margin - doc.getTextWidth(reportTitle), 16);

    // ---------- CAJA DE METADATOS ----------
    let y = 38;
    doc.setDrawColor(...SLATE_200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "FD");

    const metaColWidth = contentWidth / 2;
    const drawMeta = (label, value, x, yPos) => {
      doc.setFont(undefined, "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_500);
      doc.text(label, x, yPos);
      doc.setFont(undefined, "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...SLATE_900);
      doc.text(value, x, yPos + 5.5);
    };

    drawMeta("ESTUDIANTE", student.name, margin + 8, y + 10);
    drawMeta("FECHA DEL REPORTE", new Date().toLocaleDateString("es-EC"), margin + metaColWidth + 4, y + 10);
    drawMeta("CONDICIÓN", student.condition || "No especificada", margin + 8, y + 20);
    drawMeta("ID ESTUDIANTE", `ALU-${String(student.id).padStart(3, "0")}`, margin + metaColWidth + 4, y + 20);

    // ---------- RESUMEN GENERAL (tarjetas) ----------
    y += 36;
    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...SLATE_900);
    doc.text("RESUMEN GENERAL", margin, y);
    doc.setDrawColor(...SLATE_200);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);

    y += 8;
    const cardGap = 4;
    const cardWidth = (contentWidth - cardGap * 3) / 4;
    const cardHeight = 22;

    const stats = [
      { value: String(progress.length), label: "Sesiones\nTotales" },
      { value: `${avgFocus}%`, label: "Foco\nPromedio" },
      { value: `${totalMinutes} min`, label: "Tiempo\nInvertido" },
      { value: String(student.streak || 0), label: `Racha Actual\n(mejor: ${student.bestStreak || 0})` },
    ];

    stats.forEach((stat, i) => {
      const x = margin + i * (cardWidth + cardGap);
      doc.setDrawColor(...SLATE_200);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");

      doc.setFont(undefined, "bold");
      doc.setFontSize(15);
      doc.setTextColor(...INDIGO);
      doc.text(stat.value, x + cardWidth / 2, y + 10, { align: "center" });

      doc.setFont(undefined, "normal");
      doc.setFontSize(7);
      doc.setTextColor(...SLATE_500);
      const lines = stat.label.split("\n");
      lines.forEach((line, li) => {
        doc.text(line, x + cardWidth / 2, y + 15.5 + li * 3.2, { align: "center" });
      });
    });

    // ---------- HISTORIAL DE SESIONES ----------
    y += cardHeight + 12;
    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...SLATE_900);
    doc.text("HISTORIAL DE SESIONES", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);

    autoTable(doc, {
      startY: y + 6,
      margin: { left: margin, right: margin },
      head: [["Fecha", "Foco Atencional", "Duración", "Evaluación"]],
      body: progress.length
        ? progress.map((p) => [
            p.date,
            `${p.focusScore}%`,
            `${p.duration} min`,
            p.focusScore >= 85 ? "Excelente" : p.focusScore >= 70 ? "Regular" : "Bajo",
          ])
        : [["—", "Sin sesiones registradas todavía", "—", "—"]],
      headStyles: { fillColor: SLATE_900, textColor: 255, fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9, textColor: SLATE_900 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 4 },
    });

    // ---------- NOTA LEGAL / INFORMATIVA ----------
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(...INDIGO);
    doc.setLineWidth(0.8);
    doc.line(margin, finalY, margin, finalY + 18);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 1, finalY, contentWidth - 1, 18, "F");

    doc.setFont(undefined, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_900);
    doc.text("NOTA INFORMATIVA", margin + 5, finalY + 5.5);

    doc.setFont(undefined, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_500);
    const disclaimer = doc.splitTextToSize(
      "Este reporte es generado automáticamente por RoboNeuroED a partir de los datos registrados por el sistema robótico y su plataforma web. Su propósito es servir de apoyo informativo a docentes, terapeutas y padres de familia en el seguimiento del progreso atencional del estudiante.",
      contentWidth - 10
    );
    doc.text(disclaimer, margin + 5, finalY + 10);

    // ---------- PIE DE PÁGINA ----------
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont(undefined, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_500);
      doc.text("RoboNeuroED — Sistema de Telemetría Neuro-Robótica", margin, doc.internal.pageSize.height - 8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - margin - doc.getTextWidth(`Página ${i} de ${pageCount}`),
        doc.internal.pageSize.height - 8
      );
    }

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
