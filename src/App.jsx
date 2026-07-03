import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Sessions from "./pages/Sessions";
import Configuration from "./pages/Configuration";

function PrivateRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      {/* Redirección automática inicial */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Mapeo estricto de las vistas de la plataforma */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/estudiantes" element={<Students />} />
      <Route path="/sesiones" element={<Sessions />} />
      <Route path="/configuracion" element={<Configuration />} />

      {/* Captura de error 404 corregida */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center font-sans p-4">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-wider mb-2">
              404 - Módulo no Encontrado
            </h1>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
              La dirección solicitada no forma parte de la topología de red activa de la Consola Neuro-Robótica.
            </p>
            <a
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all"
            >
              Retornar a Operaciones
            </a>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <PrivateRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;