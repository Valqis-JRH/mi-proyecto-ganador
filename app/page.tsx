'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// 👇 TUS CLAVES (Ya están puestas) 👇
const supabaseUrl = 'https://mbftmjustcrqotwyxvqa.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZnRtanVzdGNycW90d3l4dnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDQ4NzksImV4cCI6MjA4MDAyMDg3OX0.LNYgBJMaTioOq2ks7SGiR6Gi2cGod22TJkg7bOQ2fR8'; 

const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [saldo, setSaldo] = useState(0); 
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  // Estados de interacción
  const [destinatario, setDestinatario] = useState("");
  const [montoAPagar, setMontoAPagar] = useState(0);
  const [vistaEscaneo, setVistaEscaneo] = useState(false); 
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'exito' | 'error'} | null>(null);

  // --- FUNCIÓN PARA LEER EL SALDO REAL DE LA NUBE ---
  const refrescarSaldo = useCallback(async () => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('saldo')
            .eq('id', 1)
            .single();
        
        if (data) {
            setSaldo(data.saldo);
        } else {
            // Si no existe, lo creamos
            await supabase.from('usuarios').insert([{ id: 1, saldo: 150 }]);
            setSaldo(150);
        }
    } catch (error) {
        console.error("Error al refrescar:", error);
    }
    setCargandoDatos(false);
  }, []);

  // 1. CARGA INICIAL Y SUSCRIPCIÓN
  useEffect(() => {
    refrescarSaldo(); 

    const canal = supabase
      .channel('cambios-saldo')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'usuarios' }, (payload) => {
        console.log("Cambio detectado en tiempo real:", payload.new.saldo);
        setSaldo(payload.new.saldo);
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [refrescarSaldo]);

  // 2. LÓGICA DE PAGO
  const procesarPago = async () => {
    if (saldo >= montoAPagar) {
      const nuevoSaldo = saldo - montoAPagar;
      
      setSaldo(nuevoSaldo);
      setVistaEscaneo(false);
      setMensaje({ texto: `¡Envío exitoso a ${destinatario}!`, tipo: 'exito' });
      
      await supabase.from('usuarios').update({ saldo: nuevoSaldo }).eq('id', 1);
      await refrescarSaldo(); // Doble verificación
      
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

  if (cargandoDatos) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-purple-500 gap-4">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse font-bold">Conectando Billetera...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex justify-center items-center p-4">
      
      {/* 📱 CONTENEDOR TIPO MÓVIL */}
      <div className="w-full max-w-sm h-[800px] bg-black rounded-[40px] border-8 border-gray-900 overflow-hidden relative shadow-2xl flex flex-col">
        
        {/* --- HEADER --- */}
        <div className="pt-12 px-6 flex justify-between items-center bg-gradient-to-b from-gray-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold">Yo</div>
            <div>
              <p className="text-xs text-gray-400">Hola, Campeón 👋</p>
              <h3 className="font-bold text-sm">ChambaPay</h3>
            </div>
          </div>
          
          {/* 🔥 BOTÓN WHATSAPP DINÁMICO (LA MAGIA ESTÁ AQUÍ) */}
          {/* Fíjate cómo inyectamos la variable ${saldo} dentro del enlace */}
          <a 
            href={`https://wa.me/51999999999?text=Hola%20soporte,%20tengo%20una%20duda%20sobre%20mi%20saldo%20actual%20de%20S/%20${saldo.toFixed(2)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-800 rounded-full hover:bg-green-600 transition flex items-center justify-center text-white no-underline text-xl animate-pulse"
          >
            📞
          </a>

        </div>

        {/* --- CUERPO PRINCIPAL --- */}
        <div className="flex-1 px-6 pt-6 overflow-y-auto pb-20">
          
          {/* TARJETA DE CRÉDITO VIRTUAL */}
          <div className="w-full aspect-video bg-gradient-to-br from-purple-600 to-indigo-900 rounded-2xl p-6 relative shadow-lg transform transition hover:scale-105 duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <p className="text-purple-200 text-sm font-medium mb-1">Saldo Total</p>
            <h2 className="text-4xl font-bold tracking-tight">S/ {saldo.toFixed(2)}</h2>
            <div className="mt-8 flex justify-between items-end">
              <p className="font-mono text-purple-200 text-sm tracking-widest">**** 4280</p>
              <p className="text-xs font-bold bg-white/20 px-2 py-1 rounded">VISA</p>
            </div>
          </div>

          {/* ACCIONES RÁPIDAS */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <BotonAccion icono="📷" texto="Escanear" onClick={() => { setVistaEscaneo(true); simularIA(); }} principal />
            <BotonAccion icono="💸" texto="Transferir" />
            <BotonAccion icono="📅" texto="Servicios" />
            <BotonAccion icono="history" texto="Historial" />
          </div>

          {/* LISTA DE MOVIMIENTOS */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Últimos Movimientos</h3>
            <div className="space-y-4">
              <Movimiento nombre="Netflix" fecha="Hoy, 10:00 AM" monto="- S/ 45.00" icono="🎬" />
              <Movimiento nombre="Yape Recibido" fecha="Ayer, 8:30 PM" monto="+ S/ 120.00" positivo icono="📲" />
              <Movimiento nombre="Uber Trip" fecha="Ayer, 6:15 PM" monto="- S/ 18.50" icono="🚗" />
            </div>
          </div>
        </div>

        {/* --- BARRA INFERIOR --- */}
        <div className="absolute bottom-0 w-full bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4 flex justify-around text-xs text-gray-400">
           <div className="text-purple-400 flex flex-col items-center">🏠<span className="mt-1">Inicio</span></div>
           <div className="flex flex-col items-center">💳<span className="mt-1">Tarjeta</span></div>
           <div className="flex flex-col items-center">⚙️<span className="mt-1">Ajustes</span></div>
        </div>

        {/* --- MODAL DE ESCANEO --- */}
        {vistaEscaneo && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
             <div className="w-full h-full border-2 border-gray-800 rounded-3xl relative overflow-hidden bg-gray-900">
                <div className="absolute inset-0 flex items-center justify-center">
                    {!destinatario ? (
                        <div className="w-64 h-64 border-2 border-purple-500 rounded-xl relative animate-pulse flex items-center justify-center">
                            <p className="text-purple-300 text-sm font-bold bg-black/50 px-2 py-1 rounded">Buscando QR...</p>
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-purple-500 -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-purple-500 -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-purple-500 -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-purple-500 -mb-1 -mr-1"></div>
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
                {!destinatario && <button onClick={() => setVistaEscaneo(false)} className="absolute top-6 right-6 text-white bg-black/50 w-10 h-10 rounded-full">✕</button>}
             </div>
          </div>
        )}

        {/* --- TOAST --- */}
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

// COMPONENTES AUXILIARES
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