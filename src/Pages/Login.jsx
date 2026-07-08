import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // No hace falta redirigir manualmente: AuthContext actualiza
      // isAuthenticated y App.jsx se encarga de mostrar la app.
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 border border-gray-100">
        
        {/* LOGO / ENCABEZADO */}
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-indigo-600 size-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">RoboNeuroED</h1>
          <p className="text-gray-500 mt-2">Acceso al Sistema de Gestión TDAH</p>
        </div>

        {/* ALERTA DE ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
            {error}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-semibold block mb-2 text-gray-700">Correo Electrónico</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-gray-400 size-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@neuroed.com"
                className="w-full border border-gray-300 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2 text-gray-700">Contraseña</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-400 size-5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[1.01] transition-all text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Verificando...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;
