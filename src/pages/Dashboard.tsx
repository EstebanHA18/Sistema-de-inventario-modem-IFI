import React, { useState } from 'react';
import { 
  TrendingUp, Package, UserPlus, AlertCircle, 
  ClipboardCheck, Search, History, Filter, ExternalLink
} from 'lucide-react';
import './Dashboard.css';

const SummaryCards = () => (
  <div className="summary-cards-container">
    <div className="dashboard-section summary-card interactive-card">
      <div>
        <p className="text-caption text-on-surface-variant uppercase tracking-wider">Total Stock</p>
        <h2 className="text-display" style={{ marginTop: 'var(--space-xs)' }}>1,284</h2>
        <div className="flex-center" style={{ gap: 'var(--space-xs)', marginTop: 'var(--space-xs)', color: 'var(--color-tertiary-fixed-dim)' }}>
          <TrendingUp size={14} />
          <span className="text-caption">+12% this week</span>
        </div>
      </div>
      <div className="summary-card-icon">
        <Package size={24} />
      </div>
    </div>

    <div className="dashboard-section summary-card interactive-card">
      <div>
        <p className="text-caption text-on-surface-variant uppercase tracking-wider">Assigned</p>
        <h2 className="text-display" style={{ marginTop: 'var(--space-xs)' }}>842</h2>
        <div className="flex-center" style={{ gap: 'var(--space-xs)', marginTop: 'var(--space-xs)', color: 'var(--color-secondary)' }}>
          <TrendingUp size={14} />
          <span className="text-caption">65.5% Utilization</span>
        </div>
      </div>
      <div className="summary-card-icon">
        <UserPlus size={24} />
      </div>
    </div>

    <div className="dashboard-section summary-card interactive-card" style={{ borderColor: 'var(--color-error)' }}>
      <div>
        <p className="text-caption text-on-surface-variant uppercase tracking-wider">Pending</p>
        <h2 className="text-display" style={{ marginTop: 'var(--space-xs)' }}>42</h2>
        <div className="flex-center" style={{ gap: 'var(--space-xs)', marginTop: 'var(--space-xs)', color: 'var(--color-error)' }}>
          <AlertCircle size={14} />
          <span className="text-caption">Needs Verification</span>
        </div>
      </div>
      <div className="summary-card-icon" style={{ color: 'var(--color-error)' }}>
        <ClipboardCheck size={24} />
      </div>
    </div>
  </div>
);

const AssignmentSection = () => {
  const [selectedModem, setSelectedModem] = useState<string | null>(null);

  const modems = [
    { sn: 'HW992384-B', model: 'HUAWEI 4G' },
    { sn: 'ZT992410-A', model: 'ZTE MF296C' },
  ];

  return (
    <section className="dashboard-section assignment-section">
      <div className="section-header">
        <div className="section-title">
          <ClipboardCheck size={24} />
          <h3 className="text-headline-md">Asignar Equipos</h3>
        </div>
        <button className="btn-primary interactive-element">Procesar Asignación</button>
      </div>
      <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="text-caption form-label">Seleccione a quien asignar</label>
            <div className="input-wrapper">
              <Search className="input-icon" size={18} />
              <input type="text" className="text-input with-icon text-body-md" placeholder="Buscar nombre de colaborador..." />
            </div>
          </div>
          
          <div className="form-group">
            <label className="text-caption form-label">Zona de Asignación</label>
            <select className="select-input text-body-md">
              <option>Zona Occidente</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <h4 className="text-caption form-label" style={{ marginBottom: 'var(--space-xs)' }}>Módems Disponibles (Selección)</h4>
          <div className="modems-grid">
            {modems.map(m => (
              <div 
                key={m.sn} 
                className={`interactive-card modem-card ${selectedModem === m.sn ? 'selected' : ''}`}
                onClick={() => setSelectedModem(m.sn)}
              >
                <div className="modem-info">
                  <input 
                    type="checkbox" 
                    className="modem-checkbox" 
                    checked={selectedModem === m.sn}
                    readOnly
                  />
                  <div>
                    <p className="text-headline-md" style={{ fontSize: '16px', fontWeight: 'bold' }}>{m.model}</p>
                    <p className="text-label-mono" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px', marginTop: '4px' }}>SN: {m.sn}</p>
                  </div>
                </div>
                <span className="status-badge in-stock">In Stock</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

const ActivityHistory = () => (
  <section className="dashboard-section">
    <div className="section-header">
      <div className="section-title">
        <History size={24} />
        <h3 className="text-headline-md">Historial de Actividad Reciente</h3>
      </div>
      <button className="flex-center interactive-element" style={{ gap: 'var(--space-xs)', background: 'none', border: 'none', color: 'var(--color-on-surface-variant)', cursor: 'pointer' }}>
        <Filter size={18} />
        <span className="text-body-md">Filtrar</span>
      </button>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table className="history-table">
        <thead>
          <tr>
            <th className="text-caption">Fecha / Hora</th>
            <th className="text-caption">Serial Number</th>
            <th className="text-caption">Colaborador / Cliente</th>
            <th className="text-caption">Estado</th>
            <th className="text-caption">Acción</th>
          </tr>
        </thead>
        <tbody>
          {[
            { date: '14 Oct 2023, 10:24 AM', sn: 'TX992384-B', user: 'Roberto Jimenez', state: 'Asignado', dot: 'dot-assigned' },
            { date: '14 Oct 2023, 09:15 AM', sn: 'SA551221-M', user: 'Inventario General', state: 'Stock', dot: 'dot-stock' },
            { date: '13 Oct 2023, 04:50 PM', sn: 'TX911200-X', user: 'María Fernanda Ruiz', state: 'Asignado', dot: 'dot-assigned' },
            { date: '13 Oct 2023, 02:30 PM', sn: 'S6128899-K', user: 'Daniel Castro', state: 'Devuelto', dot: 'dot-returned', stateColor: 'var(--color-error)' },
          ].map((row, i) => (
            <tr key={i} className="history-row">
              <td className="text-body-md" style={{ color: 'var(--color-on-surface)' }}>{row.date}</td>
              <td className="text-label-mono" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>SN: {row.sn}</td>
              <td className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>{row.user}</td>
              <td>
                <div className="status-dot-wrapper">
                  <div className={`status-dot ${row.dot}`}></div>
                  <span className="text-caption" style={{ textTransform: 'uppercase', fontWeight: 'bold', color: row.stateColor || 'inherit' }}>{row.state}</span>
                </div>
              </td>
              <td>
                <button className="action-btn">
                  <ExternalLink size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-grid">
      <SummaryCards />
      
      <div className="dashboard-main-sections">
        <AssignmentSection />
      </div>

      <ActivityHistory />
    </div>
  );
};

export default Dashboard;
