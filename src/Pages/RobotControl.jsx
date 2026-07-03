import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

// Iconos profesionales
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Square, 
  Calculator, 
  Send, 
  Terminal, 
  Smile, 
  AlertCircle 
} from "lucide-react";

function RobotControl() {
  // ESTADOS DE CONEXIÓN
  const [isConnected, setIsConnected] = useState(true);
  const [latency, setLatency] = useState(42);

  // ESTADO DE LA TERMINAL / LOGS
  const [logs, setLogs] = useState([
    { time: "12:50:02", type: "system", text: "Módulo de telemetría RoboNeuroED inicializado." },
    { time: "12:50:03", type: "success", text: "Enlace serial establecido con el robot exitosamente." }
  ]);

  // ESTADOS DEL MÓDULO MATEMÁTICO
  const [numA, setNumA] = useState(5);
  const [numB, setNumB] = useState(3);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'success' o 'error'

  // Simulación de fluctuación de latencia de red (Detalle profesional)
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * (60 - 35 + 1)) + 35);
    }, 4000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Función para registrar eventos en la terminal integrada
  const addLog = (type, text) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setLogs((prevLogs) => [{ time: timeStr, type, text }, ...prevLogs]);
  };

  // CONTROL DE DIRECCIÓN DEL ROBOT
  const sendRobotCommand = (direction) => {
    if (!isConnected) {
      addLog("error", `Fallo al enviar comando [${direction}]: Robot fuera de línea.`);
      return;
    }
    addLog("command", `Dirección transmitida: VEHÍCULO_${direction.toUpperCase()}`);
  };

  // GENERADOR DE OPERACIONES MATEMÁTICAS TDAH
  const generateNewOperation = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setNumA(a);
    setNumB(b);
    setUserAnswer("");
    setFeedback(null);
    addLog("system", `Nueva tarea pedagógica generada: Calcular la suma de ${a} + ${b}`);
  };

  // VALIDACIÓN DE LA RESPUESTA DEL NIÑO
  const checkAnswer = (e) => {
    e.preventDefault();
    const correct = numA + numB;
    
    if (parseInt(userAnswer) === correct) {
      setFeedback("success");
      addLog("success", `Respuesta del alumno: CORRECTA (${userAnswer}). Disparando estímulo visual en el robot.`);
    } else {
      setFeedback("error");
      addLog("error", `Respuesta del alumno: INCORRECTA (${userAnswer}). Requerido soporte pedagógico.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <div className="p-8 max-w-7xl mx-auto">
        {/* ENCABEZADO */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950 tracking-tight">Centro de Control Robótico</h1>
            <p className="text-slate-500 mt-1 text-base">Teleoperación e Intervención Didáctica TDAH</p>
          </div>

          {/* INDICADOR STATUS INDUSTRIAL */}
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border font-bold text-sm shadow-sm transition-colors ${
            isConnected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {isConnected ? <Wifi size={18} className="animate-pulse" /> : <WifiOff size={18} />}
            <div>
              <p className="leading-none">{isConnected ? "SISTEMA ONLINE" : "SISTEMA OFFLINE"}</p>
              {isConnected && <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Latencia: {latency} ms</p>}
            </div>
            <button 
              onClick={() => {
                setIsConnected(!isConnected);
                addLog("system", isConnected ? "Enlace de radio desconectado manualmente." : "Reconectando con el firmware del robot...");
              }}
              className="ml-2 text-xs bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl cursor-pointer text-slate-700 transition-colors"
            >
              {isConnected ? "Desconectar" : "Conectar"}
            </button>
          </div>
        </div>

        {/* REJILLA PRINCIPAL DE CONTROL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* BLOQUE IZQUIERDO: JOYSTICK Y COMANDOS DE MOVIMIENTO */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col items-center">
              <h2 className="text-xl font-bold text-slate-800 mb-6 w-full flex items-center gap-2">
                <Cpu size={18} className="text-purple-600" /> Control de Actuadores Motores
              </h2>

              {/* DISEÑO DEL PAD DIRECCIONAL */}
              <div className="grid grid-cols-3 gap-3 max-w-[260px] w-full aspect-square mb-4">
                <div />
                <button onClick={() => sendRobotCommand("avanzar")} className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center p-5 shadow-md active:scale-95 transition-all cursor-pointer">
                  <ArrowUp size={28} />
                </button>
                <div />

                <button onClick={() => sendRobotCommand("giro_izquierda")} className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center p-5 shadow-md active:scale-95 transition-all cursor-pointer">
                  <ArrowLeft size={28} />
                </button>
                <button onClick={() => sendRobotCommand("detener")} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center p-5 shadow-md active:scale-95 transition-all cursor-pointer">
                  <Square size={28} fill="white" />
                </button>
                <button onClick={() => sendRobotCommand("giro_derecha")} className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center p-5 shadow-md active:scale-95 transition-all cursor-pointer">
                  <ArrowRight size={28} />
                </button>

                <div />
                <button onClick={() => sendRobotCommand("retroceder")} className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center p-5 shadow-md active:scale-95 transition-all cursor-pointer">
                  <ArrowDown size={28} />
                </button>
                <div />
              </div>
              <p className="text-xs text-slate-400 font-medium text-center mt-2">Transmisión por paquete UDP en tiempo real</p>
            </div>
          </div>

          {/* BLOQUE DERECHO: GAMIFICACIÓN MATEMÁTICA PEDAGÓGICA */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><Calculator size={18} className="text-blue-600" /> Estímulo Cognitivo Dinámico</span>
                <button onClick={generateNewOperation} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors">
                  Generar Ejercicio
                </button>
              </h2>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center mb-6">
                <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-2">Panel Visual del Dispositivo del Estudiante</p>
                <h3 className="text-5xl font-black text-slate-800 tracking-tight">
                  {numA} + {numB} = <span className="text-blue-600">?</span>
                </h3>
              </div>

              {/* FORMULARIO DE RESPUESTA */}
              <form onSubmit={checkAnswer} className="flex gap-4">
                <input 
                  type="number"
                  required
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Introduce el resultado..." 
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 bg-slate-50 font-medium text-slate-800"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-colors">
                  <Send size={16} /> Validar
                </button>
              </form>

              {/* SECCIÓN FEEDBACK INTELIGENTE */}
              {feedback === "success" && (
                <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 font-medium text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  <Smile className="text-emerald-600 shrink-0" size={20} />
                  <span>¡Excelente! Respuesta correcta. El robot celebrará encendiendo luces de colores para reforzar la atención del alumno.</span>
                </div>
              )}
              {feedback === "error" && (
                <div className="mt-5 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-800 font-medium text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  <AlertCircle className="text-red-600 shrink-0" size={20} />
                  <span>Respuesta incorrecta. Invita al estudiante a contar de nuevo despacio. ¡Él puede lograrlo!</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* TERMINAL INTEGRADA / BITÁCORA DE TELEMETRÍA */}
        <div className="mt-8 bg-slate-950 rounded-2xl border border-slate-800 p-6 font-mono text-xs shadow-xl">
          <h3 className="text-slate-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider pb-3 border-b border-slate-900">
            <Terminal size={14} className="text-purple-400" /> Consola de Telemetría RoboNeuroED v1.0.0
          </h3>
          
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 leading-relaxed">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className={`font-bold shrink-0 ${
                  log.type === "error" ? "text-red-400" :
                  log.type === "success" ? "text-emerald-400" :
                  log.type === "command" ? "text-blue-400" : "text-purple-400"
                }`}>
                  {log.type.toUpperCase()}:
                </span>
                <span className="text-slate-300">{log.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default RobotControl;