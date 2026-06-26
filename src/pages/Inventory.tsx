import React from 'react';
import { FileSpreadsheet, Box } from 'lucide-react';
import './Inventory.css';

const Inventory: React.FC = () => {
  const inventoryData = [
    { sn: 'HW992384-B', model: 'HUAWEI 4G', status: 'In Stock', location: 'Almacén Principal' },
    { sn: 'ZT992410-A', model: 'ZTE MF296C', status: 'In Stock', location: 'Almacén Principal' },
    { sn: 'TX992455-C', model: 'Sagemcom FAST3890', status: 'Assigned', location: 'Zona Occidente' },
    { sn: 'TX992482-D', model: 'Sagemcom FAST3890', status: 'Assigned', location: 'Zona Norte' },
    { sn: 'HW881234-A', model: 'HUAWEI 4G', status: 'In Stock', location: 'Almacén Principal' },
  ];

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h2 className="text-display" style={{ fontSize: '28px' }}>Inventario</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 'var(--space-xs)' }}>
            Gestión general de equipos en stock y asignados.
          </p>
        </div>
        <button className="btn-primary interactive-element flex-center" style={{ gap: '8px' }}>
          <FileSpreadsheet size={20} />
          Importar Lote (Excel)
        </button>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Modelo</th>
              <th>Estado</th>
              <th>Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item, index) => (
              <tr key={index}>
                <td className="text-label-mono" style={{ fontWeight: 'bold' }}>{item.sn}</td>
                <td className="text-body-md" style={{ color: 'var(--color-on-surface)' }}>{item.model}</td>
                <td>
                  <span className={`status-badge ${item.status === 'In Stock' ? 'status-stock' : 'status-assigned'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>{item.location}</td>
              </tr>
            ))}
            {inventoryData.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                  <Box size={48} style={{ margin: '0 auto var(--space-md)', opacity: 0.5, color: 'var(--color-on-surface-variant)' }} />
                  <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)' }}>No hay equipos en el inventario.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
