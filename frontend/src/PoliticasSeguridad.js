import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PoliticasSeguridad.css';
import './ManagementTables.css';

export default function PoliticasSeguridad() {
  const navigate = useNavigate();
  return (
    <div className="ps-root">
      <div className="ps-header">
        <h1 className="ps-title">🔒 Políticas de Seguridad de Double P</h1>
        <button className="mg-back-btn" onClick={() => navigate('/configuracion')}>← Volver</button>
      </div>

      <div className="ps-card">
        <section className="ps-section">
          <h2>1. Objetivo</h2>
          <p>
            El objetivo de esta política es establecer los lineamientos que garanticen la confidencialidad, integridad y disponibilidad
            de la información gestionada por Double P, así como proteger los datos de usuarios, transacciones, inventarios y la infraestructura técnica del sistema.
          </p>
        </section>

        <section className="ps-section">
          <h2>2. Alcance</h2>
          <p>
            Aplica a todas las personas que participan en el proyecto: desarrolladores, administradores, usuarios con acceso al sistema, proveedores de servicios,
            y cualquier actor que interactúe con los activos de información de Double P.
          </p>
        </section>

        <section className="ps-section">
          <h2>3. Definiciones</h2>
          <ul>
            <li><strong>Activo de información:</strong> datos, sistemas, bases de datos, aplicaciones, infraestructura y documentos relacionados con Double P.</li>
            <li><strong>Usuario:</strong> cualquier persona que accede al sistema (usuarios finales, administradores, personal técnico).</li>
            <li><strong>Incidente de seguridad:</strong> evento que compromete o podría comprometer la seguridad de los activos de información.</li>
            <li><strong>Roles y permisos:</strong> niveles de acceso asignados según el perfil del usuario (por ejemplo: administrador, moderador, usuario estándar).</li>
          </ul>
        </section>

        <section className="ps-section">
          <h2>4. Principios generales</h2>
          <ul>
            <li>Aplicar el principio de mínimo privilegio.</li>
            <li>Adoptar seguridad desde el diseño ("security by design").</li>
            <li>Implementar defensa en profundidad con múltiples capas de protección.</li>
            <li>Mantener transparencia y responsabilidad sobre accesos, cambios y gestión de incidentes.</li>
          </ul>
        </section>

        <section className="ps-section">
          <h2>5. Controles técnicos</h2>
          <ul>
            <li><strong>Autenticación segura:</strong> contraseñas fuertes y, cuando sea posible, 2FA.</li>
            <li><strong>Cifrado de datos:</strong>
              <ul>
                <li>En tránsito: uso de HTTPS/TLS.</li>
                <li>En reposo: cifrado en bases de datos o almacenamiento seguro.</li>
              </ul>
            </li>
            <li><strong>Gestión de contraseñas:</strong> uso de gestores seguros para accesos administrativos.</li>
            <li><strong>Control de acceso y monitoreo:</strong> registro de accesos y auditorías periódicas.</li>
            <li><strong>Backups y recuperación:</strong> copias de seguridad automáticas y verificación de restauración.</li>
            <li><strong>Actualizaciones y parches:</strong> mantener librerías y frameworks al día.</li>
            <li><strong>Seguridad en desarrollo:</strong> validar entradas, evitar inyecciones SQL y ataques XSS.</li>
            <li><strong>Subida de archivos:</strong> proteger imágenes o documentos con permisos adecuados y URLs seguras.</li>
          </ul>
        </section>

        <section className="ps-section">
          <h2>6. Controles organizativos y administrativos</h2>
          <ul>
            <li><strong>Responsabilidades claras:</strong> designar responsable(s) de seguridad.</li>
            <li><strong>Formación:</strong> capacitar a los miembros del proyecto sobre buenas prácticas de seguridad.</li>
            <li><strong>Gestión de incidentes:</strong> definir protocolos de respuesta y comunicación.</li>
            <li><strong>Evaluación de riesgos:</strong> revisiones periódicas del entorno técnico y normativo.</li>
            <li><strong>Proveedores:</strong> asegurar que terceros cumplan estándares de seguridad.</li>
            <li><strong>Eliminación de datos:</strong> aplicar políticas de retención y eliminación segura de información.</li>
          </ul>
        </section>

        <section className="ps-section">
          <h2>7. Protección de datos personales</h2>
          <ul>
            <li>Recolectar únicamente los datos personales necesarios.</li>
            <li>Usar los datos solo con consentimiento y para los fines declarados.</li>
            <li>No compartir datos con terceros sin autorización.</li>
            <li>Garantizar derechos según Ley 1581 de 2012 (Colombia).</li>
            <li>Notificar oportunamente cualquier brecha de seguridad que afecte los datos personales.</li>
          </ul>
        </section>

        <section className="ps-section">
          <h2>8. Condiciones económicas y retención por venta</h2>
          <ul>
            <li>Double P actúa como intermediario en las transacciones.</li>
            <li>Por cada venta, se retiene el 4% del valor total como comisión.</li>
            <li>El porcentaje se descuenta antes de transferir el monto al vendedor.</li>
            <li>La comisión cubre gastos operativos, mantenimiento y seguridad.</li>
            <li>Los valores de comisión podrán revisarse y se notificará a los usuarios.</li>
          </ul>
        </section>

        <section className="ps-section">
          <h2>9. Gestión de incidentes de seguridad</h2>
          <ul>
            <li>Todo incidente o sospecha debe reportarse inmediatamente al responsable de seguridad.</li>
            <li>Se investigará cada caso para determinar causa, impacto y medidas correctivas.</li>
            <li>Se registrará el incidente y se aplicarán mejoras para evitar recurrencias.</li>
          </ul>
        </section>

        <section className="ps-section">
          <h2>10. Monitorización, auditoría y cumplimiento</h2>
          <ul>
            <li>Se mantendrán registros de actividad y auditorías de acceso.</li>
            <li>Se realizarán revisiones internas o externas de cumplimiento.</li>
            <li>El incumplimiento podrá conllevar suspensión de cuentas o sanciones según términos de uso.</li>
          </ul>
        </section>

        <section className="ps-section">
          <h2>11. Revisión y actualización</h2>
          <p>
            Esta política será revisada al menos una vez al año o cuando haya cambios en el sistema o en la legislación aplicable. Las versiones anteriores se conservarán para control y trazabilidad.
          </p>
        </section>
      </div>
    </div>
  );
}