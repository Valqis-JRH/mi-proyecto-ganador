'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  // Iniciamos con 150, pero luego intentaremos leer la memoria
  const [saldo, setSaldo] = useState(150.00);
  const [mensaje, setMensaje] = useState("");
  
  const [destinatario, setDestinatario] = useState("");
  const [montoAPagar, setMontoAPagar] = useState(0);
  const [escaneando, setEscaneando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true); // Para evitar parpadeos

  // 1. EFECTO DE CARGA: Al iniciar, buscamos si hay dinero guardado
  useEffect(() => {
    // Buscamos en la cajita "chambaPaySaldo" del navegador
    const saldoGuardado = localStorage.getItem("chambaPaySaldo");
    if (saldoGuardado) {
      setSaldo(parseFloat(saldoGuardado)); // Si hay, lo usamos
    }
    setCargandoDatos(false); // Ya terminamos de cargar
  }, []);

  // 2. EFECTO DE GUARDADO: Cada vez que el saldo cambie, lo guardamos
  useEffect(() => {
    // Guardamos el nuevo saldo en la cajita
    localStorage.setItem("chambaPaySaldo", saldo.toString());
  }, [saldo]);

  const pagar = () => {
    if (montoAPagar === 0) {
      setMensaje("⚠️ Primero escanea un QR");
      return;
    }
    if (saldo >= montoAPagar) {
      setSaldo(saldo - montoAPagar); // Esto activará el guardado automático
      setMensaje(`¡Pago exitoso a ${destinatario}! - S/ ${montoAPagar.toFixed(2)}`);
      setMontoAPagar(0);
      setDestinatario("");
    } else {
      setMensaje("❌ Saldo insuficiente");
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  const simularEscaneoIA = () => {
    setEscaneando(true);
    setMensaje("🤖 La IA está analizando el QR...");

    setTimeout(() => {
        setDestinatario("Bodega 'El Chato'");
        setMontoAPagar(25.50);
        setMensaje("✅ ¡QR detectado con éxito!");
        setEscaneando(false);
    }, 2500);
  };

  // Prevenimos mostrar datos incorrectos mientras leemos la memoria
  if (cargandoDatos) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Cargando billetera...</div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 font-sans">
      
      <div className="w-full max-w-sm bg-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 relative">
        
        <div className="bg-purple-800 p-6 text-center">
          <h2 className="text-white font-bold text-2xl tracking-wider">ChambaPay</h2>
        </div>

        <div className="bg-white h-[450px] p-6 flex flex-col items-center pt-8 rounded-t-3xl mt-[-20px]">
          
          <p className="text-gray-500 text-sm font-medium">SALDO DISPONIBLE</p>
          <h1 className="text-4xl font-bold text-gray-800 mt-1 mb-6 animate-fade-in">
            S/ {saldo.toFixed(2)}
          </h1>

          <div className="w-full bg-purple-50 p-4 rounded-xl mb-4 border-2 border-dashed border-purple-300 flex flex-col items-center">
            
            {escaneando ? (
                <div className="animate-pulse flex flex-col items-center text-purple-600">
                    <svg className="w-10 h-10 mb-2 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"></path>
                    </svg>
                    <span className="font-bold">Analizando imagen...</span>
                </div>
            ) : destinatario ? (
                <div className="text-center w-full animate-bounce">
                    <p className="text-xs text-gray-500 mb-1">Pagar a:</p>
                    <h3 className="text-xl font-bold text-purple-800">{destinatario}</h3>
                    <h2 className="text-3xl font-black text-gray-900 mt-2">S/ {montoAPagar.toFixed(2)}</h2>
                </div>
            ) : (
                <button onClick={simularEscaneoIA} className="flex flex-col items-center text-purple-500 hover:text-purple-700 transition group">
                    <svg className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Escanear QR con IA</span>
                </button>
            )}
            
          </div>

          <button 
            onClick={pagar}
            disabled={montoAPagar === 0 || escaneando}
            className={`w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2
                ${montoAPagar > 0 ? 'bg-purple-600 hover:bg-purple-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}
            `}
          >
            💸 Pagar Ahora
          </button>

          {mensaje && (
            <div className={`mt-4 text-center text-sm font-bold animate-fade-in ${mensaje.includes('insuficiente') || mensaje.includes('Primero') ? 'text-red-500' : 'text-green-600'}`}>
              {mensaje}
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-gray-500 text-sm max-w-xs text-center">
        Versión con Memoria: Tu saldo se guarda en este dispositivo.
      </p>
    </div>
  );
}