import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagementTables.css';

function GestionPagos() {
  const [pagos, setPagos] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    metodo_pago: '',
    estado_pago: '',
    monto_exacto: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const showMessage = (text, type = 'success', timeout = 4000) => {
    setMessage({ text, type });
    if (timeout) setTimeout(() => setMessage(null), timeout);
  };

  // Cargar los pagos al iniciar
  useEffect(() => {
    const headers = {
      "X-Id-Rol": localStorage.getItem("id_rol") || "",
      "X-Id-Usuario": localStorage.getItem("id_usuario") || "",
      "Content-Type": "application/json",
    };

    fetch('http://localhost:5000/api/pagos/', {
      credentials: "include",
      headers
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(data => setPagos(data))
      .catch(err => {
        console.error('Error cargando pagos', err);
        showMessage('Error cargando pagos: ' + err.message, 'error');
      });
  }, []);

  const handleView = async (id) => {
    if (selected && selected.id_pago === id) {
      setSelected(null);
      return;
    }

    try {
      const headers = {
        "X-Id-Rol": localStorage.getItem("id_rol") || "",
        "X-Id-Usuario": localStorage.getItem("id_usuario") || "",
        "Content-Type": "application/json",
      };

      const res = await fetch(`http://localhost:5000/api/pagos/${id}`, {
        credentials: "include",
        headers
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSelected(data);
    } catch (e) {
      console.error(e);
      showMessage('Error al obtener pago: ' + e.message, 'error');
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      metodo_pago: '',
      estado_pago: '',
      monto_exacto: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    setSearch('');
  };

  const getFilteredPagos = () => {
    return pagos.filter(p => {
      const q = search.toLowerCase();
      const campos = [
        String(p.id_pago ?? ''),
        String(p.id_usuario ?? ''),
        String(p.id_publicacion ?? ''),
        String(p.metodo_pago ?? ''),
        String(p.estado_pago ?? ''),
      ].map(s => s.toLowerCase());
      const matchesSearch = q === '' || campos.some(c => c.includes(q));
      const matchesMetodo = !filters.metodo_pago || (p.metodo_pago || '').toLowerCase() === filters.metodo_pago.toLowerCase();
      const matchesEstado = !filters.estado_pago || (p.estado_pago || '').toLowerCase() === filters.estado_pago.toLowerCase();
      const monto = parseFloat(p.monto) || 0;
      const matchesMontoExacto = !filters.monto_exacto || monto === parseFloat(filters.monto_exacto);
      const fechaPago = p.fecha_pago ? new Date(p.fecha_pago) : null;
      const matchesFechaDesde = !filters.fecha_desde || !fechaPago || fechaPago >= new Date(filters.fecha_desde);
      const matchesFechaHasta = !filters.fecha_hasta || !fechaPago || fechaPago <= new Date(filters.fecha_hasta);
      return matchesSearch && matchesMetodo && matchesEstado && matchesMontoExacto && matchesFechaDesde && matchesFechaHasta;
    });
  };

  return (
    <div className="mg-container" style={{ marginTop: '80px' }}>
      {message && (
        <div style={{ margin: '8px 0', padding: 8, background: message.type === 'error' ? '#fee' : '#efe' }}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="mg-header-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            onClick={() => navigate('/AdminDashboard')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'none'}
          >
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ margin: 0, color: '#6d5d47', fontSize: '18px', fontWeight: '600' }}>Gestión de Pagos</h2>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>Panel de solo lectura</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder="Buscar por usuario, pago, publicación o estado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mg-input"
              style={{ width: '280px' }}
            />
            <button onClick={() => setShowFilters(!showFilters)} className="mg-filters-btn">Filtros</button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mg-filters" style={{ marginTop: '20px' }}>
            <div>
              <label>Método de pago:</label>
              <select value={filters.metodo_pago} onChange={(e) => handleFilterChange('metodo_pago', e.target.value)}>
                <option value="">Todos</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="PSE">PSE</option>
                <option value="Efecty">Efecty</option>
              </select>
            </div>
            <div>
              <label>Estado del pago:</label>
              <select value={filters.estado_pago} onChange={(e) => handleFilterChange('estado_pago', e.target.value)}>
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PROCESO">En Proceso</option>
                <option value="COMPLETADO">Completado</option>
              </select>
            </div>
            <div>
              <label>Monto exacto:</label>
              <input
                type="number"
                placeholder="Ej: 25000"
                value={filters.monto_exacto}
                onChange={(e) => handleFilterChange('monto_exacto', e.target.value)}
              />
            </div>
            <button onClick={clearFilters}>Limpiar</button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="panel-container">
        <div className="table-section">
          <table className="mg-table">
            <thead>
              <tr><th>ID</th><th>Usuario</th><th>Publicación</th><th>Monto</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {getFilteredPagos().map(p => (
                <React.Fragment key={p.id_pago}>
                  <tr>
                    <td>{p.id_pago}</td>
                    <td>{p.id_usuario}</td>
                    <td>{p.id_publicacion}</td>
                    <td>${p.monto ? Number(p.monto).toLocaleString() : 'N/A'}</td>
                    <td>
                      <button onClick={() => handleView(p.id_pago)}>
                        {selected && selected.id_pago === p.id_pago ? 'Ocultar' : '✙'}
                      </button>
                    </td>
                  </tr>
                  {selected && selected.id_pago === p.id_pago && (
                    <tr className="mg-desplegable-row">
                      <td colSpan={5}>
                        <div className="mg-desplegable-panel">
                          <h4 style={{ fontSize: '1.2rem', color: '#6d5d47', fontWeight: '700', marginBottom: '12px' }}>
                            Detalle del pago #{selected.id_pago}
                          </h4>
                          {Object.keys(selected).map(k => (
                            <div key={k} style={{ marginBottom: '10px' }}>
                              <label style={{ fontWeight: '600', color: '#8d7b5a', fontSize: '1rem', display: 'block' }}>{k}</label>
                              <div style={{ background: '#f8f9fa', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                {String(selected[k] ?? '')}
                              </div>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                            <button onClick={() => setSelected(null)} className="mg-btn back" style={{ background: '#a88a5c' }}>Cerrar</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estilos internos (para filtros) */}
      <style>{`
        .mg-filters-btn {
          background: #bfa074;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(191,160,116,0.08);
          transition: background 0.2s, box-shadow 0.2s;
        }
        .mg-filters-btn:hover {
          background: #a88a5c;
          box-shadow: 0 4px 16px rgba(191,160,116,0.16);
        }
        /* Agrega estilos para los botones si no existen */
        .mg-btn {
          background: #bfa074;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(191,160,116,0.08);
          transition: background 0.2s, box-shadow 0.2s;
        }
        .mg-btn.edit {
          background: #bfa074;
        }
        .mg-btn.delete {
          background: #fee;
          color: #a00;
        }
        .mg-btn.back {
          background: #a88a5c;
        }
        .mg-btn:hover {
          background: #a88a5c;
          box-shadow: 0 4px 16px rgba(191,160,116,0.16);
        }
      `}</style>
    </div>
  );
}

export default GestionPagos;
