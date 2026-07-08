import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Activity, Cpu, Users, Zap, Loader2 } from "lucide-react";
import { apiFetch } from "../api/client";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs font-bold">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="text-white font-mono">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ sessionsCount: 0, avgAttention: 0 });
  const [robotStatus, setRobotStatus] = useState("Desconectado");
  const [studentsCount, setStudentsCount] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [statsData, weeklyDataRes, studentsRes, robotStatusRes] = await Promise.all([
          apiFetch("/sessions/stats/dashboard"),
          apiFetch("/sessions/stats/weekly-attention"),
          apiFetch("/students"),
          apiFetch("/robot/status"),
        ]);
        setStats(statsData);
        setWeeklyData(weeklyDataRes);
        setStudentsCount(studentsRes.length);
        setRobotStatus(robotStatusRes.status);
      } catch (err) {
        setError(err.message || "No se pudo cargar la información del dashboard.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();

    // Refresca solo el estado del robot cada 5s, sin recargar todo el dashboard
    const intervalId = setInterval(async () => {
      try {
        const robotStatusRes = await apiFetch("/robot/status");
        setRobotStatus(robotStatusRes.status);
      } catch {
        // Silencioso: si falla un ping no vale la pena mostrar error
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const hardwareColor =
    robotStatus === "Activo" ? "text-emerald-400" : robotStatus === "Inactivo" ? "text-amber-400" : "text-slate-500";

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-wider text-white">
              CONSOLA DE OPERACIONES
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Panel General de Control y Telemetría Neuro-Robótica
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-bold mb-6">
            {error}
          </div>
        )}

        {/* REJILLA DE TARJETAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0b1329] border border-slate-800 shadow-lg shadow-black/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Sesiones Realizadas</p>
              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><Activity size={14} /></div>
            </div>
            <p className="text-5xl font-black text-white">{loading ? "…" : stats.sessionsCount}</p>
          </div>

          <div className="bg-[#0b1329] border border-slate-800 shadow-lg shadow-black/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Hardware Status</p>
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><Cpu size={14} /></div>
            </div>
            <p className={`text-5xl font-black ${hardwareColor}`}>{loading ? "…" : robotStatus}</p>
          </div>

          <div className="bg-[#0b1329] border border-slate-800 shadow-lg shadow-black/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Estudiantes Registrados</p>
              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><Users size={14} /></div>
            </div>
            <p className="text-5xl font-black text-white">{loading ? "…" : studentsCount}</p>
          </div>

          <div className="bg-[#0b1329] border border-slate-800 shadow-lg shadow-black/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Atención Promedio</p>
              <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><Zap size={14} /></div>
            </div>
            <p className="text-5xl font-black text-white">{loading ? "…" : `${stats.avgAttention}%`}</p>
          </div>
        </div>

        {/* GRÁFICO INFERIOR */}
        <div className="bg-[#0b1329] border border-slate-800 shadow-lg shadow-black/20 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase text-slate-400">Progreso Atencional Semanal</h3>
              <p className="text-[10px] text-slate-600 mt-1">Ondas Alpha, Beta y nivel de engagement del casco EEG acoplado.</p>
            </div>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-bold whitespace-nowrap">DATO EN VIVO</span>
          </div>

          <div className="w-full h-80 flex items-center justify-center">
            {loading ? (
              <Loader2 className="animate-spin text-slate-600" size={28} />
            ) : weeklyData.length === 0 ? (
              <div className="text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sin datos esta semana</p>
                <p className="text-[10px] text-slate-600 mt-1">La gráfica se llenará en cuanto se registren sesiones.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtencion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAlpha" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBeta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="day"
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
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
                    formatter={(value) => <span style={{ color: "#94a3b8" }}>{value}</span>}
                  />
                  <Area type="monotone" dataKey="atencion" name="Atención" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorAtencion)" dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="alpha" name="Ondas Alpha" stroke="#818cf8" strokeWidth={2} fill="url(#colorAlpha)" dot={{ r: 3, fill: "#818cf8", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="beta" name="Ondas Beta" stroke="#94a3b8" strokeWidth={2} fill="url(#colorBeta)" dot={{ r: 3, fill: "#94a3b8", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
