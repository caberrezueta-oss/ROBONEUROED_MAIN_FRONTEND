import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const localStudents = localStorage.getItem("students");
    if (localStudents) {
      setStudents(JSON.parse(localStudents));
    } else {
      // Datos mock por si tu localStorage de alumnos está vacío
      const defaultStudents = [
        { id: "ALU-001", name: "María González", grade: "9no Grado", status: "Estable", lastSession: "2026-07-02" },
        { id: "ALU-002", name: "Carlos Rodríguez", grade: "10mo Grado", status: "Atento", lastSession: "2026-07-01" },
        { id: "ALU-003", name: "Ana Martínez", grade: "9no Grado", status: "Distraído", lastSession: "2026-06-28" }
      ];
      localStorage.setItem("students", JSON.stringify(defaultStudents));
      setStudents(defaultStudents);
    }
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans antialiased">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ENCABEZADO */}
        <div className="mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-wider text-white">
            PANEL DE ESTUDIANTES
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Control de perfiles neuro-educativos y registros vinculados.
          </p>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-[#0b1329] border border-slate-900 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <input 
              type="text" 
              placeholder="Buscar estudiante por nombre o ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#030712] border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 w-80 focus:outline-none"
            />
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {filtered.length} Alumnos Registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  <th className="pb-4">ID</th>
                  <th className="pb-4">NOMBRE COMPLETO</th>
                  <th className="pb-4">NIVEL</th>
                  <th className="pb-4">ESTADO EMOCIONAL</th>
                  <th className="pb-4">ÚLTIMA CONEXIÓN</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-300 divide-y divide-slate-800/40">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-900/20">
                    <td className="py-4 text-indigo-400 font-bold">{s.id}</td>
                    <td className="py-4 font-black text-white text-sm">{s.name}</td>
                    <td className="py-4 text-slate-400">{s.grade}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        s.status === "Estable" || s.status === "Atento" 
                          ? "text-emerald-400 bg-emerald-500/10" 
                          : "text-amber-400 bg-amber-500/10"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{s.lastSession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}