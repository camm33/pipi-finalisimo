import React, { useState, useEffect, useRef } from "react";
import { useNotificaciones } from "./hooks/useNotificaciones";
import "./Chat.css";

function Chat({ id_destinatario, destinatarioInfo, onBack }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [destinatario, setDestinatario] = useState(destinatarioInfo || null);
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const { marcarComoLeidos, cargarNoLeidos } = useNotificaciones();

  // Referencias para scroll automático
  const mensajesEndRef = useRef(null);
  const mensajesContainerRef = useRef(null);

  const BACKEND_URL = "http://localhost:5000";
  const id_remitente = localStorage.getItem("id_usuario");

  // Scroll al final de los mensajes
  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cargar información del destinatario si no está completa
  useEffect(() => {
    if ((!destinatario || !destinatario.foto_usuario) && id_destinatario) {
      fetch(`${BACKEND_URL}/api/perfil_usuario/${id_destinatario}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.perfil) {
            setDestinatario((prev) => ({
              ...prev,
              foto_usuario: data.perfil.foto_usuario || prev?.foto_usuario,
              username: data.perfil.username_usuario || prev?.username,
              nombre_completo:
                data.perfil.PrimerNombre && data.perfil.SegundoNombre
                  ? `${data.perfil.PrimerNombre} ${data.perfil.SegundoNombre}`.trim()
                  : data.perfil.username_usuario ||
                    prev?.nombre_completo,
              email: prev?.email,
            }));
          }
        })
        .catch((err) => console.error("Error al cargar destinatario:", err));
    }
  }, [id_destinatario, destinatario]);

  // Cargar mensajes entre los usuarios
  useEffect(() => {
    if (id_remitente && id_destinatario) {
      cargarMensajes();
      marcarComoLeidos(id_destinatario);

      const interval = setInterval(() => {
        cargarMensajes();
        marcarComoLeidos(id_destinatario);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [id_remitente, id_destinatario]);

  // Actualizar tiempo cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoActual(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cargar mensajes
  const cargarMensajes = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/chat/mensajes?id_remitente=${id_remitente}&id_destinatario=${id_destinatario}`
      );
      const data = await response.json();

      const mensajesOrdenados = data.sort((a, b) => {
        const fechaA = new Date(a.fecha_envio);
        const fechaB = new Date(b.fecha_envio);
        return fechaA - fechaB;
      });

      setMensajes(mensajesOrdenados);
      setTiempoActual(new Date());
      await marcarComoLeidos(id_destinatario);
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
    }
  };

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/chat/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_remitente: parseInt(id_remitente),
          id_destinatario: parseInt(id_destinatario),
          mensaje: nuevoMensaje,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNuevoMensaje("");
        setTimeout(() => {
          const mensajesOrdenados = data.mensajes.sort((a, b) => {
            const fechaA = new Date(a.fecha_envio);
            const fechaB = new Date(b.fecha_envio);
            return fechaA - fechaB;
          });
          setMensajes(mensajesOrdenados);
          setTiempoActual(new Date());
          cargarNoLeidos();
          setTimeout(scrollToBottom, 100);
        }, 50);
      }
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      enviarMensaje();
    }
  };

  // Formatear tiempo de los mensajes
  const formatearTiempo = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const ahora = tiempoActual;
    const diferencia = ahora - fecha;

    // console.log(`Debug - Fecha: ${fecha}, Ahora: ${ahora}, Diferencia: ${Math.floor(diferencia/1000)}s`);

    if (diferencia < 30000) {
      return "ahora";
    }

    if (fecha.toDateString() === ahora.toDateString()) {
      return fecha.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return fecha.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="chat-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "400px",
        maxHeight: "65vh",
        overflow: "hidden",
      }}
    >
      {onBack !== undefined && (
        <button
          className="back-button"
          onClick={onBack}
          style={{
            width: "100%",
            background: "#a07e44",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 0",
            fontWeight: "bold",
            fontSize: "1rem",
            marginBottom: "8px",
            cursor: "pointer",
          }}
        >
          ← Mensajes
        </button>
      )}

      <div
        className="chat-header"
        style={{ width: "100%", boxSizing: "border-box" }}
      >
        {destinatario && (
          <div
            className="destinatario-info"
            style={{ display: "flex", alignItems: "center", width: "100%" }}
          >
            <img
              src={
                destinatario.foto_usuario
                  ? `${BACKEND_URL}/uploads${
                      destinatario.foto_usuario.startsWith("/")
                        ? destinatario.foto_usuario
                        : "/" + destinatario.foto_usuario
                    }`
                  : "/default-user.png"
              }
              alt="Foto del usuario"
              className="destinatario-foto"
              style={{ width: 48, height: 48, borderRadius: "50%", marginRight: 12 }}
            />
            <h3 style={{ fontWeight: 700, fontSize: "1.2rem", margin: 0 }}>
              {destinatario.username || destinatario.nombre_completo}
            </h3>
          </div>
        )}
      </div>

      <div
        className="mensajes-container"
        ref={mensajesContainerRef}
        style={{
          flex: 1,
          minHeight: "120px",
          maxHeight: "calc(100% - 170px)",
          overflowY: "auto",
          marginBottom: "8px",
          background: "transparent",
        }}
      >
        {mensajes.length > 0 ? (
          mensajes.map((mensaje, index) => (
            <div
              key={index}
              className={`mensaje ${
                mensaje.id_remitente === parseInt(id_remitente)
                  ? "propio"
                  : "ajeno"
              }`}
            >
              <div className="mensaje-contenido">
                <p>{mensaje.mensaje || mensaje.contenido}</p>
                <div className="mensaje-meta">
                  <small className="mensaje-fecha">
                    {formatearTiempo(mensaje.fecha_envio)}
                  </small>
                  {mensaje.id_remitente === parseInt(id_remitente) && (
                    <span className="estado-lectura">
                      {mensaje.leido ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="sin-mensajes">
            <p>No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        )}
        <div ref={mensajesEndRef} />
      </div>

      <div
        className="mensaje-input-container"
        style={{
          display: "flex",
          gap: "10px",
          padding: "15px 0",
          borderTop: "2px solid #f0f0f0",
          background: "transparent",
        }}
      >
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          className="mensaje-input"
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "2px solid #e0e0e0",
            borderRadius: "25px",
            fontSize: "14px",
            outline: "none",
            background: "#fff",
          }}
        />
        <button
          onClick={enviarMensaje}
          className="enviar-button"
          style={{
            background: "#95742d",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "25px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            minWidth: "80px",
          }}
          disabled={!nuevoMensaje.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default Chat;
