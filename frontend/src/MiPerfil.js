import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./perfiles.css";

const BACKEND_URL = "http://localhost:5000";

function MiPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0); // Valoración que el usuario puede dar
  const [hoveredStar, setHoveredStar] = useState(0); // Para hover effect
  const [isOwnProfile, setIsOwnProfile] = useState(true); // Para determinar si es el perfil propio
  const [activeTab, setActiveTab] = useState("prendas");
  const [isEditMode, setIsEditMode] = useState(false); // Modo de edición
  const [editForm, setEditForm] = useState({}); // Formulario de edición
  const [editPhoto, setEditPhoto] = useState(null); // Nueva foto
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 Iniciando carga del perfil...");
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      await cargarPerfilPorSesion();
    } catch (error) {
      console.error("❌ Error general al cargar perfil:", error);
      setError("Error al cargar el perfil");
      setLoading(false);
    }
  };

  const cargarPerfilPorId = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/perfil_usuario/${id}?t=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📥 Datos del perfil por ID:", data);
        procesarDatosPerfil(data);
      } else {
        throw new Error("Error al cargar el perfil por ID");
      }
    } catch (error) {
      console.error("❌ Error al cargar el perfil por ID:", error);
      setLoading(false);
    }
  };

  const cargarPerfilPorSesion = async () => {
    try {
      setLoading(true);
      
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const id_usuario = localStorage.getItem("id_usuario");

      console.log("🔍 Debug MiPerfil:");
      console.log("- Usuario:", user ? "✅ Encontrado" : "❌ No encontrado");
      console.log("- Token:", token);
      console.log("- ID Usuario:", id_usuario);

      // Verificación más permisiva - solo requiere token
      if (!token) {
        console.log("❌ No hay token, redirigiendo al login");
        setError("No hay sesión activa. Por favor, inicia sesión.");
        setLoading(false);
        setTimeout(() => navigate("/iniciar"), 0);
        return;
      }

      console.log("📡 Haciendo petición a:", `${BACKEND_URL}/api/perfil_usuario`);

      const response = await fetch(`${BACKEND_URL}/api/perfil_usuario?t=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      console.log("📡 Respuesta del servidor:", response.status);

      if (response.status === 401) {
        console.log("❌ Sesión expirada (401)");
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        setLoading(false);
        setTimeout(() => navigate("/iniciar"), 0);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("📥 Datos del perfil por sesión:", data);
        procesarDatosPerfil(data);
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error al cargar el perfil:", error);
      setError("Error al cargar el perfil: " + error.message);
      setLoading(false);
    }
  };

  const procesarDatosPerfil = (data) => {
    console.log("📝 Procesando datos del perfil:", data);
    if (data.perfil) {
      setPerfil(data.perfil);
      setRating(Number(data.perfil.promedio_valoracion) || 0);
      setIsOwnProfile(true); // Siempre es el perfil propio en MiPerfil
      setLoading(false);
    } else {
      setError("No se pudieron cargar los datos del perfil");
      setLoading(false);
    }
  };

  // Función para manejar el clic en una estrella (simplificada - solo visual)
  const handleStarClick = (starValue) => {
    if (isOwnProfile) {
      alert("No puedes valorarte a ti mismo");
      return;
    }

    // Guardar la valoración en localStorage
    const userProfileKey = `rating_${localStorage.getItem('id_usuario')}`;
    localStorage.setItem(userProfileKey, starValue.toString());
    
    // Actualizar la valoración localmente
    setUserRating(starValue);
    
    // Calcular nuevo promedio aproximado (simulado)
    const newRating = Math.min(5, Math.max(1, (rating * 0.7 + starValue * 0.3))); // Mezcla ponderada
    setRating(newRating);
    
    alert(`Has valorado a este usuario con ${starValue} estrellas`);
  };

  // Función para renderizar estrellas interactivas
  const renderInteractiveStars = (currentRating) => {
    const displayRating = userRating > 0 ? userRating : Math.round(currentRating);
    
    return (
      <div className="interactive-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star-interactive ${star <= (hoveredStar || displayRating) ? "filled" : "empty"}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => !isOwnProfile && setHoveredStar(star)}
            onMouseLeave={() => !isOwnProfile && setHoveredStar(0)}
            style={{
              cursor: isOwnProfile ? 'not-allowed' : 'pointer',
              opacity: isOwnProfile ? 0.5 : 1
            }}
          >
            {star <= (hoveredStar || displayRating) ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  const renderStars = (promedio) => {
    const rounded = Math.round(promedio);
    return (
      <span className="stars-text">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`star-black ${i <= rounded ? "active" : ""}`}>
            {i <= rounded ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  // --- Funciones de edición ---
  const handleEditClick = () => {
    setEditForm({
      PrimerNombre: perfil.PrimerNombre || '',
      PrimerApellido: perfil.PrimerApellido || '',
      email_usuario: perfil.email_usuario || '',
      talla_usuario: perfil.talla_usuario || '',
      fecha_nacimiento: perfil.fecha_nacimiento || ''
    });
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm({});
    setEditPhoto(null);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPhoto(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Guardar cambios localmente sin tocar la BD
      const updatedPerfil = {
        ...perfil,
        PrimerNombre: editForm.PrimerNombre || perfil.PrimerNombre,
        PrimerApellido: editForm.PrimerApellido || perfil.PrimerApellido,
        email_usuario: editForm.email_usuario || perfil.email_usuario,
        talla_usuario: editForm.talla_usuario || perfil.talla_usuario,
        fecha_nacimiento: editForm.fecha_nacimiento || perfil.fecha_nacimiento
      };

      // Si hay nueva foto, crear URL local para mostrarla
      if (editPhoto) {
        updatedPerfil.foto_usuario_preview = URL.createObjectURL(editPhoto);
      }

      // Actualizar el estado local
      setPerfil(updatedPerfil);
      
      // Salir del modo edición
      setIsEditMode(false);
      setEditForm({});
      setEditPhoto(null);
      
      console.log('✅ Cambios guardados localmente:', updatedPerfil);
      alert('✅ Cambios guardados localmente');
      
    } catch (error) {
      console.error('❌ Error al guardar cambios:', error);
      alert('❌ Error al guardar los cambios');
    }
  };

  // Función para manejar click en prendas según el modo
  const handlePrendaClick = (prenda) => {
    if (isEditMode && isOwnProfile) {
      // Modo edición: ir a editar prenda
      navigate(`/gestion_prendas/${prenda.id_prenda}`);
    } else {
      // Modo normal: ir a ver detalles
      navigate(`/ver_prenda/${prenda.id_prenda}`);
    }
  };

  // Renderizado del componente
  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message" style={{
          background: '#fee',
          color: '#c33',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px',
          border: '1px solid #fcc'
        }}>
          <h3>❌ Error al cargar el perfil</h3>
          <p>{error}</p>
          <button onClick={() => setTimeout(() => navigate("/iniciar"), 0)}>Iniciar Sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {perfil ? (
        <>
          {/* Solo el Hero Banner - sin cuadro superpuesto */}
          <div className="hero-banner-only">
            <div className="banner-overlay"></div>
          </div>

          {/* Three Column Layout */}
          <div className="profile-main-layout">
            {/* Left Sidebar with Avatar */}
            <div className="profile-left-sidebar">
              <div className="sidebar-avatar">
                {isEditMode ? (
                  <div className="avatar-edit-container">
                    <img 
                      src={
                        editPhoto 
                          ? URL.createObjectURL(editPhoto)
                          : perfil.foto_usuario_preview
                            ? perfil.foto_usuario_preview
                            : perfil.foto_usuario
                              ? `${BACKEND_URL}/uploads/${perfil.foto_usuario.replace(/^\/+/, '')}`
                              : "/LOGO.png"
                      }
                      alt="Foto del usuario"
                      onError={(e) => {
                        e.target.src = '/LOGO.png';
                      }}
                    />
                    <div className="avatar-edit-overlay">
                      <input
                        type="file"
                        id="photo-input"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                      <button 
                        className="avatar-edit-btn"
                        onClick={() => document.getElementById('photo-input').click()}
                      >
                        📷 Cambiar Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={
                      perfil.foto_usuario_preview
                        ? perfil.foto_usuario_preview
                        : perfil.foto_usuario
                          ? `${BACKEND_URL}/uploads/${perfil.foto_usuario.replace(/^\/+/, '')}`
                          : "/LOGO.png"
                    }
                    alt="Foto del usuario"
                    onError={(e) => {
                      console.log("❌ Error cargando foto del usuario:", e.target.src);
                      console.log("📝 Datos del perfil foto_usuario:", perfil.foto_usuario);
                      e.target.src = '/LOGO.png';
                    }}
                    onLoad={(e) => {
                      console.log("✅ Foto del usuario cargada correctamente:", e.target.src);
                    }}
                  />
                )}
              </div>
              
              <div className="sidebar-info">
                {/* Nombre editable */}
                {isEditMode ? (
                  <div className="edit-name-container">
                    <input
                      type="text"
                      className="edit-input name-input"
                      placeholder="Primer Nombre"
                      value={editForm.PrimerNombre || ''}
                      onChange={(e) => handleInputChange('PrimerNombre', e.target.value)}
                    />
                    <input
                      type="text"
                      className="edit-input name-input"
                      placeholder="Primer Apellido"
                      value={editForm.PrimerApellido || ''}
                      onChange={(e) => handleInputChange('PrimerApellido', e.target.value)}
                    />
                  </div>
                ) : (
                  <h2 className="sidebar-name">{perfil.PrimerNombre || 'Usuario'} {perfil.PrimerApellido || ''}</h2>
                )}
                
                <p className="sidebar-username">@{perfil.username_usuario || 'username'}</p>
                
                {/* Sistema de estrellas funcional después del username */}
                <div className="user-rating">
                  <div className="rating-stars-inline">
                    {renderInteractiveStars(Math.round(Number(rating) || 0))}
                  </div>
                  <span className="rating-score-inline">({(Number(rating) || 0).toFixed(1)})</span>
                  {isOwnProfile && <span className="own-profile-note"> - Tu valoración</span>}
                  {!isOwnProfile && userRating > 0 && <span className="rating-note"> - Has valorado: {userRating}★</span>}
                  {!isOwnProfile && userRating === 0 && <span className="rating-note"> - Haz clic para valorar</span>}
                </div>
                
                {/* Información de contacto estilo profesional */}
                <div className="sidebar-contact-info">
                  <div className="contact-item">
                    <div className="contact-icon">📍</div>
                    <span className="contact-text">Colombia</span>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">📧</div>
                    {isEditMode ? (
                      <input
                        type="email"
                        className="edit-input contact-input"
                        placeholder="Correo electrónico"
                        value={editForm.email_usuario || ''}
                        onChange={(e) => handleInputChange('email_usuario', e.target.value)}
                      />
                    ) : (
                      <span className="contact-text">{perfil.email_usuario || "correo@ejemplo.com"}</span>
                    )}
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">👕</div>
                    {isEditMode ? (
                      <select
                        className="edit-input contact-input"
                        value={editForm.talla_usuario || ''}
                        onChange={(e) => handleInputChange('talla_usuario', e.target.value)}
                      >
                        <option value="">Seleccionar talla</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    ) : (
                      <span className="contact-text">Talla: {perfil.talla_usuario || "No especificada"}</span>
                    )}
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">📅</div>
                    {isEditMode ? (
                      <input
                        type="date"
                        className="edit-input contact-input"
                        value={editForm.fecha_nacimiento ? editForm.fecha_nacimiento.split('T')[0] : ''}
                        onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                      />
                    ) : (
                      <span className="contact-text">Miembro desde {perfil.fecha_nacimiento ? new Date(perfil.fecha_nacimiento).getFullYear() : "2024"}</span>
                    )}
                  </div>
                </div>

                {/* Stats en grid */}
                <div className="sidebar-stats">
                  <div className="stat-card">
                    <span className="stat-number">{perfil.prendas ? perfil.prendas.length : 0}</span>
                    <span className="stat-label">Prendas Activas</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Intercambios</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="sidebar-actions">
                  {isOwnProfile && isEditMode ? (
                    <>
                      <button className="sidebar-btn success" onClick={handleSaveChanges}>
                        <span>💾 Guardar Cambios</span>
                      </button>
                      <button className="sidebar-btn secondary" onClick={handleCancelEdit}>
                        <span>❌ Cancelar</span>
                      </button>
                    </>
                  ) : isOwnProfile ? (
                    <>
                      <button className="sidebar-btn primary" onClick={() => navigate("/chat")}>
                        <span>💬 Mis Mensajes</span>
                      </button>
                      <button className="sidebar-btn secondary" onClick={handleEditClick}>
                        <span>✏ Editar Perfil</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="sidebar-btn primary" onClick={() => navigate("/chat")}>
                        <span>💬 Enviar Mensaje</span>
                      </button>
                      <button className="sidebar-btn secondary" onClick={() => navigate("/editar")}>
                        <span>✏ Ver Perfil</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center Content */}
            <div className="profile-center-content">
              {/* Timeline Navigation */}
              <div className={`timeline-nav ${activeTab}-active`}>
                <button 
                  className={`nav-tab ${activeTab === "prendas" ? "active" : ""}`}
                  onClick={() => setActiveTab("prendas")}
                >
                  Prendas {isEditMode && isOwnProfile && '✏'}
                </button>
                <button 
                  className={`nav-tab ${activeTab === "intercambios" ? "active" : ""}`}
                  onClick={() => setActiveTab("intercambios")}
                >
                  Intercambios
                </button>
                <button 
                  className={`nav-tab ${activeTab === "media" ? "active" : ""}`}
                  onClick={() => setActiveTab("media")}
                >
                  Galería
                </button>
              </div>

              {/* Indicador de modo edición */}
              {isEditMode && isOwnProfile && (
                <div className="edit-mode-indicator">
                  <span className="edit-mode-text">✏ Modo Edición Activo</span>
                  <span className="edit-mode-subtitle">Los cambios se guardan localmente</span>
                </div>
              )}

              {/* Content Area */}
              <div className="timeline-content">
                {activeTab === "prendas" && (
                  <div className="prendas-section">
                    {/* Mostrar las prendas reales del usuario */}
                    {perfil.prendas && perfil.prendas.length > 0 ? (
                      <div className="prendas-grid">
                        {perfil.prendas.map((prenda) => (
                          <div key={prenda.id_prenda} className="prenda-card">
                              <div className="prenda-image-container">
                              {prenda.foto_prenda && (
                                <img
                                  src={`${BACKEND_URL}/uploads/${prenda.foto_prenda}`}
                                  alt={prenda.nombre_prenda}
                                  className="prenda-image"
                                  onClick={() => handlePrendaClick(prenda)}
                                />
                              )}
                            </div>
                            <div className="prenda-info">
                              <h4 className="prenda-name">{prenda.nombre_prenda}</h4>
                              <div className="prenda-meta">
                                <span className="prenda-category">Double P Marketplace</span>
                                <span className={`prenda-condition ${prenda.tipo_transaccion === 'venta' ? 'prenda-venta' : ''}`}>
                                  {prenda.tipo_transaccion === 'venta' 
                                    ? `💰 En Venta - $${prenda.precio?.toLocaleString('es-CO')}` 
                                    : '🔄 Disponible para intercambio'
                                  }
                                </span>
                              </div>
                              
                              {/* Mostrar etiquetas si existen */}
                              {prenda.etiquetas && prenda.etiquetas.length > 0 ? (
                                <div className="prenda-tags">
                                  {prenda.etiquetas.map((etiqueta, index) => (
                                    <span key={index} className="prenda-tag">#{etiqueta}</span>
                                  ))}
                                </div>
                              ) : (
                                <div className="prenda-stats">
                                  <span className="prenda-stat">👕 Moda Sostenible</span>
                                  <span className="prenda-stat">♻ Segunda Vida</span>
                                </div>
                              )}
                              
                              <div className="prenda-actions">
                                {/* Botón principal cambia según el modo de edición */}
                                <button 
                                  className="prenda-btn primary" 
                                  onClick={() => handlePrendaClick(prenda)}
                                >
                                  {isEditMode && isOwnProfile ? '✏ Editar Prenda' : '👁 Ver Detalles'}
                                </button>
                                
                                {/* Botón secundario solo en modo normal */}
                                {(!isEditMode || !isOwnProfile) && (
                                  <button 
                                    className={`prenda-btn ${prenda.tipo_transaccion === 'venta' ? 'purchase' : 'secondary'}`}
                                    onClick={() => navigate("/chat")}
                                  >
                                    {prenda.tipo_transaccion === 'venta' 
                                      ? '💳 Comprar' 
                                      : '🔄 Intercambiar'
                                    }
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-content">
                          <div className="empty-state-icon">👕</div>
                          <h3 className="empty-state-title">¡Comienza tu Colección!</h3>
                          <p className="empty-state-text">
                            Sube tus primeras prendas y únete a la comunidad de moda sostenible de Double P.
                            Cada prenda que compartes ayuda a crear un mundo más sustentable.
                          </p>
                          <button className="empty-state-btn" onClick={() => navigate("/agregar")}>
                            Agregar Primera Prenda
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "intercambios" && (
                  <div className="intercambios-section">
                    <div className="intercambios-header">
                      <h3>Historial de Intercambios</h3>
                      <p>Tus intercambios en Double P Marketplace</p>
                    </div>
                    
                    <div className="intercambios-stats">
                      <div className="intercambio-stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                          <span className="stat-number">0</span>
                          <span className="stat-label">Intercambios Completados</span>
                        </div>
                      </div>
                      <div className="intercambio-stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                          <span className="stat-number">0</span>
                          <span className="stat-label">En Proceso</span>
                        </div>
                      </div>
                      <div className="intercambio-stat-card">
                        <div className="stat-icon">💬</div>
                        <div className="stat-info">
                          <span className="stat-number">0</span>
                          <span className="stat-label">Conversaciones Activas</span>
                        </div>
                      </div>
                    </div>

                    <div className="empty-state">
                      <div className="empty-state-content">
                        <div className="empty-state-icon">🔄</div>
                        <h3 className="empty-state-title">¡Comienza a Intercambiar!</h3>
                        <p className="empty-state-text">
                          Aún no tienes intercambios. Explora las prendas de otros usuarios y 
                          encuentra el intercambio perfecto para renovar tu guardarropa de forma sostenible.
                        </p>
                        <div className="empty-state-actions">
                          <button className="empty-state-btn" onClick={() => navigate("/")}>
                            Explorar Catálogo
                          </button>
                          <button className="empty-state-btn secondary" onClick={() => navigate("/chat")}>
                            Ver Chats
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "media" && (
                  <div className="media-grid">
                    {perfil.prendas && perfil.prendas.length > 0 ? (
                      perfil.prendas.map((prenda) => (
                        prenda.foto_prenda && (
                          <img
                            key={prenda.id_prenda}
                            src={`${BACKEND_URL}/uploads/${prenda.foto_prenda}`}
                            alt={prenda.nombre_prenda}
                            className="media-item"
                            onClick={() => navigate(`/gestion_prendas/${prenda.id_prenda}`)}
                          />
                        )
                      ))
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-icon">📷</div>
                        <h3 className="empty-state-title">No hay imágenes</h3>
                        <p className="empty-state-text">No hay imágenes para mostrar</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Moved sidebar content below the center content */}
          <div className="bottom-sidebar-content">
            <div className="calculator-card">
              <div className="calculator-content">
                <h3 className="calculator-title">🧮 Calculadora Double P</h3>
                <p className="calculator-description">
                  Calcula el valor estimado de tus prendas y descubre oportunidades de intercambio perfectas.
                </p>
                <button className="calculate-btn" onClick={() => navigate("/agregar")}>
                  Calcular Valor de Prenda
                </button>
              </div>
            </div>

            <div className="tips-card">
              <div className="tips-content">
                <h3 className="tips-title">💡 Consejos Double P</h3>
                <div className="tip-item">
                  <span className="tip-icon">🌱</span>
                  <p>Intercambia prendas para un closet más sostenible</p>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">📸</span>
                  <p>Sube fotos de alta calidad para mejores intercambios</p>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">💬</span>
                  <p>Mantén conversaciones amigables y respetuosas</p>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">⭐</span>
                  <p>Valora a otros usuarios después de cada intercambio</p>
                </div>
              </div>
            </div>

            <div className="community-card">
              <div className="community-content">
                <h3 className="community-title">🌍 Comunidad Double P</h3>
                <p className="community-description">
                  Únete a nuestra comunidad global de intercambio sostenible.
                </p>
                <div className="community-stats">
                  <div className="community-stat">
                    <span className="community-number">1,234</span>
                    <span className="community-label">Usuarios Activos</span>
                  </div>
                  <div className="community-stat">
                    <span className="community-number">5,678</span>
                    <span className="community-label">Prendas Disponibles</span>
                  </div>
                  <div className="community-stat">
                    <span className="community-number">890</span>
                    <span className="community-label">Intercambios Este Mes</span>
                  </div>
                  <button className="community-btn" onClick={() => navigate("/")}>
                    Explorar Comunidad
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="loading-state">
          <div className="empty-state-icon">👤</div>
          <h3 className="empty-state-title">No se encontró información del usuario</h3>
          <p className="empty-state-text">
            Por favor, inicia sesión para ver tu perfil.
          </p>
          <button 
            className="action-btn primary" 
            onClick={() => navigate('/iniciar')}
            style={{marginTop: '20px'}}
          >
            Ir al Inicio
          </button>
        </div>
      )}
    </div>
  );
}

export default MiPerfil;
