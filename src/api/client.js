// Configuración básica para simular o conectar tus peticiones a futuro
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('robo_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  console.log(`Petición simulada a: ${endpoint}`);

  // Simulamos respuestas correctas estructuradas según el endpoint que pida tu Dashboard
  if (endpoint === "/sessions/stats/dashboard") {
    return {
      sessionsCount: 24,
      avgAttention: 78,
      hardwareStatus: "Activo"
    };
  }

  if (endpoint === "/sessions/stats/weekly-attention") {
    return [
      { day: "Lun", atencion: 65, alpha: 40, beta: 55 },
      { day: "Mar", atencion: 70, alpha: 45, beta: 60 },
      { day: "Mié", atencion: 78, alpha: 38, beta: 72 },
      { day: "Jue", atencion: 72, alpha: 50, beta: 65 },
      { day: "Vie", atencion: 85, alpha: 42, beta: 80 },
    ];
  }

  if (endpoint === "/students") {
    return [
      { id: 1, name: "Estudiante Alfa" },
      { id: 2, name: "Estudiante Beta" },
      { id: 3, name: "Estudiante Gamma" }
    ];
  }

  // Respuesta por defecto genérica
  return [];
};