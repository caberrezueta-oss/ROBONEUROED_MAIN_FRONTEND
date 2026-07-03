import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Comprobar si ya había una sesión guardada en el navegador
    const savedUser = localStorage.getItem('robo_user');
    const token = localStorage.getItem('robo_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Función de Login que espera tu archivo Login.jsx
  const login = async (email, password) => {
    // NOTA: Aquí es donde harás el fetch/axios a tu API en el futuro.
    // De momento, simulamos una validación mock:
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validación de prueba sencilla (puedes cambiarla o quitarla al conectar tu backend)
        if (email && password.length >= 4) {
          const mockUser = { email, name: "Operador Neuro-Robótico" };
          const mockToken = "fake-jwt-token-12345";

          // Guardamos datos en el navegador para que no se cierre la sesión al recargar
          localStorage.setItem('robo_user', JSON.stringify(mockUser));
          localStorage.setItem('robo_token', mockToken);

          setUser(mockUser);
          setIsAuthenticated(true);
          resolve(mockUser);
        } else {
          reject(new Error("Credenciales inválidas o contraseña muy corta."));
        }
      }, 1500); // Simula el retraso de la red (1.5 segundos)
    });
  };

  // Función para cerrar sesión (puedes usarla en tu Navbar o Configuración)
  const logout = () => {
    localStorage.removeItem('robo_user');
    localStorage.removeItem('robo_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {!loading ? children : (
        // Pantalla de carga estética mientras verifica si el usuario ya estaba logueado
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Iniciando Sistemas de Red...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};