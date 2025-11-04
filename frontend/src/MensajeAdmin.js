import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './MensajeAdmin.css';

function EnviarCorreo() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [emails, setEmails] = useState([]);
  const [modo, setModo] = useState("uno"); // 'uno' o 'todos'
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const navigate = useNavigate();

  const handleEnviar = async () => {
    try {
      const mensajeCompleto = {
        correo: modo === 'todos' ? null : correo,
        mensaje,
        enviar_todos: modo === 'todos',
        usuario_info: usuarioInfo ? {
          id_usuario: usuarioInfo.id_usuario,
          username: usuarioInfo.username_usuario || localStorage.getItem("username"),
          nombre_completo: `${usuarioInfo.PrimerNombre || ''} ${usuarioInfo.SegundoNombre || ''}`.trim(),
          email_admin: usuarioInfo.email_usuario
        } : {
          id_usuario: localStorage.getItem("id_usuario"),
          username: localStorage.getItem("username"),
          nombre_completo: "Administrador",
          email_admin: "admin@doublepi.com"
        }
      };

      const res = await fetch("http://127.0.0.1:5000/api/enviar_correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mensajeCompleto)
      });

      const data = await res.json();
      setRespuesta(data.resultado || JSON.stringify(data));
    } catch (error) {
      setRespuesta("❌ Error al enviar correo. Intenta más tarde.");
    }
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/usuarios_emails", {
          credentials: "include"
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && data.emails) setEmails(data.emails);
      } catch (err) {
        console.error('Error al cargar emails:', err);
        setEmails([]);
      }
    };

    const fetchUsuarioInfo = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/mi_perfil", {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          if (data.perfil) setUsuarioInfo(data.perfil);
        }
      } catch (err) {
        console.error('Error al cargar información del usuario:', err);
      }
    };

    fetchEmails();
    fetchUsuarioInfo();
  }, []);

  return (
    <div className="mensaje-container">
      <div className="mensaje-main-panel">
        {/* Panel izquierdo - Imagen */}
        <div className="mensaje-image-panel">
          <img src="/BeeP.png" alt="BeeP" className="mensaje-beep-image" />
        </div>

        {/* Panel derecho */}
        <div className="mensaje-form-panel">
          <button 
            onClick={() => navigate('/AdminDashboard')} 
            className="mensaje-back-btn"
            title="Volver al dashboard"
          >
            ←
          </button>

          <div className="mensaje-header">
            <h1 className="mensaje-title">MENSAJES</h1>
            <p className="mensaje-subtitle">
              Envía mensajes a los usuarios de Double Π
            </p>

            {usuarioInfo && (
              <div style={{
                background: 'linear-gradient(135deg, #f8f5ec 0%, #e8ddd0 100%)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginTop: '15px',
                border: '1px solid #d4b896'
              }}>
                <p style={{
                  margin: '0',
                  fontSize: '12px',
                  color: '#6d5d47',
                  fontWeight: '600'
                }}>
                  📤 Enviando como: {usuarioInfo.username_usuario || localStorage.getItem("username")} 
                  {usuarioInfo.PrimerNombre && ` (${usuarioInfo.PrimerNombre} ${usuarioInfo.SegundoNombre || ''})`}
                </p>
              </div>
            )}
          </div>

          <div className="mensaje-form">
            <div className="mensaje-radio-group">
              <div className="mensaje-radio-container">
                <label className="mensaje-radio-label">
                  <input 
                    type="radio" 
                    name="modo" 
                    value="uno" 
                    checked={modo === 'uno'} 
                    onChange={() => setModo('uno')}
                    className="mensaje-radio-input"
                  />
                  Enviar a un usuario
                </label>
                <label className="mensaje-radio-label">
                  <input 
                    type="radio" 
                    name="modo" 
                    value="todos" 
                    checked={modo === 'todos'} 
                    onChange={() => setModo('todos')}
                    className="mensaje-radio-input"
                  />
                  Enviar a todos
                </label>
              </div>
            </div>

            {modo === 'uno' && (
              <div className="mensaje-field-group">
                <label className="mensaje-field-label">Email address</label>
                <select 
                  value={correo} 
                  onChange={(e) => setCorreo(e.target.value)}
                  className="mensaje-select"
                >
                  <option value="">-- Selecciona un usuario --</option>
                  {emails.length > 0 ? (
                    emails.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))
                  ) : (
                    <option value="" disabled>Cargando usuarios...</option>
                  )}
                </select>

                <input 
                  type="email" 
                  placeholder="O escribe un email personalizado" 
                  value={correo} 
                  onChange={(e) => setCorreo(e.target.value)}
                  className="mensaje-input"
                />
              </div>
            )}

            <div className="mensaje-field-group">
              <label className="mensaje-field-label">Mensaje</label>
              <textarea 
                placeholder="Escribe tu mensaje aquí..." 
                value={mensaje} 
                onChange={(e) => setMensaje(e.target.value)}
                className="mensaje-textarea"
              />
            </div>

            <button onClick={handleEnviar} className="mensaje-submit-btn">
              Enviar Mensaje
            </button>

            {respuesta && (
              <div className={`mensaje-response ${respuesta.includes('Error') ? 'error' : 'success'}`}>
                {respuesta}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnviarCorreo;
