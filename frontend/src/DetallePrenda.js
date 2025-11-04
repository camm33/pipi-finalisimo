import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatModal from "./ChatModal"; // 🔸Comentado temporalmente
import "./DetallePrenda.css";

function DetallePrenda() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [prenda, setPrenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openChatModal, setOpenChatModal] = useState(false); 

  useEffect(() => {
    if (!id) return;

    const fetchDetalle = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/detalle_prenda/${id}`); // ✅ corregido
        if (!res.ok) throw new Error("Error al obtener detalle de la prenda");

        const data = await res.json();
        const detalle = data.prenda && data.prenda.length > 0 ? data.prenda[0] : null;
        setPrenda(detalle);
      } catch (err) {
        setError("No se pudo cargar la prenda");
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [id]);

  if (loading) return <p>Cargando detalle...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!prenda) return <p>No se encontró la prenda.</p>;

  // ✅ Mostrar solo las fotos que existan (sin cuadros vacíos)
  const fotos = [prenda.foto, prenda.foto2, prenda.foto3, prenda.foto4].filter(Boolean);

  return (
    <div className="detalle-prenda-container">
      <div className="detalle-prenda-titulo">DETALLE PRENDA</div>
      <div className="detalle-prenda-info-publicacion">
        
        {/* IZQUIERDA: Fotos de la prenda */}
        <div className="detalle-prenda-fotos-publicacion">
          <div className="detalle-prenda-fotos-titulo">Fotos</div>

          <div style={{ marginBottom: "18px", textAlign: "center" }}>
            <button
              className="detalle-prenda-ver-perfil-btn"
              onClick={() => navigate(`/perfil/${prenda.id_usuario}`)}
              style={{
                marginBottom: "8px",
                background: "#a07e44",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 18px",
                fontSize: "1rem",
                fontFamily: "league gothic",
                cursor: "pointer",
              }}
            >
              Ver perfil de {prenda.username}
            </button>
          </div>

          {/* ✅ SOLO mostrar las fotos que existan */}
          <div
            className="detalle-prenda-fotos-grid"
            style={{
              gridTemplateColumns: fotos.length === 1 ? "1fr" : "repeat(2, 1fr)",
            }}
          >
            {fotos.map((foto, index) => (
              <img
                key={index}
                src={`http://localhost:5000/uploads/${foto}`}
                alt={`Foto ${index + 1}`}
                className="detalle-prenda-foto-publicacion"
              />
            ))}
          </div>
        </div>

        {/* DERECHA: Información de la prenda */}
        <div className="detalle-prenda-datos-publicacion">
          <div className="detalle-prenda-label-publicacion">Nombre:</div>
          <div className="detalle-prenda-campo-publicacion">{prenda.nombre}</div>

          <div className="detalle-prenda-label-publicacion">Descripción:</div>
          <div className="detalle-prenda-campo-publicacion">{prenda.descripcion}</div>

          <div className="detalle-prenda-label-publicacion">Talla:</div>
          <div className="detalle-prenda-campo-publicacion">{prenda.talla}</div>

          <div className="detalle-prenda-label-publicacion">Tipo:</div>
          <div className="detalle-prenda-campo-publicacion">{prenda.tipo_publicacion}</div>

          <div className="detalle-prenda-label-publicacion">Valor →</div>
          <div className="detalle-prenda-campo-publicacion">${prenda.valor}</div>

          <div className="detalle-prenda-label-publicacion" style={{ marginTop: "18px" }}>
            Califica la calidad de la prenda:
          </div>
          <div style={{ marginBottom: "18px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} style={{ fontSize: "2rem", color: "#a07e44", marginRight: 4 }}>
                ★
              </span>
            ))}
          </div>

          <button
            className="detalle-prenda-mensaje-btn-publicacion"
            onClick={() => setOpenChatModal(true)}
          >
            MENSAJE
          </button>

          {openChatModal && (
            <ChatModal
              open={openChatModal}
              onClose={() => setOpenChatModal(false)}
              id_destinatario={prenda.id_usuario}
              destinatarioInfo={{
                id_usuario: prenda.id_usuario,
                username: prenda.username,
                foto_usuario: prenda.foto_usuario || null,
                nombre_completo: prenda.nombre || prenda.username,
                email: prenda.email || null,
              }}
            />
          )}
        </div>
      </div>

      <button
        className="volver-btn"
        title="Volver al Catálogo"
        onClick={() => navigate("/catalogo")}
      >
        ←
      </button>
    </div>
  );
}

export default DetallePrenda;