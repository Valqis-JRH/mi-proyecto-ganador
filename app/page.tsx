'use client';

import { useState } from 'react';
// Importamos un icono de cámara (ya viene instalado con lucide-react)
import { Camera } from 'lucide-react';

export default function Home() {
  const [saldo, setSaldo] = useState(150.00);
  const [mensaje, setMensaje] = useState("");
  
  // NUEVOS ESTADOS PARA LA "IA"
  const [destinatario, setDestinatario] = useState("");
  const [montoAPagar, setMontoAPagar] = useState(0);
  const [escaneando, setEscaneando] = useState(false); // Para mostrar que está "pensando"

  // Función para pagar (ahora usa el monto escaneado)
  const pagar = () => {
    if (montoAPagar === 0) {
      setMensaje("⚠️ Primero escanea un QR");
      return;
    }
    if (saldo >= montoAPagar) {
      setSaldo(saldo - montoAPagar);
      setMensaje(`¡Pago exitoso a ${destinatario}! - S/ ${montoAPagar.toFixed(2)}`);
      setMontoAPagar(0); // Reseteamos
      setDestinatario("");
    } else {
      setMensaje("❌ Saldo insuficiente");
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  // LA MAGIA: Simulamos que la IA está leyendo un QR
  const simularEscaneoIA = () => {
    setEscaneando(true); // Activamos modo "pensando"
    setMensaje("🤖 La IA está analizando el QR...");

    // Simulamos una espera de 2 segundos (como si fueramos a OpenAI)
    setTimeout(() => {
        // DATOS FALSOS QUE "LEYÓ" LA IA
        setDestinatario("Bodega 'El Chato'");
        setMontoAPagar(25.50);
        
        setMensaje("✅ ¡QR detectado con éxito!");
        setEscaneando(false); // Terminó de pensar
    }, 2500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 font-sans">
      
      <div className="w-full max-w-sm bg-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 relative">
        
        {/* Header App */}
        <div className="bg-purple-800 p-6 text-center">
          <h2 className="text-white font-bold text-2xl tracking-wider">ChambaPay</h2>
        </div>

        {/* Cuerpo de la App */}
        <div className="bg-white h-[450px] p-6 flex flex-col items-center pt-8 rounded-t-3xl mt-[-20px]">
          
          <p className="text-gray-500 text-sm font-medium">SALDO DISPONIBLE</p>
          <h1 className="text-4xl font-bold text-gray-800 mt-1 mb-6">
            S/ {saldo.toFixed(2)}
          </h1>

          {/* Área de Escaneo con IA */}
          <div className="w-full bg-purple-50 p-4 rounded-xl mb-4 border-2 border-dashed border-purple-300 flex flex-col items-center">
            
            {escaneando ? (
                // Esto se muestra mientras "piensa"
                <div className="animate-pulse flex flex-col items-center text-purple-600">
                    <Camera className="w-10 h-10 mb-2 animate-spin" />
                    <span className="font-bold">Analizando imagen...</span>
                </div>
            ) : destinatario ? (
                // Esto se muestra cuando la IA terminó
                <div className="text-center w-full">
                    <p className="text-xs text-gray-500 mb-1">Pagar a:</p>
                    <h3 className="text-xl font-bold text-purple-800">{destinatario}</h3>
                    <h2 className="text-3xl font-black text-gray-900 mt-2">S/ {montoAPagar.toFixed(2)}</h2>
                </div>
            ) : (
                // Esto se muestra al inicio
                <button onClick={simularEscaneoIA} className="flex flex-col items-center text-purple-500 hover:text-purple-700 transition">
                    <Camera className="w-12 h-12 mb-2" />
                    <span className="font-medium">Escanear QR con IA</span>
                </button>
            )}
            
          </div>


          {/* Botón Pagar (Solo se activa si hay monto) */}
          <button 
            onClick={pagar}
            disabled={montoAPagar === 0 || escaneando}
            className={`w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2
                ${montoAPagar > 0 ? 'bg-purple-600 hover:bg-purple-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}
            `}
          >
            💸 Pagar Ahora
          </button>

          {/* Mensaje de Estado */}
          {mensaje && (
            <div className="mt-4 text-center text-sm font-bold text-purple-700 animate-fade-in">
              {mensaje}
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-gray-500 text-sm max-w-xs text-center">
        Hackathon Tip: Usa `setTimeout` para simular cargas de IA. Los jueces aman el feedback visual.
      </p>
    </div>
  );
}