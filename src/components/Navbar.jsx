import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Bell, ChevronDown, Settings, LogOut, Menu, X, Bot, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-xs font-bold tracking-widest uppercase transition-all ${
    isActive ? "text-white font-black" : "text-slate-400 hover:text-slate-200"
  }`;

const mobileNavLinkClass = ({ isActive }) =>
  `text-sm font-bold tracking-widest uppercase transition-all px-4 py-3 rounded-xl ${
    isActive ? "text-white bg-slate-900" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
  }`;

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-900/80 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LADO IZQUIERDO: LOGO Y LINKS DE NAVEGACIÓN */}
        <div className="flex items-center gap-10">
          {/* LOGO CORPORATIVO EXACTO */}
          <NavLink to="/dashboard" className="text-xl font-black tracking-wider text-white select-none">
            ROBO<span className="text-indigo-500">NEURO</span>ED
          </NavLink>
          
          {/* ENLACES DE RUTA - DESKTOP */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/estudiantes" className={navLinkClass}>Estudiantes</NavLink>
            <NavLink to="/sesiones" className={navLinkClass}>Sesiones</NavLink>
            <NavLink to="/robot" className={navLinkClass}>Robot</NavLink>
            <NavLink to="/calendario" className={navLinkClass}>Calendario</NavLink>
          </div>
        </div>

        {/* LADO DERECHO: NOTIFICACIONES Y PERFIL DESPLEGABLE (BOTÓN P) */}
        <div className="flex items-center gap-3 sm:gap-5 relative">
          
          {/* ICONO DE NOTIFICACIÓN */}
          <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer">
            <Bell size={18} />
          </button>
          
          {/* CONTENEDOR DEL AVATAR "P" CON DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 p-1 pr-2.5 rounded-xl hover:border-slate-700 transition-all cursor-pointer select-none"
            >
              <div className="w-8 h-8 bg-indigo-600 text-white font-black rounded-lg flex items-center justify-center text-sm shadow-lg shadow-indigo-600/10">
                {user?.name?.[0]?.toUpperCase() || "P"}
              </div>
              <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-white" : ""}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                
                <div className="absolute right-0 mt-3 w-52 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/40 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                      {user?.role === "admin" ? "Operador Root" : "Docente"}
                    </p>
                    <p className="text-xs font-bold text-slate-300 truncate">{user?.email || "profesor@roboneuro.edu"}</p>
                  </div>

                  <NavLink 
                    to="/configuracion"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
                  >
                    <Settings size={14} className="text-slate-500" />
                    Configuración Global
                  </NavLink>

                  <div className="border-t border-slate-800/60 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    Terminar Operación
                  </button>
                </div>
              </>
            )}
          </div>

          {/* BOTÓN HAMBURGUESA - SOLO MÓVIL */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-2 flex flex-col gap-1 border-t border-slate-900/80 pt-4">
          <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/estudiantes" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Estudiantes
          </NavLink>
          <NavLink to="/sesiones" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Sesiones
          </NavLink>
          <NavLink to="/robot" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            <span className="flex items-center gap-2"><Bot size={14} /> Robot</span>
          </NavLink>
          <NavLink to="/calendario" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            <span className="flex items-center gap-2"><CalendarDays size={14} /> Calendario</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
}
