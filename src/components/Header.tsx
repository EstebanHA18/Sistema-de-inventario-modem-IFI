import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import './Header.css';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm.length < 4) {
      setSearchResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('*')
        .or(`imei.ilike.%${searchTerm}%,iccid.ilike.%${searchTerm}%`)
        .limit(5);
      
      setSearchResults(data || []);
    };

    const timer = setTimeout(fetchSearchResults, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleMarkAsPaid = async (item: any) => {
    if (!window.confirm(`¿Confirmar pago cancelado para el IMEI ${item.imei}?`)) return;

    const { error } = await supabase
      .from('inventory')
      .update({ payment_status: 'Cancelado' })
      .eq('id', item.id);

    if (!error) {
      await supabase.from('activity_log').insert([{
        action_type: 'Pago Cancelado',
        serial_number: item.imei,
        personnel_name: item.assignment || 'Desconocido',
        details: 'Pago registrado desde el buscador principal'
      }]);
      
      alert('Pago registrado con éxito.');
      setSearchTerm('');
      setSearchResults([]);
      window.dispatchEvent(new Event('inventory-updated'));
    } else {
      alert('Error al registrar el pago');
    }
  };

  let searchPlaceholder = "Buscar...";
  if (location.pathname === '/inventory') {
    searchPlaceholder = "Buscar módems, IMEI, ICCID...";
  } else if (location.pathname === '/personal') {
    searchPlaceholder = "Buscar técnicos o supervisores...";
  } else if (location.pathname === '/settings') {
    searchPlaceholder = "Buscar modelos y precios...";
  } else {
    searchPlaceholder = "Buscar módems, números de serie, clientes...";
  }

  return (
    <header className="header">
      <div className="search-container" style={{ position: 'relative' }}>
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder={searchPlaceholder}
          className="search-input text-body-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {searchResults.length > 0 && (
          <div className="search-results-dropdown">
            <h4 className="text-caption" style={{ padding: '4px 8px', color: 'var(--color-on-surface-variant)' }}>Resultados de Módems</h4>
            {searchResults.map(item => (
              <div key={item.id} className="search-result-item">
                <div>
                  <p className="text-body-md" style={{ fontWeight: 'bold' }}>{item.brand}</p>
                  <p className="text-caption" style={{ color: 'var(--color-on-surface-variant)' }}>IMEI: {item.imei}</p>
                </div>
                {(item.status === 'Asignado' && (item.payment_status === 'Pendiente' || !item.payment_status)) ? (
                  <button 
                    className="btn-primary" 
                    style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center' }}
                    onClick={() => handleMarkAsPaid(item)}
                  >
                    <CheckCircle size={14} />
                    Cobrar
                  </button>
                ) : (
                  <span className="text-caption" style={{ 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    background: item.payment_status === 'Cancelado' ? 'rgba(111, 251, 190, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: item.payment_status === 'Cancelado' ? 'var(--color-tertiary-fixed-dim)' : 'var(--color-on-surface-variant)'
                  }}>
                    {item.payment_status === 'Cancelado' ? 'Pagado' : item.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="header-actions">
        <button 
          className="notification-btn" 
          onClick={toggleTheme}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
