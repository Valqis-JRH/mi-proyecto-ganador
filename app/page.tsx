'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 👇 AQUÍ PEGAS TUS CLAVES DE SUPABASE (Las que copiaste de la web) 👇
const supabaseUrl = 'https://mbftmjustcrqotwyxvqa.supabase.co'; // <-- Ejemplo: https://xyz.supabase.co
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZnRtanVzdGNycW90d3l4dnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDQ4NzksImV4cCI6MjA4MDAyMDg3OX0.LNYgBJMaTioOq2ks7SGiR6Gi2cGod22TJkg7bOQ2fR8'; // <-- Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI...

// Creamos la conexión con la nube
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [saldo, setSaldo] = useState(0); 
  const [mensaje, setMensaje] = useState("");
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  // Estados para la cámara y pagos
  const [destinatario, setDestinatario] = useState("");
  const [montoAPagar, setMontoAPagar] = useState(0);
  const [escaneando, setEscaneando] = useState(false);

  // 1. CARGAR DATOS DE LA NUBE (AL INICIO)
  useEffect(() => {
    const obtenerSaldo = async () => {
      // Pedimos el saldo del usuario con ID 1 (Tu usuario de prueba)
      const { data, error } = await supabase
        .from('usuarios')
        .select('saldo')
        .eq('id', 1)
        .single();

      if (data) {
        setSaldo(data.saldo);
      } else {
        // Si no hay usuario 1, asumimos 150 para que se vea algo
        setSaldo(150); 
      }
      setCargandoDatos(false);
    };

    obtenerSaldo();

    // ⚡ MAGIA: SUSCRIPCIÓN EN TIEMPO REAL
    // Esto hace que si pagas en el celular, la PC se actualice sola
    const canal = supabase
      .channel('cambios-saldo')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'usuarios' }, (payload) => {
        setSaldo(payload.new.saldo);
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };

  }, []);

  // 2. FUNCIÓN PARA PAGAR (ENVIAR A LA NUBE)
  const pagar = async () => {
    if (montoAPagar === 0) {
        setMensaje("⚠️ Primero escanea un QR");
        return;
    }
    
    if (saldo >= montoAPagar) {
      const nuevoSaldo = saldo - montoAPagar;
      
      // Actualizamos visualmente rápido (para que se sienta veloz)
      setSaldo(nuevoSaldo);
      setMensaje(`¡Pago exitoso! - S/ ${montoAPagar.toFixed(2)}`);
      setMontoAPagar(0);
      setDestinatario("");

      // Guardamos el nuevo saldo en la base de datos real
      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: nuevoSaldo })
        .eq('id', 1);

      if (error) console.error("Error al guardar en Supabase:", error);

    } else {
      setMensaje("❌ Saldo insuficiente");
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  // Simulación de IA (Para impresionar en la demo)
  const simularEscaneoIA = () => {
    setEscaneando(true);
    setMensaje("🤖 La IA está analizando el QR...");

    setTimeout(() => {
        setDestinatario("Bodega 'El Chato'");
        setMontoAPagar(10.00); 
        setMensaje("✅ ¡QR detectado con éxito!");
        setEscaneando(false);
    }, 2000);
  };

  if (cargandoDatos) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-bold text-xl gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      Conectando con el Banco... 🏦
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 font-sans">
      <div className="w-full max-w-sm bg-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 relative">
        
        {/* Header */}
        <div className="bg-purple-800 p-6 text-center">
          <h2 className="text-white font-bold text-2xl tracking-wider">ChambaPay Cloud ☁️</h2>
          <p className="text-purple-200 text-xs mt-1">Conectado a Supabase</p>
        </div>

        {/* Cuerpo */}
        <div className="bg-white h-[450px] p-6 flex flex-col items-center pt-8 rounded-t-3xl mt-[-20px]">
          <p className="text-gray-500 text-sm font-medium tracking-widest">SALDO GLOBAL</p>
          <h1 className="text-5xl font-bold text-gray-800 mt-1 mb-6 animate-pulse transition-all">
            S/ {saldo.toFixed(2)}
          </h1>

          {/* ZONA DE ESCANEO */}
          <div className="w-full bg-purple-50 p-4 rounded-xl mb-4 border-2 border-dashed border-purple-300 flex flex-col items-center min-h-[140px] justify-center transition-all">
            {escaneando ? (
                <div className="animate-pulse flex flex-col items-center text-purple-600">
                    <svg className="w-10 h-10 mb-2 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"></path></svg>
                    <span className="font-bold text-sm">Analizando imagen...</span>
                </div>
            ) : destinatario ? (
                <div className="text-center w-full animate-bounce">
                    <p className="text-xs text-gray-500 mb-1">Pagar a:</p>
                    <h3 className="text-xl font-bold text-purple-800">{destinatario}</h3>
                    <h2 className="text-3xl font-black text-gray-900 mt-2">S/ {montoAPagar.toFixed(2)}</h2>
                </div>
            ) : (
                <button onClick={simularEscaneoIA} className="flex flex-col items-center text-purple-500 hover:text-purple-700 group">
                    <svg className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="font-medium">Escanear</span>
                </button>
            )}
          </div>

          <button 
            onClick={pagar}
            disabled={montoAPagar === 0 || escaneando}
            className={`w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform active:scale-95
                ${montoAPagar > 0 ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-gray-300 cursor-not-allowed'}
            `}
          >
            Pagar Globalmente
          </button>
          
          {mensaje && <p className={`mt-4 font-bold text-center text-sm ${mensaje.includes('insuficiente') ? 'text-red-500' : 'text-green-600'}`}>{mensaje}</p>}

        </div>
      </div>
      
      <p className="mt-8 text-gray-600 text-xs text-center max-w-xs">
        Hackathon Pro Tip: Usa Supabase Realtime para sincronizar todos los dispositivos al instante.
      </p>
    </div>
  );
}