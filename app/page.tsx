'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 👇 REVISA QUE ESTAS CLAVES ESTÉN BIEN PEGRADAS (SIN ESPACIOS EXTRA) 👇
const supabaseUrl = 'https://mbftmjustcrqotwyxvqa.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZnRtanVzdGNycW90d3l4dnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDQ4NzksImV4cCI6MjA4MDAyMDg3OX0.LNYgBJMaTioOq2ks7SGiR6Gi2cGod22TJkg7bOQ2fR8'; 

const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [saldo, setSaldo] = useState(0); 
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorDebug, setErrorDebug] = useState(""); // 🚨 EL CHIVATO
  
  // Estados UI
  const [destinatario, setDestinatario] = useState("");
  const [montoAPagar, setMontoAPagar] = useState(0);
  const [vistaEscaneo, setVistaEscaneo] = useState(false);
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'exito' | 'error'} | null>(null);

  // 1. CARGAR DATOS + DIAGNÓSTICO
  useEffect(() => {
    const obtenerSaldo = async () => {
      try {
        console.log("Intentando conectar a:", supabaseUrl);
        
        // Prueba de conexión
        const { data, error } = await supabase
            .from('usuarios')
            .select('saldo')
            .eq('id', 1)
            .single();

        if (error) {
            console.error("Error Supabase:", error);
            setErrorDebug("Error leyendo BD: " + error.message); // Muestra el error en pantalla
            setCargandoDatos(false);
            return;
        }

        if (data) {
            setSaldo(data.saldo);
            setErrorDebug(""); // Todo bien
        } else {
            setErrorDebug("Conectó, pero no encontró al usuario ID 1.");
            // Auto-crear usuario si no existe
             await supabase.from('usuarios').insert([{ id: 1, saldo: 150 }]);
             setSaldo(150);
        }
      } catch (err: any) {
          setErrorDebug("Error Crítico: " + (err.message || JSON.stringify(err)));
      }
      setCargandoDatos(false);
    };

    obtenerSaldo();

    // Suscripción
    const canal = supabase
      .channel('cambios-saldo')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'usuarios' }, (payload) => {
        setSaldo(payload.new.saldo);
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, []);

  const procesarPago = async () => {
    if (saldo >= montoAPagar) {
      const nuevoSaldo = saldo - montoAPagar;
      setSaldo(nuevoSaldo);
      setVistaEscaneo(false);
      setMensaje({ texto: `¡Envío exitoso!`, tipo: 'exito' });
      
      const { error } = await supabase.from('usuarios').update({ saldo: nuevoSaldo }).eq('id', 1);
      if(error) setErrorDebug("Error al actualizar: " + error.message);
      
      setMontoAPagar(0);
      setDestinatario("");
    } else {
      setMensaje({ texto: "Saldo insuficiente 😢", tipo: 'error' });
    }
    setTimeout(() => setMensaje(null), 4000);
  };

  const simularIA = () => {
    setTimeout(() => {
      setDestinatario("Bodega 'Don Lucho'");
      setMontoAPagar(12.50);
    }, 2000);
  };

  if (cargandoDatos) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex justify-center items-center p-4">
      
      <div className="w-full max-w-sm h-[800px] bg-black rounded-[40px] border-8 border-gray-900 overflow-hidden relative shadow-2xl flex flex-col">
        
        {/* 🚨 ZONA DE ERRORES (SOLO VISIBLE SI FALLA) */}
        {errorDebug && (
            <div className="bg-red-600 text-white p-4 text-xs font-mono break-all absolute top-0 z-50 w-full opacity-90">
                ⚠️ DIAGNÓSTICO: {errorDebug}
            </div>
        )}

        {/* HEADER */}
        <div className="pt-12 px-6 flex justify-between items-center bg-gradient-to-b from-gray-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold">Yo</div>
            <div>
              <p className="text-xs text-gray-400">Hola, Campeón 👋</p>
              <h3 className="font-bold text-sm">ChambaPay</h3>
            </div>
          </div>
          <a href="https://wa.me/51999999999" target="_blank" className="p-2 bg-gray-800 rounded-full hover:bg-green-600 transition">📞</a>
        </div>

        {/* CUERPO */}
        <div className="flex-1 px-6 pt-6 overflow-y-auto pb-20">
          <div className="w-full aspect-video bg-gradient-to-br from-purple-600 to-indigo-900 rounded-2xl p-6 relative shadow-lg transform transition hover:scale-105 duration-300 group">
            <p className="text-purple-200 text-sm font-medium mb-1">Saldo Total</p>
            <h2 className="text-4xl font-bold tracking-tight">S/ {saldo.toFixed(2)}</h2>
            <div className="mt-8 flex justify-between items-end">
              <p className="font-mono text-purple-200 text-sm tracking-widest">**** 4280</p>
              <p className="text-xs font-bold bg-white/20 px-2 py-1 rounded">VISA</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-8">
            <BotonAccion icono="📷" texto="Escanear" onClick={() => { setVistaEscaneo(true); simularIA(); }} principal />
            <BotonAccion icono="💸" texto="Transferir" />
            <BotonAccion icono="📅" texto="Servicios" />
            <BotonAccion icono="history" texto="Historial" />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Últimos Movimientos</h3>
            <div className="space-y-4">
              <Movimiento nombre="Netflix" fecha="Hoy, 10:00 AM" monto="- S/ 45.00" icono="🎬" />
              <Movimiento nombre="Yape Recibido" fecha="Ayer, 8:30 PM" monto="+ S/ 120.00" positivo icono="📲" />
            </div>
          </div>
        </div>

        {/* MODAL ESCANEO */}
        {vistaEscaneo && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
             <div className="w-full h-full border-2 border-gray-800 rounded-3xl relative overflow-hidden bg-gray-900">
                <div className="absolute inset-0 flex items-center justify-center">
                    {!destinatario ? (
                        <div className="w-64 h-64 border-2 border-purple-500 rounded-xl relative animate-pulse flex items-center justify-center">
                            <p className="text-purple-300 text-sm font-bold bg-black/50 px-2 py-1 rounded">Buscando QR...</p>
                        </div>
                    ) : (
                        <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-xs text-center border border-gray-700 animate-slide-up">
                            <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">🏪</div>
                            <h3 className="text-xl font-bold text-white">{destinatario}</h3>
                            <p className="text-gray-400 text-sm mb-6">Monto a pagar</p>
                            <h2 className="text-4xl font-bold text-white mb-6">S/ {montoAPagar.toFixed(2)}</h2>
                            <button onClick={procesarPago} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/50 transition">Confirmar Pago</button>
                            <button onClick={() => {setVistaEscaneo(false); setDestinatario(""); setMontoAPagar(0);}} className="mt-4 text-gray-400 text-sm hover:text-white">Cancelar</button>
                        </div>
                    )}
                </div>
             </div>
          </div>
        )}

        {/* TOAST */}
        {mensaje && (
          <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce z-50 ${mensaje.tipo === 'exito' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
             <span>{mensaje.tipo === 'exito' ? '✅' : '❌'}</span>
             <span className="font-bold text-sm">{mensaje.texto}</span>
          </div>
        )}

      </div>
    </div>
  );
}

function BotonAccion({ icono, texto, onClick, principal = false }: any) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition transform group-hover:scale-110 ${principal ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}>
                {icono}
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-white">{texto}</span>
        </button>
    )
}

function Movimiento({ nombre, fecha, monto, icono, positivo = false }: any) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl hover:bg-gray-800 transition cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg">{icono}</div>
                <div>
                    <h4 className="font-bold text-sm">{nombre}</h4>
                    <p className="text-xs text-gray-500">{fecha}</p>
                </div>
            </div>
            <span className={`font-bold text-sm ${positivo ? 'text-green-400' : 'text-white'}`}>{monto}</span>
        </div>
    )
}