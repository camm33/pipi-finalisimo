import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './ManagementTables.css';
import './AnimatedPanel.css';

function GestionarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ id_rol: '', tallas: '', fecha_nacimiento: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [acordeonAbierto, setAcordeonAbierto] = useState(null);
  const navigate = useNavigate();

  const showMessage = (text, type = 'success', timeout = 5000) => {
    setMessage({ text, type });
    if (timeout > 0) setTimeout(() => setMessage(null), timeout);
  };

  useEffect(() => {
    const headers = {
      "X-Id-Rol": localStorage.getItem("id_rol") || "",
      "X-Id-Usuario": localStorage.getItem("id_usuario") || "",
      "Content-Type": "application/json",
    };
    fetch("http://localhost:5000/api/usuarios", {
      credentials: "include",
      headers
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setUsuarios(data);
        else if (data && Array.isArray(data.data)) setUsuarios(data.data);
        else setUsuarios([]);
      })
      .catch(err => showMessage("Error al cargar usuarios: " + err.message, "error"));
  }, []);

  const handleEditar = async (id_usuario) => {
    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${id_usuario}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSelectedUser(data);
      showMessage(`Usuario cargado para edición`, 'success', 2000);
    } catch (err) {
      showMessage('Error al obtener usuario: ' + err.message, 'error');
    }
  };

  const handleSelectedChange = (field, value) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
  };

  const formatDateForInput = (v) => {
    if (!v) return '';
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return '';
    }
  };

  const handleSaveSelected = async () => {
    if (!selectedUser || !selectedUser.id_usuario) return;
    setSaving(true);
    const id = selectedUser.id_usuario;
    const payload = { ...selectedUser };
    if (payload.fecha_nacimiento)
      payload.fecha_nacimiento = formatDateForInput(payload.fecha_nacimiento);
    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar usuario');
      const updated = await res.json();
      setUsuarios(prev => prev.map(u => (u.id_usuario === id ? updated : u)));
      setSelectedUser(updated);
      showMessage('Usuario guardado correctamente', 'success');
    } catch (err) {
      showMessage('Error al guardar usuario: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedUser || !selectedUser.id_usuario)
      return showMessage('No hay usuario seleccionado', 'error');
    const maybeId = String(selectedUser.id_usuario);
    if (pendingDelete !== maybeId) {
      setPendingDelete(maybeId);
      showMessage('Pulsa eliminar de nuevo para confirmar', 'warning', 5000);
      setTimeout(() => { if (pendingDelete === maybeId) setPendingDelete(null); }, 5000);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${encodeURIComponent(maybeId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setUsuarios(prev => prev.filter(u => u.id_usuario !== selectedUser.id_usuario));
      setSelectedUser(null);
      setAcordeonAbierto(null);
      showMessage('Usuario eliminado correctamente', 'success');
    } catch (err) {
      showMessage('Error al eliminar usuario: ' + err.message, 'error');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ id_rol: '', tallas: '', fecha_nacimiento: '' });
    setSearch('');
  };

  const getFilteredUsuarios = () => {
    return usuarios.filter(u => {
      const q = search.toLowerCase();
      const composite = [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido, u.nombre]
        .filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = composite.includes(q) || (u.correo || '').toLowerCase().includes(q);
      const matchesRol = !filters.id_rol || u.id_rol?.toString() === filters.id_rol;
      const matchesTallas = !filters.tallas || (u.talla || '').toLowerCase() === filters.tallas.toLowerCase();
      const matchesFecha = !filters.fecha_nacimiento || (u.fecha_nacimiento && u.fecha_nacimiento.split('T')[0] === filters.fecha_nacimiento);
      return matchesSearch && matchesRol && matchesTallas && matchesFecha;
    });
  };

  return (
    <div className="mg-container">
      {message && (
        <div className={`mg-msg ${message.type}`}>{message.text}</div>
      )}
      <div className="mg-header-container">
        <button onClick={() => navigate('/AdminDashboard')} className="mg-back-btn">Volver</button>
        <h2 style={{ color: '#6d5d47', fontWeight: '600' }}>Gestión de Usuarios</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mg-form-input"
            style={{ width: '280px' }}
          />
          <button onClick={() => setShowFilters(!showFilters)} className="mg-btn view">
            Filtros
          </button>
        </div>
        {showFilters && (
          <div className="mg-filters-panel">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <div>
                <label className="mg-form-label">Rol</label>
                <select value={filters.id_rol} onChange={(e) => handleFilterChange('id_rol', e.target.value)} className="mg-form-input">
                  <option value="">Todos</option>
                  <option value="1">Administrador</option>
                  <option value="2">Usuario</option>
                </select>
              </div>
              <div>
                <label className="mg-form-label">Talla</label>
                <select value={filters.tallas} onChange={(e) => handleFilterChange('tallas', e.target.value)} className="mg-form-input">
                  <option value="">Todas</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
              <div>
                <label className="mg-form-label">Fecha nacimiento</label>
                <input type="date" value={filters.fecha_nacimiento} onChange={(e) => handleFilterChange('fecha_nacimiento', e.target.value)} className="mg-form-input" />
              </div>
            </div>
            <button onClick={clearFilters} className="mg-btn delete">Limpiar filtros</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        <div className="mg-table-container" style={{ flex: 1 }}>
          <table className="mg-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {getFilteredUsuarios().length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '48px 0', color: '#bfa074', fontSize: '1.2rem', fontWeight: '500', background: '#fffbe6', borderRadius: '12px' }}>
                    <div>
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>👤</span>
                      No hay usuarios para mostrar.<br />
                      <span style={{ fontSize: '1rem', color: '#a88a5c' }}>Prueba quitando filtros o revisa la base de datos.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                getFilteredUsuarios().map(u => (
                  <tr key={u.id_usuario}>
                    <td>{u.id_usuario}</td>
                    <td>{[u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ') || u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>
                      <button onClick={() => { setAcordeonAbierto(u.id_usuario); handleEditar(u.id_usuario); }} className="mg-btn view">
                        {acordeonAbierto === u.id_usuario ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {acordeonAbierto && selectedUser && (
          <div className="mg-table-container" style={{ minWidth: '350px', maxWidth: '400px', background: '#faf9f7', boxShadow: '0 0 20px #e8ddd0', borderLeft: '3px solid #d4b896' }}>
            <div style={{ padding: '20px' }}>
              <h4>Detalles y edición de usuario</h4>
              {Object.keys(selectedUser).filter(k => k !== 'id_usuario').map(field => (
                <div key={field} className="mg-form-group">
                  <label className="mg-form-label">{field}</label>
                  <input
                    type={field.toLowerCase().includes('pass') ? 'password' : field === 'fecha_nacimiento' ? 'date' : 'text'}
                    value={field === 'fecha_nacimiento' ? formatDateForInput(selectedUser[field]) : selectedUser[field] || ''}
                    onChange={(e) => handleSelectedChange(field, e.target.value)}
                    className="mg-form-input"
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleSaveSelected} disabled={saving} className="mg-btn edit">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={handleDeleteSelected} className="mg-btn delete">Eliminar</button>
                <button onClick={() => { setAcordeonAbierto(null); setSelectedUser(null); }} className="mg-back-btn">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionarUsuarios;