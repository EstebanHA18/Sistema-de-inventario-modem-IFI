import React, { useState, useEffect } from 'react';
import { 
  Package, UserPlus, AlertCircle, 
  ClipboardCheck, Search, History, DollarSign, Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

interface DashboardStats {
  totalStock: number;
  assigned: number;
  pendingCount: number;
  pendingAmountNio: number;
  pendingAmountUsd: number;
}

const SummaryCards = ({ stats }: { stats: DashboardStats }) => (
  <div className="summary-cards-container">
    <div className="dashboard-section summary-card interactive-card">
      <div>
        <p className="text-caption text-on-surface-variant uppercase tracking-wider">Stock Total</p>
        <h2 className="text-display" style={{ marginTop: 'var(--space-xs)' }}>{stats.totalStock}</h2>
        <div className="flex-center" style={{ gap: 'var(--space-xs)', marginTop: 'var(--space-xs)', color: 'var(--color-tertiary-fixed-dim)' }}>
          <Package size={14} />
          <span className="text-caption">Unidades registradas</span>
        </div>
      </div>
      <div className="summary-card-icon">
        <Package size={24} />
      </div>
    </div>

    <div className="dashboard-section summary-card interactive-card">
      <div>
        <p className="text-caption text-on-surface-variant uppercase tracking-wider">Asignados</p>
        <h2 className="text-display" style={{ marginTop: 'var(--space-xs)' }}>{stats.assigned}</h2>
        <div className="flex-center" style={{ gap: 'var(--space-xs)', marginTop: 'var(--space-xs)', color: 'var(--color-secondary)' }}>
          <UserPlus size={14} />
          <span className="text-caption">
            {stats.totalStock > 0 ? ((stats.assigned / stats.totalStock) * 100).toFixed(1) : 0}% Uso
          </span>
        </div>
      </div>
      <div className="summary-card-icon">
        <UserPlus size={24} />
      </div>
    </div>

    <div className="dashboard-section summary-card interactive-card" style={{ borderColor: 'var(--color-error)' }}>
      <div>
        <p className="text-caption text-on-surface-variant uppercase tracking-wider">Pendientes por Cancelar</p>
        <h2 className="text-display" style={{ marginTop: 'var(--space-xs)' }}>{stats.pendingCount} <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>uds</span></h2>
        <div className="flex-center" style={{ gap: 'var(--space-xs)', marginTop: 'var(--space-xs)', color: 'var(--color-error)' }}>
          <DollarSign size={14} />
          <span className="text-caption" style={{ fontWeight: 'bold' }}>
            C$ {stats.pendingAmountNio.toFixed(2)} | $ {stats.pendingAmountUsd.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="summary-card-icon" style={{ color: 'var(--color-error)' }}>
        <AlertCircle size={24} />
      </div>
    </div>
  </div>
);

const AssignmentSection = ({ onAssigned }: { onAssigned: () => void }) => {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [selectedPersonName, setSelectedPersonName] = useState<string>('');
  const [availableModems, setAvailableModems] = useState<any[]>([]);
  const [selectedModems, setSelectedModems] = useState<any[]>([]);
  const [modemSearch, setModemSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPersonnel();
    fetchAvailableModems();
  }, []);

  const fetchPersonnel = async () => {
    const { data } = await supabase.from('personnel').select('*').order('name');
    if (data) setPersonnel(data);
  };

  const fetchAvailableModems = async () => {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('status', 'En Stock')
      .order('created_at', { ascending: false });
    if (data) setAvailableModems(data);
  };

  const handleProcessAssignment = async () => {
    if (selectedModems.length === 0 || !selectedPersonName) {
      alert('Por favor, selecciona un colaborador y al menos un módem.');
      return;
    }

    const person = personnel.find(p => p.name === selectedPersonName);
    if (!person) {
      alert('El colaborador ingresado no existe. Por favor, selecciona uno de la lista.');
      return;
    }

    setIsProcessing(true);
    
    // Process all modems
    const ids = selectedModems.map(m => m.id);
    
    // 1. Update inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        status: 'Asignado', 
        assignment: person.name, 
        assignment_date: new Date().toISOString().split('T')[0],
        payment_status: 'Pendiente'
      })
      .in('id', ids);

    if (updateError) {
      console.error(updateError);
      alert('Error al procesar la asignación');
      setIsProcessing(false);
      return;
    }

    // 2. Add to activity log for each modem
    const logs = selectedModems.map(m => ({
      action_type: 'Asignación',
      serial_number: m.imei,
      personnel_name: person.name,
      details: `Asignado a ${person.name} en ${person.zone}`
    }));
    await supabase.from('activity_log').insert(logs);

    alert(`¡Asignación exitosa de ${selectedModems.length} equipos!`);
    setSelectedModems([]);
    setSelectedPersonName('');
    fetchAvailableModems();
    onAssigned();
    setIsProcessing(false);
  };

  const toggleSelection = (m: any) => {
    if (selectedModems.some(x => x.id === m.id)) {
      setSelectedModems(prev => prev.filter(x => x.id !== m.id));
    } else {
      setSelectedModems(prev => [...prev, m]);
    }
  };

  const filteredModems = availableModems.filter(m => 
    !modemSearch || 
    m.imei.toLowerCase().includes(modemSearch.toLowerCase()) || 
    m.brand.toLowerCase().includes(modemSearch.toLowerCase())
  ).slice(0, 10); // Limit to 10 for performance

  return (
    <section className="dashboard-section assignment-section">
      <div className="section-header">
        <div className="section-title">
          <ClipboardCheck size={24} />
          <h3 className="text-headline-md">Asignar Equipos</h3>
        </div>
        <button 
          className="btn-primary interactive-element" 
          onClick={handleProcessAssignment}
          disabled={isProcessing}
        >
          {isProcessing ? 'Procesando...' : 'Procesar Asignación'}
        </button>
      </div>
      <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="text-caption form-label">Seleccione a quien asignar</label>
            <input 
              list="personnel-list"
              className="text-input text-body-md" 
              value={selectedPersonName}
              onChange={(e) => setSelectedPersonName(e.target.value)}
              placeholder="-- Escriba o seleccione un colaborador --"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-outline)' }}
            />
            <datalist id="personnel-list">
              {personnel.map(p => (
                <option key={p.id} value={p.name}>{p.zone}</option>
              ))}
            </datalist>
          </div>
          
          <div className="form-group">
            <label className="text-caption form-label">Buscador Rápido de Stock</label>
            <div className="input-wrapper">
              <Search className="input-icon" size={18} />
              <input 
                type="text" 
                className="text-input with-icon text-body-md" 
                placeholder="Filtrar por IMEI o Modelo..." 
                value={modemSearch}
                onChange={(e) => setModemSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <h4 className="text-caption form-label" style={{ marginBottom: 'var(--space-xs)' }}>Módems Disponibles (Últimos ingresados)</h4>
          <div className="modems-grid">
            {filteredModems.length === 0 && (
              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>No hay módems disponibles o no coinciden con la búsqueda.</p>
            )}
            {filteredModems.map(m => {
              const isSelected = selectedModems.some(x => x.id === m.id);
              return (
              <div 
                key={m.id} 
                className={`interactive-card modem-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSelection(m)}
              >
                <div className="modem-info">
                  <input 
                    type="checkbox" 
                    className="modem-checkbox" 
                    checked={isSelected}
                    readOnly
                  />
                  <div>
                    <p className="text-headline-md" style={{ fontSize: '16px', fontWeight: 'bold' }}>{m.brand}</p>
                    <p className="text-label-mono" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px', marginTop: '4px' }}>IMEI: {m.imei}</p>
                  </div>
                </div>
                <span className="status-badge in-stock">
                  Stock disponible
                </span>
              </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

const ActivityHistory = ({ triggerFetch }: { triggerFetch: number }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [triggerFetch]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setHistory(data);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleClearHistory = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar todo el historial de actividad? Esta acción no se puede deshacer.')) return;

    const { error } = await supabase
      .from('activity_log')
      .delete()
      .not('id', 'is', null); // Delete all rows safely

    if (error) {
      console.error('Error clearing history:', error);
      alert(`Hubo un error al eliminar el historial: ${error.message || 'Desconocido'}`);
    } else {
      alert('Historial eliminado correctamente.');
      fetchHistory();
    }
  };

  const getDotClass = (action: string) => {
    if (action.includes('Asignación')) return 'dot-assigned';
    if (action.includes('Cancelado')) return 'dot-stock'; // green
    if (action.includes('Devolución')) return 'dot-returned'; // red
    return 'dot-stock';
  };

  const filteredHistory = history.filter(row => {
    if (!historySearch) return true;
    const term = historySearch.toLowerCase();
    return (
      row.action_type.toLowerCase().includes(term) ||
      row.serial_number.toLowerCase().includes(term) ||
      (row.personnel_name && row.personnel_name.toLowerCase().includes(term))
    );
  });

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div className="section-title">
          <History size={24} />
          <h3 className="text-headline-md">Historial de Actividad Reciente</h3>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <div className="input-wrapper" style={{ width: '250px' }}>
            <Search className="input-icon" size={16} />
            <input 
              type="text" 
              className="text-input with-icon text-caption" 
              placeholder="Filtrar historial..." 
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              style={{ padding: '6px 12px 6px 36px' }}
            />
          </div>
          <button 
            className="btn-secondary interactive-element flex-center" 
            style={{ gap: '8px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            onClick={handleClearHistory}
            title="Borrar todo el historial"
          >
            <Trash2 size={16} />
            Borrar
          </button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="history-table">
          <thead>
            <tr>
              <th className="text-caption">Fecha / Hora</th>
              <th className="text-caption">Número de Serie (IMEI)</th>
              <th className="text-caption">Colaborador / Cliente</th>
              <th className="text-caption">Acción Realizada</th>
              <th className="text-caption">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-md)', color: 'var(--color-on-surface-variant)' }}>
                  Aún no hay actividad registrada o no coincide con el filtro.
                </td>
              </tr>
            )}
            {filteredHistory.map((row) => (
              <tr key={row.id} className="history-row">
                <td className="text-body-md" style={{ color: 'var(--color-on-surface)' }}>{formatDate(row.created_at)}</td>
                <td className="text-label-mono" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{row.serial_number}</td>
                <td className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>{row.personnel_name}</td>
                <td>
                  <div className="status-dot-wrapper">
                    <div className={`status-dot ${getDotClass(row.action_type)}`}></div>
                    <span className="text-caption" style={{ textTransform: 'uppercase', fontWeight: 'bold', color: row.action_type.includes('Cancelado') ? 'var(--color-tertiary-fixed-dim)' : 'inherit' }}>
                      {row.action_type}
                    </span>
                  </div>
                </td>
                <td className="text-caption" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {row.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStock: 0,
    assigned: 0,
    pendingCount: 0,
    pendingAmountNio: 0,
    pendingAmountUsd: 0
  });
  
  // Trigger to reload components when an assignment happens
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
    
    // Listen for the custom event from the global search bar
    const handleGlobalUpdate = () => refresh();
    window.addEventListener('inventory-updated', handleGlobalUpdate);
    return () => window.removeEventListener('inventory-updated', handleGlobalUpdate);
  }, [refreshTrigger]);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  const fetchStats = async () => {
    // 1. Get all inventory to count
    const { data: invData } = await supabase.from('inventory').select('*');
    if (!invData) return;

    // 2. Get equipment models to get prices
    const { data: modelsData } = await supabase.from('equipment_models').select('*');
    const modelMap = new Map();
    if (modelsData) {
      modelsData.forEach(m => {
        // Because brand_model is like "HUAWEI (HW992384-B)" we might need to match on brand
        // We do a simple fallback mapping
        modelMap.set(m.brand_model, m);
      });
    }

    let total = invData.length;
    let assigned = 0;
    let pendingC = 0;
    let nio = 0;
    let usd = 0;

    invData.forEach(item => {
      const isLegacyAssigned = item.status === 'Asignado' && !item.payment_status;
      const isPending = item.payment_status === 'Pendiente' || isLegacyAssigned;
      const isCancelled = item.payment_status === 'Cancelado';

      if (isCancelled) {
        total--;
      } else {
        if (item.status === 'Asignado') assigned++;
      }

      if (isPending) {
        pendingC++;
        // Find price. We search models that include the item.brand string
        const model = modelsData?.find(m => m.brand_model.includes(item.brand));
        if (model) {
          nio += model.price_nio || 0;
          usd += model.price_usd || 0;
        }
      }
    });

    setStats({
      totalStock: total,
      assigned: assigned,
      pendingCount: pendingC,
      pendingAmountNio: nio,
      pendingAmountUsd: usd
    });
  };

  return (
    <div className="dashboard-grid">
      <SummaryCards stats={stats} />
      
      <div className="dashboard-main-sections">
        <AssignmentSection onAssigned={refresh} />
      </div>

      <ActivityHistory triggerFetch={refreshTrigger} />
    </div>
  );
};

export default Dashboard;
