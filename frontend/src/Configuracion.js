import React from "react";
import { useNavigate } from "react-router-dom";
import "./Configuracion.css";

export default function Configuracion() {
  const navigate = useNavigate();

  const irAEditar = () => navigate("/editar");
  const irAListaDeseos = () => navigate("/lista_deseos");
  const irAPoliticasSeguridad = () => navigate("/politicas-seguridad");
  const irAContactanos = () => navigate("/contactanos");
  const irAPreguntasFrecuentes = () => navigate("/preguntas-frecuentes");

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="configuracion-wrapper">
          <div className="configuracion-header">
            <h1 className="configuracion-title">Configuración</h1>
            <p className="configuracion-subtitle">Personaliza tu experiencia en Double P</p>
          </div>

          <div className="configuracion-container">
            {/* Sección Mi Cuenta */}
            <div className="config-section">
              <div className="section-header">
                <div className="section-icon">👤</div>
                <h2 className="section-title">Mi Cuenta</h2>
              </div>
              <div className="button-group">
                <button className="config-btn" onClick={irAEditar}>
                  <span className="btn-icon">✏️</span>
                  <span className="btn-text">Mi Perfil</span>
                  <span className="btn-arrow">→</span>
                </button>
                <button className="config-btn" onClick={irAListaDeseos}>
                  <span className="btn-icon">❤️</span>
                  <span className="btn-text">Lista de Deseos</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>

            {/* Sección Ayuda y Soporte */}
            <div className="config-section">
              <div className="section-header">
                <div className="section-icon">💬</div>
                <h2 className="section-title">Ayuda y Soporte</h2>
              </div>
              <div className="button-group">
                <button className="config-btn" onClick={irAPoliticasSeguridad}>
                  <span className="btn-icon">🔒</span>
                  <span className="btn-text">Políticas de Seguridad</span>
                  <span className="btn-arrow">→</span>
                </button>
                <button className="config-btn" onClick={irAPreguntasFrecuentes}>
                  <span className="btn-icon">❓</span>
                  <span className="btn-text">Preguntas Frecuentes</span>
                  <span className="btn-arrow">→</span>
                </button>
                <button className="config-btn" onClick={irAContactanos}>
                  <span className="btn-icon">📧</span>
                  <span className="btn-text">Contáctanos</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
