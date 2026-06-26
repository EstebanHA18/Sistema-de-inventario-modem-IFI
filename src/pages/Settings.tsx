

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, X, RefreshCw, DollarSign, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Settings.css';

interface EquipmentModel {
  id: string;
  brand_model: string;
  price_nio: number;
  price_usd: number;
  created_at: string;
}

interface SettingsProps {
  searchTerm?: string;
}

const SettingsPage: React.FC<SettingsProps> = ({ searchTerm = '' }) => {
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  // Form fields
  const [brandInput, setBrandInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [priceNio, setPriceNio] = useState('');
  const [priceUsd, setPriceUsd] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('equipment_models')
      .select('*')
      .order('brand_model', { ascending: true });
      
    if (error) {
      console.error('Error fetching models:', error);
    } else {
      setModels(data || []);
    }
    setIsLoading(false);
  };

  const openAddModal = () => {
    setBrandInput('');
    setModelInput('');
    setPriceNio('');
    setPriceUsd('');
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (model: EquipmentModel) => {
    let parsedBrand = model.brand_model;
    let parsedModel = '';
    
    if (model.brand_model.includes(' (')) {
      const parts = model.brand_model.split(' (');
      parsedBrand = parts[0];
      parsedModel = parts[1].replace(')', '');
    } else if (model.brand_model.includes(' - ')) {
      const parts = model.brand_model.split(' - ');
      parsedBrand = parts[0];
      parsedModel = parts.slice(1).join(' - ');
    } else {
      const parts = model.brand_model.split(' ');
      if (parts.length > 1) {
        parsedBrand = parts[0];
        parsedModel = parts.slice(1).join(' ');
      }
    }

    setBrandInput(parsedBrand);
    setModelInput(parsedModel);
    setPriceNio(model.price_nio?.toString() || '0');
    setPriceUsd(model.price_usd?.toString() || '0');
    setIsEditing(true);
    setCurrentId(model.id);
    setIsModalOpen(true);
  };

  const handleSaveModel = async () => {
    if (brandInput.trim() === '' || modelInput.trim() === '') {
      alert('Debes ingresar la marca y el modelo');
      return;
    }
    
    const combinedBrandModel = `${brandInput.trim()} (${modelInput.trim()})`;
    const nio = parseFloat(priceNio) || 0;
    const usd = parseFloat(priceUsd) || 0;

    if (isEditing && currentId) {
      const { error } = await supabase
        .from('equipment_models')
        .update({ 
          brand_model: combinedBrandModel, 
          price_nio: nio,
          price_usd: usd 
        })
        .eq('id', currentId);

      if (error) {
        console.error('Error updating model:', error);
        alert('Error al actualizar el modelo. Puede que el nombre ya exista.');
      } else {
        setIsModalOpen(false);
        fetchModels();
      }
    } else {
      const { error } = await supabase
        .from('equipment_models')
        .insert([
          { 
            brand_model: combinedBrandModel, 
            price_nio: nio,
            price_usd: usd 
          }
        ]);

      if (error) {
        console.error('Error adding model:', error);
        alert('Error al agregar modelo');
      } else {
        setIsModalOpen(false);
        fetchModels();
      }
    }
  };

  const handleDeleteModel = async (id: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este modelo?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('equipment_models')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting model:', error);
      alert('Error al eliminar modelo');
    } else {
      fetchModels();
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="text-display" style={{ fontSize: '28px' }}>Configuración</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 'var(--space-xs)' }}>
            Gestiona los modelos de equipos y sus precios.
          </p>
        </div>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <div className="section-header">
            <div className="section-title">
              <Settings size={24} />
              <h3 className="text-headline-md">Modelos de Equipos y Precios</h3>
            </div>
            <button className="btn-primary interactive-element flex-center" style={{ gap: '8px' }} onClick={openAddModal}>
              <Plus size={20} />
              Agregar Modelo
            </button>
          </div>
          
          <div className="models-table-container">
            <table className="models-table">
              <thead>
                <tr>
                  <th>Modelo / Marca</th>
                  <th>Precio (NIO C$)</th>
                  <th>Precio (USD $)</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && models
                  .filter(model => {
                    const term = searchTerm.toLowerCase();
                    if (!term) return true;
                    return model.brand_model?.toLowerCase().includes(term);
                  })
                  .map((model) => (
                    <tr key={model.id}>
                      <td className="text-body-md" style={{ fontWeight: 'bold' }}>{model.brand_model}</td>
                      <td className="text-body-md" style={{ color: 'var(--color-primary)' }}>C$ {Number(model.price_nio || 0).toFixed(2)}</td>
                      <td className="text-body-md" style={{ color: 'var(--color-secondary)' }}>$ {Number(model.price_usd || 0).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                          <button 
                            onClick={() => openEditModal(model)}
                            style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            title="Editar modelo"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteModel(model.id)}
                            style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            title="Eliminar modelo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                
                {!isLoading && models.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                      <DollarSign size={48} style={{ margin: '0 auto var(--space-md)', opacity: 0.5, color: 'var(--color-on-surface-variant)' }} />
                      <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)' }}>No hay modelos registrados.</p>
                    </td>
                  </tr>
                )}
                
                {isLoading && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                      <RefreshCw size={32} className="spinning" style={{ margin: '0 auto var(--space-md)', color: 'var(--color-primary)' }} />
                      <p className="text-body-lg">Cargando modelos...</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-headline-md">{isEditing ? 'Editar Modelo' : 'Agregar Nuevo Modelo'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="text-caption form-label">Marca</label>
                  <input 
                    type="text" 
                    className="text-input text-body-md" 
                    placeholder="Ej. HUAWEI" 
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="text-caption form-label">Modelo</label>
                  <input 
                    type="text" 
                    className="text-input text-body-md" 
                    placeholder="Ej. HW992384-B" 
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="text-caption form-label">Precio en Córdobas (NIO)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">C$</span>
                    <input 
                      type="number" 
                      className="text-input with-prefix text-body-md" 
                      placeholder="0.00" 
                      value={priceNio}
                      onChange={(e) => setPriceNio(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-caption form-label">Precio en Dólares (USD)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input 
                      type="number" 
                      className="text-input with-prefix text-body-md" 
                      placeholder="0.00" 
                      value={priceUsd}
                      onChange={(e) => setPriceUsd(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveModel}>{isEditing ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
