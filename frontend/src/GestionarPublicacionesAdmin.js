import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./GestionPublicaciones.css";

function GestionarPublicacionesAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Asegurarse de que el ID sea un número válido
  const idPublicacion = id && !isNaN(id) ? parseInt(id) : null;
  
  console.log("🆔 ID del parámetro:", id);
  console.log("🔢 ID parseado:", idPublicacion);

  const [form, setForm] = useState({
    id_prenda: "",
    nombre: "",
    username: "",
    id_usuario: "",
    descripcion: "",
    talla: "",
    tipo_publicacion: "",
    valor: "",
    foto: null,
    foto2: null,
    foto3: null,
    foto4: null,
    foto_actual: "",
    foto2_actual: "",
    foto3_actual: "",
    foto4_actual: "",
  });

  const [preview, setPreview] = useState({
    foto: null,
    foto2: null,
    foto3: null,
    foto4: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- Cargar datos desde el backend ---
  useEffect(() => {
    if (!idPublicacion) {
      setError("ID de publicación inválido");
      setLoading(false);
      return;
    }

    const fetchPrenda = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Cargando publicación ID:", idPublicacion);
        
        const url = `http://localhost:5000/api/prendas/${idPublicacion}`;
        console.log("📡 URL completa:", url);
        
        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log("📡 Response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error response:", errorText);
          throw new Error(`Error ${res.status}: No se pudo cargar la prenda`);
        }
        
        const data = await res.json();
        console.log("📦 Datos recibidos:", data);
        
        // Validar que tenemos datos
        if (!data || !data.id_prenda) {
          throw new Error("No se encontraron datos de la prenda");
        }
        
        // Los datos vienen directamente del endpoint
        const formData = {
          id_prenda: data.id_prenda || "",
          nombre: data.nombre_prenda || "",
          username: data.username || "",
          id_usuario: data.id_usuario || "",
          descripcion: data.descripcion_prenda || "",
          talla: data.talla || "",
          tipo_publicacion: data.tipo_publicacion || "",
          valor: data.valor || "",
          foto_actual: data.foto || "",
          foto2_actual: data.foto2 || "",
          foto3_actual: data.foto3 || "",
          foto4_actual: data.foto4 || "",
          foto: null,
          foto2: null,
          foto3: null,
          foto4: null,
        };
        
        console.log("💾 Guardando en form state:", formData);
        setForm(formData);
        
        setLoading(false);
        console.log("✅ Prenda cargada exitosamente");
      } catch (err) {
        console.error("❌ Error al cargar la prenda:", err);
        setError(err.message || "Error al cargar la prenda");
        setLoading(false);
      }
    };

    fetchPrenda();
  }, [idPublicacion]);

  // --- Manejar cambios ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));
      setPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Editar prenda ---
  const handleEditar = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") formData.append(key, value);
    });

    try {
      const res = await fetch(`http://localhost:5000/api/prendas/${idPublicacion}`, {
        method: "PUT",
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "✅ Prenda editada correctamente");
        setTimeout(() => navigate("/AdminDashboard/publicaciones"), 2000);
      } else {
        setError("Error: " + data.message);
      }
    } catch (err) {
      setError("Error del servidor: " + err.message);
    }
  };

  // --- Eliminar prenda ---
  const handleEliminar = async () => {
    if (!window.confirm("¿Eliminar esta publicación y su prenda?")) return;
    setError(null);
    setSuccessMessage(null);
    
    try {
      const res = await fetch(`http://localhost:5000/api/prendas/${idPublicacion}`, {
        method: "DELETE",
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "✅ Publicación eliminada correctamente");
        setTimeout(() => navigate("/AdminDashboard/publicaciones"), 2000);
      } else {
        setError("Error al eliminar: " + data.message);
      }
    } catch (err) {
      setError("Error del servidor: " + err.message);
    }
  };

  // --- Render fotos ---
  const renderFoto = (num) => {
    const key = `foto${num === 1 ? "" : num}`;
    const actual = form[`${key}_actual`];
    const previewUrl = preview[key];

    return (
      <div key={key} className="foto-preview">
        {previewUrl ? (
          <img src={previewUrl} alt={`preview ${key}`} />
        ) : actual ? (
          <img src={`http://localhost:5000/uploads/${actual}`} alt={actual} />
        ) : (
          <div className="foto-placeholder">No hay foto</div>
        )}
        <input type="file" name={key} accept="image/*" onChange={handleChange} />
      </div>
    );
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando publicación...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay
  if (error && !form.id_prenda) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="error-state" style={{
          background: '#ffe6e6',
          border: '2px solid #ff4444',
          borderRadius: '10px',
          padding: '30px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff4444', marginBottom: '15px' }}>❌ Error</h2>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => navigate("/AdminDashboard/publicaciones")}
            style={{
              padding: '10px 20px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Volver a Publicaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="editar-container" style={{position: 'relative', flex: '1 0 auto'}}>
        {/* Mensajes de éxito/error */}
        {successMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#4CAF50',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease'
          }}>
            {successMessage}
          </div>
        )}
        {error && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#f44336',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease'
          }}>
            {error}
          </div>
        )}
        
        <button
          className="back-arrow"
          type="button"
          title="Volver a publicaciones"
          onClick={() => navigate("/AdminDashboard/publicaciones")}
          style={{position: 'absolute', top: 20, left: 20}}
        >
          ⟵
        </button>
        <div className="editar-panel">
          <div className={`editar-fotos${[1,2,3,4].filter(num => form[`foto${num === 1 ? "" : num}_actual`]).length === 3 ? ' tres-fotos' : ''}`}>
            {[1, 2, 3, 4]
              .filter((num) => {
                const key = `foto${num === 1 ? "" : num}_actual`;
                return form[key];
              })
              .map((num) => renderFoto(num))}
          </div>

          <form className="editar-formulario" onSubmit={handleEditar}>
            <h2>EDITAR PUBLICACIÓN (ADMIN)</h2>
            
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre de la prenda"
            />
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción"
            />
            <input
              type="text"
              name="talla"
              value={form.talla}
              onChange={handleChange}
              placeholder="Talla"
            />
            <input
              type="number"
              name="valor"
              value={form.valor}
              onChange={handleChange}
              placeholder="Valor"
            />

            {/* Campos ocultos */}
            <input type="hidden" name="foto_actual" value={form.foto_actual} />
            <input type="hidden" name="foto2_actual" value={form.foto2_actual} />
            <input type="hidden" name="foto3_actual" value={form.foto3_actual} />
            <input type="hidden" name="foto4_actual" value={form.foto4_actual} />

            <div className="editar-botones">
              <button type="submit" className="btn-accion">
                GUARDAR CAMBIOS
              </button>
              <button type="button" className="btn-accion" onClick={handleEliminar}>
                ELIMINAR PUBLICACIÓN
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GestionarPublicacionesAdmin;
