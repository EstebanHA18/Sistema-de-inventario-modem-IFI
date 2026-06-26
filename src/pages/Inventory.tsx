import React, { useState, useEffect, useRef } from 'react';
import { FileSpreadsheet, Box, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import * as xlsx from 'xlsx';
import { supabase } from '../lib/supabase';
import './Inventory.css';

interface InventoryItem {
  id?: string;
  imei: string;
  brand: string;
  status: string;
  assignment: string | null;
  iccid?: string | null;
  assignment_date?: string | null;
  created_at?: string;
  payment_status?: string | null;
}

const formatDisplayDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  if (!isNaN(Number(dateStr))) {
    // Es un número serial de Excel que ya está en la DB
    const jsDate = new Date(Math.round((Number(dateStr) - 25569) * 86400 * 1000));
    return jsDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    // Ajustar zona horaria si es ISO sin tiempo para evitar desfase de días
    return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return dateStr;
};

interface InventoryProps {
  searchTerm?: string;
}

const Inventory: React.FC<InventoryProps> = ({ searchTerm = '' }) => {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory:', error);
      alert('Error cargando el inventario. Asegúrate de haber ejecutado el script SQL en Supabase.');
    } else {
      setInventoryData(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInventory();
    
    // Escuchar el evento del buscador global para refrescar
    const handleGlobalUpdate = () => fetchInventory();
    window.addEventListener('inventory-updated', handleGlobalUpdate);
    return () => window.removeEventListener('inventory-updated', handleGlobalUpdate);
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Parse data starting from row index 1 (skipping title row at 0)
      const jsonData = xlsx.utils.sheet_to_json<any>(worksheet, { range: 1 });
      
      const formatDate = (val: any) => {
        if (!val) return null;
        if (val instanceof Date) return val.toISOString().split('T')[0];
        if (!isNaN(Number(val))) {
          return new Date(Math.round((Number(val) - 25569) * 86400 * 1000)).toISOString().split('T')[0];
        }
        return String(val);
      };

      const formattedData = jsonData.map((row) => {
        const rawAssign = row['ASIGNACION'] ? String(row['ASIGNACION']).trim() : '';
        // Si no hay nadie asignado o si es Guadalupe (almacén central), se considera En Stock
        const isStock = rawAssign === '' || rawAssign.toUpperCase() === 'GUADALUPE GARCIA';

        return {
          item: row['ITEM'] ? String(row['ITEM']) : null,
          entry_date: formatDate(row['FECHA DE ENTRADA']),
          channel: row['CANAL'] ? String(row['CANAL']) : null,
          brand: row['MARCA'] ? String(row['MARCA']) : 'Desconocido',
          imei: row['IMEI'] ? String(row['IMEI']) : null,
          iccid: row['ICCID'] ? String(row['ICCID']) : null,
          assignment: isStock ? null : rawAssign,
          assignment_date: formatDate(row['FECHA DE ASIGNACION']),
          status: isStock ? 'En Stock' : 'Asignado'
        };
      }).filter(row => row.imei); // Filtrar filas vacías sin IMEI

      // Eliminar duplicados en el mismo archivo (PostgreSQL no permite upsert de duplicados en la misma petición)
      const uniqueData = Array.from(new Map(formattedData.map(item => [item.imei, item])).values());

      if (uniqueData.length === 0) {
        alert('No se encontraron datos válidos (faltan IMEIs).');
        setIsUploading(false);
        return;
      }

      // Insert or upsert to Supabase with ignoreDuplicates to preserve assignments
      const { error } = await supabase
        .from('inventory')
        .upsert(uniqueData, { onConflict: 'imei', ignoreDuplicates: true });

      if (error) {
        console.error('Supabase upload error:', error);
        alert(`Error de Supabase: ${error.message || JSON.stringify(error)}`);
      } else {
        alert(`Lote procesado. Los equipos nuevos han sido agregados y los duplicados fueron ignorados para mantener sus asignaciones y estados intactos.`);
        fetchInventory(); // Refrescar la tabla
      }

    } catch (error) {
      console.error('Error processing Excel:', error);
      alert('Error procesando el archivo Excel.');
    } finally {
      setIsUploading(false);
      // Limpiar input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este módem del inventario? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting modem:', error);
      alert('Hubo un error al eliminar el módem.');
    } else {
      fetchInventory();
    }
  };

  const handleMarkAsPaid = async (item: InventoryItem) => {
    if (!window.confirm(`¿Confirmar que el personal ha cancelado el pago para el IMEI ${item.imei}?`)) return;

    const { error } = await supabase
      .from('inventory')
      .update({ payment_status: 'Cancelado' })
      .eq('id', item.id);

    if (error) {
      console.error('Error updating payment:', error);
      alert('Error al registrar el pago.');
    } else {
      await supabase.from('activity_log').insert([{
        action_type: 'Pago Cancelado',
        serial_number: item.imei,
        personnel_name: item.assignment || 'Desconocido',
        details: 'Pago registrado desde el Inventario'
      }]);
      alert('Pago registrado exitosamente.');
      fetchInventory();
      // Notify other components if needed
      window.dispatchEvent(new Event('inventory-updated'));
    }
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h2 className="text-display" style={{ fontSize: '28px' }}>Inventario</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 'var(--space-xs)' }}>
            Gestión general de equipos en stock y asignados.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <select 
            className="text-input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--color-outline)' }}
          >
            <option value="Todos">Todos</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Pendiente">Pendiente de Pago</option>
            <option value="En Stock">En Stock</option>
            <option value="Asignado">Asignados</option>
          </select>
          <button 
            className="btn-secondary interactive-element flex-center" 
            style={{ gap: '8px' }}
            onClick={fetchInventory}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
            Actualizar
          </button>

          <button 
            className="btn-primary interactive-element flex-center" 
            style={{ gap: '8px' }}
            onClick={handleImportClick}
            disabled={isUploading}
          >
            <FileSpreadsheet size={20} />
            {isUploading ? 'Importando...' : 'Importar Lote (Excel)'}
          </button>
          
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>IMEI (Serial)</th>
              <th>ICCID</th>
              <th>Modelo / Marca</th>
              <th>Estado</th>
              <th>Asignación</th>
              <th>Fecha Asign.</th>
              <th>Estado Pago</th>
              <th>Fecha Importación</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && inventoryData
              .filter(item => {
                const term = searchTerm.toLowerCase();
                let matchesSearch = true;
                if (term) {
                  matchesSearch = (
                    item.imei?.toLowerCase().includes(term) ||
                    item.iccid?.toLowerCase().includes(term) ||
                    item.brand?.toLowerCase().includes(term) ||
                    item.assignment?.toLowerCase().includes(term) ||
                    item.status?.toLowerCase().includes(term)
                  ) ?? false;
                }
                
                if (!matchesSearch) return false;
                if (statusFilter === 'Todos') return true;

                const isStock = item.status === 'En Almacén' || item.status === 'En Stock' || item.assignment?.toUpperCase() === 'GUADALUPE GARCIA';
                const displayStatus = isStock ? 'En Stock' : item.status;
                const isAssigned = displayStatus === 'Asignado' || (!isStock && displayStatus !== 'Devuelto');
                const displayPaymentStatus = item.payment_status === 'Cancelado' ? 'Cancelado' : (isAssigned ? 'Pendiente' : 'N/A');

                if (statusFilter === 'Cancelado') return displayPaymentStatus === 'Cancelado';
                if (statusFilter === 'Pendiente') return displayPaymentStatus === 'Pendiente';
                if (statusFilter === 'En Stock') return displayStatus === 'En Stock';
                if (statusFilter === 'Asignado') return isAssigned;

                return true;
              })
              .map((item, index) => {
              const isStock = item.status === 'En Almacén' || item.status === 'En Stock' || item.assignment?.toUpperCase() === 'GUADALUPE GARCIA';
              const displayStatus = isStock ? 'En Stock' : item.status;
              const displayAssignment = (item.assignment?.toUpperCase() === 'GUADALUPE GARCIA') ? null : item.assignment;
              
              const isAssigned = displayStatus === 'Asignado' || (!isStock && displayStatus !== 'Devuelto');
              const canMarkAsPaid = isAssigned && item.payment_status !== 'Cancelado';
              const displayPaymentStatus = item.payment_status === 'Cancelado' ? 'Cancelado' : (isAssigned ? 'Pendiente' : 'N/A');

              return (
                <tr key={item.id || index}>
                  <td className="text-label-mono" style={{ fontWeight: 'bold' }}>{item.imei}</td>
                  <td className="text-label-mono" style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>{item.iccid || 'N/A'}</td>
                  <td className="text-body-md" style={{ color: 'var(--color-on-surface)' }}>{item.brand}</td>
                  <td>
                    <span className={`status-badge ${isStock ? 'status-stock' : 'status-assigned'}`}>
                      {displayStatus}
                    </span>
                  </td>
                  <td className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {displayAssignment || 'N/A'}
                  </td>
                  <td className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px' }}>
                    {formatDisplayDate(item.assignment_date)}
                  </td>
                  <td>
                    {displayPaymentStatus === 'Pendiente' ? (
                      <span className="status-badge" style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--color-error)' }}>Pendiente</span>
                    ) : displayPaymentStatus === 'Cancelado' ? (
                      <span className="status-badge" style={{ background: 'rgba(111, 251, 190, 0.1)', color: 'var(--color-tertiary-fixed-dim)' }}>Cancelado</span>
                    ) : (
                      <span className="text-caption" style={{ color: 'var(--color-on-surface-variant)' }}>N/A</span>
                    )}
                  </td>
                  <td className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canMarkAsPaid && (
                        <button 
                          onClick={() => handleMarkAsPaid(item)}
                          style={{ color: 'var(--color-tertiary-fixed-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          title="Marcar como Cancelado (Pagado)"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        title="Eliminar de inventario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {!isLoading && inventoryData.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                  <Box size={48} style={{ margin: '0 auto var(--space-md)', opacity: 0.5, color: 'var(--color-on-surface-variant)' }} />
                  <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)' }}>No hay equipos en el inventario.</p>
                </td>
              </tr>
            )}
            
            {isLoading && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                  <RefreshCw size={32} className="spinning" style={{ margin: '0 auto var(--space-md)', color: 'var(--color-primary)' }} />
                  <p className="text-body-lg">Cargando inventario desde Supabase...</p>
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
