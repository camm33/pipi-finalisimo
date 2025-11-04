// ChatApp.jsx
import React, { useEffect, useState } from "react";

function ChatApp({ loggedUserId, profileUserId }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  // Cargar mensajes entre loggedUserId y profileUserId
  useEffect(() => {
    if (!loggedUserId || !profileUserId) return;

    fetch(
      `http://localhost:5000/chat/mensajes?id_remitente=${loggedUserId}&id_destinatario=${profileUserId}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener mensajes");
        return res.json();
      })
      .then((data) => setMensajes(data))
      .catch((err) => console.error("Error:", err));
  }, [loggedUserId, profileUserId]);

  // Enviar un mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/chat/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_remitente: loggedUserId,
          id_destinatario: profileUserId,
          mensaje: nuevoMensaje,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMensajes(data.mensajes);
        setNuevoMensaje("");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>💬 Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
          backgroundColor: "#fafafa",
          borderRadius: "8px",
        }}
      >
        {mensajes.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center" }}>
            No hay mensajes todavía...
          </p>
        ) : (
          mensajes.map((m, i) => (
            <p key={i}>
              <strong>{m.remitente}:</strong> {m.mensaje} <br />
              <small style={{ color: "#666" }}>{m.fecha}</small>
            </p>
          ))
        )}
      </div>

      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{
            width: "80%",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={enviarMensaje}
          style={{
            marginLeft: "6px",
            padding: "6px 12px",
            backgroundColor: "#a07e44",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default ChatApp;
