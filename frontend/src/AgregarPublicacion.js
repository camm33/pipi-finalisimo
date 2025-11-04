import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AgregarPublicacion.css";

const AgregarPublicacion = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("");
  const [valoracion, setValoracion] = useState(0);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [talla, setTalla] = useState("");
  const [valor, setValor] = useState("");
  const [estado, setEstado] = useState("Disponible");
  const [mensaje, setMensaje] = useState("");
  const [fotos, setFotos] = useState([null, null, null, null]);

  const handleStarClick = (num) => {
    setValoracion(num);
  };

  const handleFotoChange = (index, file) => {
    const nuevasFotos = [...fotos];
    nuevasFotos[index] = file;
    setFotos(nuevasFotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("descripcion", descripcion);
    formData.append("estado", estado);
    formData.append("tipo_publicacion", tipo);
    formData.append("fecha_publicacion", new Date().toISOString().slice(0, 10));
    formData.append("nombre", nombre);
    formData.append("descripcion_prenda", descripcion);
    formData.append("talla", talla);
    formData.append("valor", valor === "" ? "0.00" : valor);
    formData.append("valoracion", valoracion);

    fotos.forEach((foto, i) => {
      if (foto) {
        if (i === 0) formData.append("foto", foto);
        else formData.append(`foto${i + 1}`, foto);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/publicar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      setMensaje(data.message || "Publicado correctamente ✅");

      // 🔹 Redirigir al Home después de 1 segundo
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setMensaje("❌ Error al publicar");
      console.error(error);
    }
  };

  const renderPreview = (file) => {
    if (!file) return <span className="upload-label">📤</span>;
    return <img src={URL.createObjectURL(file)} alt="preview" className="preview-img" />;
  };

  return (
    <div className="container">
      <h2 className="titulo">Agregar Prenda</h2>
      <div className="contenido-central">
        {/* FOTOS */}
        <div className="fotos-lado-izquierdo">
          <p className="texto">📸 Agrega hasta 4 fotos de tu prenda</p>
          <div className="fotos-grid">
            {fotos.map((foto, index) => {
              if (index === 0 || fotos[index - 1]) {
                return (
                  <div className="foto-cuadro" key={index}>
                    <input
                      type="file"
                      id={`file${index}`}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={(e) => handleFotoChange(index, e.target.files[0] || null)}
                      disabled={!!foto}
                    />
                    <label htmlFor={`file${index}`} className="upload-label">
                      {renderPreview(foto)}
                    </label>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="form-lado-derecho">
          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label>✨ Nombre de la prenda *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Ej: Chaqueta de cuero vintage"
              />
            </div>

            <div className="campo">
              <label>📝 Descripción</label>
              <textarea
                rows="4"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                placeholder="Describe tu prenda: estado, marca, características especiales..."
              />
            </div>

            <div className="campo">
              <label>📏 Talla *</label>
              <input
                type="text"
                value={talla}
                onChange={(e) => setTalla(e.target.value)}
                required
                placeholder="S, M, L, XL, etc."
              />
            </div>

            <div className="campo tipo-publicacion">
              <label>🏷️ Tipo de publicación *</label>
              <button
                type="button"
                className={tipo === "Venta" ? "active" : ""}
                onClick={() => setTipo("Venta")}
              >
                Venta
              </button>
              <button
                type="button"
                className={tipo === "Intercambio" ? "active" : ""}
                onClick={() => setTipo("Intercambio")}
              >
                Intercambio
              </button>
            </div>

            <div className="campo valor">
              <label>💰 Valor {tipo === "Intercambio" ? "(opcional)" : "*"}</label>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required={tipo !== "Intercambio"}
                disabled={tipo === "Intercambio"}
                placeholder={tipo === "Intercambio" ? "No aplica para intercambio" : "Precio en pesos"}
              />
            </div>

            <div className="campo estado">
              <label>🔄 Estado de disponibilidad *</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="Disponible">Disponible</option>
                <option value="No Disponible">No Disponible</option>
              </select>
            </div>

            <div className="campo valoracion">
              <label>⭐ Califica la calidad de tu prenda *</label>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${valoracion >= star ? "active" : ""}`}
                    onClick={() => handleStarClick(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-publicar">
              Publicar Prenda
            </button>
          </form>

          {mensaje && (
            <p style={{ 
              marginTop: "20px", 
              padding: "15px", 
              background: mensaje.includes("❌") ? "#ffe5e5" : "#e8f5e9",
              color: mensaje.includes("❌") ? "#c62828" : "#2e7d32",
              borderRadius: "10px",
              textAlign: "center",
              fontWeight: "600"
            }}>
              {mensaje}
            </p>
          )}
        </div>
      </div>

      {/* Botón volver al catálogo */}
      <button
        className="volver-btn"
        title="Volver al Catálogo"
        onClick={() => navigate("/catalogo")}
      >
        ←
      </button>
    </div>
  );
};

export default AgregarPublicacion;