import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./perfiles.css";

function AppPerfiles() {
  const { id_usuario } = useParams();
  const [rating, setRating] = useState(0);
  const [perfil, setPerfil] = useState(null);
  const navigate = useNavigate();

  const BACKEND_URL = "http://localhost:5000";

  // 🔹 Imagen por defecto en base64
  const defaultUserImage = "data:image/svg+xml;base64," + btoa(`
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="75" r="70" fill="#a07e44" stroke="#7c5e2c" stroke-width="5"/>
      <circle cx="75" cy="60" r="20" fill="white"/>
      <path d="M40 110 Q75 90 110 110" stroke="white" stroke-width="8" fill="none" stroke-linecap="round"/>
    </svg>
  `);

  const defaultPrendaImage = "data:image/svg+xml;base64," + btoa(`
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="100" height="100" fill="#e3d8b5" stroke="#a07e44" stroke-width="3" rx="10"/>
      <text x="75" y="80" text-anchor="middle" fill="#7c5e2c" font-family="Arial" font-size="14">Prenda</text>
    </svg>
  `);

  // 🔹 Obtener perfil del backend
  useEffect(() => {
    const endpoint = id_usuario
      ? `${BACKEND_URL}/api/perfil_usuario/${id_usuario}`
      : `${BACKEND_URL}/api/perfil_usuario`;

    fetch(endpoint, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos del perfil:", data);

        if (data.perfil) {
          if (Array.isArray(data.perfil) && data.perfil.length > 0) {
            const usuario = {
              id_usuario: data.perfil[0].id_usuario,
              username_usuario: data.perfil[0].username_usuario,
              foto_usuario: data.perfil[0].foto_usuario,
              promedio_valoracion: data.perfil[0].promedio_valoracion,
              prendas: data.perfil.map((p) => ({
                id_prenda: p.id_prenda,
                nombre_prenda: p.nombre_prenda,
                foto_prenda: p.foto_prenda,
                valor: p.valor,
              })),
            };
            setPerfil(usuario);
            setRating(usuario.promedio_valoracion || 0);
          } else {
            setPerfil(data.perfil);
            setRating(data.perfil.promedio_valoracion || 0);
          }
        }
      })
      .catch((err) => console.error("❌ Error al cargar perfil:", err));
  }, [id_usuario]);

  // 🔹 Guardar valoración
  const guardarValoracion = (nuevoRating) => {
    if (!perfil) return;
    setRating(nuevoRating);

    fetch(`${BACKEND_URL}/api/guardar_valoracion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_valorado_id: perfil.id_usuario,
        puntaje: nuevoRating,
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Valoración guardada:", data))
      .catch((err) => console.error("❌ Error guardando valoración:", err));
  };

  // 🔹 Renderizar estrellas
  const renderStars = (promedio) => {
    const rounded = Math.round(promedio);
    return (
      <span className="stars-text">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`star ${rating >= i ? "active" : ""}`}
            onClick={() => guardarValoracion(i)}
            style={{ cursor: "pointer" }}
          >
            {i <= rounded ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  // 🔹 Render principal
  return (
    <div className="app">
      <main className="app-main">
        {perfil ? (
          <>
            {/* Columna izquierda */}
            <div className="perfil">
              <div className="Marco">
                <img
                  src={
                    perfil.foto_usuario
                      ? `${BACKEND_URL}/uploads/${perfil.foto_usuario}`
                      : defaultUserImage
                  }
                  alt="Foto del usuario"
                  className="foto-usuario"
                  onError={(e) => {
                    console.log("Error cargando foto, usando imagen por defecto");
                    e.target.src = defaultUserImage;
                  }}
                />
              </div>

              <p>
                <strong>Promedio de valoración:</strong> {renderStars(rating)}
              </p>

              <h2>{perfil.username_usuario}</h2>
              <div className="datos">
                <p>
                  <strong>Username:</strong>{" "}
                  {perfil.username_usuario || "No disponible"}
                </p>
              </div>

              {/* Botón de Chat */}
              {id_usuario &&
                parseInt(id_usuario) !==
                  parseInt(localStorage.getItem("id_usuario")) && (
                  <button
                    className="chat-button"
                    onClick={() => navigate(`/chat/${perfil.id_usuario}`)}
                    title="Chatear con este usuario"
                  >
                    💬 Enviar Mensaje
                  </button>
                )}
            </div>

            {/* Columna derecha */}
            <div className="publicaciones">
              <h3>Publicaciones</h3>
              <div className="cards">
                {perfil.prendas && perfil.prendas.length > 0 ? (
                  perfil.prendas.map((prenda) => (
                    <div
                      className="card"
                      key={prenda.id_prenda}
                      onClick={() =>
                        navigate(`/detalle_prenda/${prenda.id_prenda}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <h4>{prenda.nombre_prenda}</h4>
                      <img
                        src={
                          prenda.foto_prenda
                            ? `${BACKEND_URL}/uploads/${prenda.foto_prenda}`
                            : defaultPrendaImage
                        }
                        alt={prenda.nombre_prenda || "Prenda"}
                        className="foto-prenda"
                        onError={(e) => {
                          e.target.src = defaultPrendaImage;
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <p>No hay prendas para mostrar</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Cargando perfil...</p>
        )}
      </main>

      {/* 🔹 Botones de navegación */}
      <div className="botones-navegacion">
        <button
          className="volver-btn"
          title="Volver al Catálogo"
          onClick={() => navigate("/catalogo")}
        >
          ← Catálogo
        </button>
        <button
          className="volver-btn"
          title="Ir al Chat"
          onClick={() => navigate("/chat")}
        >
          💬 Chat
        </button>
      </div>
    </div>
  );
}

export default AppPerfiles;
