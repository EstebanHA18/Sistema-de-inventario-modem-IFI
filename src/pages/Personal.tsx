import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, X, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Personal.css';

interface Person {
  id: string;
  name: string;
  role: string;
  zone: string;
  status: string;
}

interface PersonalProps {
  searchTerm?: string;
}

const Personal: React.FC<PersonalProps> = ({ searchTerm = '' }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newZone, setNewZone] = useState('Zona Occidente');

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching personnel:', error);
    } else {
      setPeople(data || []);
    }
    setIsLoading(false);
  };

  const handleAddPerson = async () => {
    if (newName.trim() === '') return;
    
    const { error } = await supabase
      .from('personnel')
      .insert([
        { 
          name: newName, 
          role: newRole || 'Colaborador',
          zone: newZone || 'General' 
        }
      ]);

    if (error) {
      console.error('Error adding person:', error);
      alert('Error al agregar persona');
    } else {
      setNewName('');
      setNewRole('');
      setNewZone('');
      setIsModalOpen(false);
      fetchPersonnel();
    }
  };

  const handleRemovePerson = async (id: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar a esta persona?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing person:', error);
      alert('Error al eliminar persona');
    } else {
      fetchPersonnel();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="assignments-page">
      <div className="page-header">
        <div>
          <h2 className="text-display" style={{ fontSize: '28px' }}>Gestión de Personal</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 'var(--space-xs)' }}>
            Administra los supervisores y personal disponible para asignar equipos.
          </p>
        </div>
        <button className="btn-primary interactive-element flex-center" style={{ gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Agregar Persona
        </button>
      </div>

      <div className="people-list">
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-on-surface-variant)' }}>
            <RefreshCw size={48} className="spinning" style={{ margin: '0 auto var(--space-md)', opacity: 0.5 }} />
            <p className="text-body-lg">Cargando personal...</p>
          </div>
        ) : (
          <>
            {people
              .filter(person => {
                const term = searchTerm.toLowerCase();
                if (!term) return true;
                return (
                  person.name?.toLowerCase().includes(term) ||
                  person.role?.toLowerCase().includes(term) ||
                  person.zone?.toLowerCase().includes(term)
                );
              })
              .map(person => (
              <div key={person.id} className="person-card interactive-card">
                <div className="person-info">
                  <div className="person-avatar">
                    {getInitials(person.name)}
                  </div>
                  <div>
                    <p className="text-headline-md" style={{ fontSize: '16px' }}>{person.name}</p>
                    <p className="text-caption" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {person.role} • {person.zone}
                    </p>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => handleRemovePerson(person.id)} title="Eliminar">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            
            {people.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-on-surface-variant)' }}>
                <UserCheck size={48} style={{ margin: '0 auto var(--space-md)', opacity: 0.5 }} />
                <p className="text-body-lg">No hay personal registrado en la base de datos.</p>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-headline-md">Agregar Nueva Persona</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="text-caption form-label">Nombre Completo</label>
                <input 
                  type="text" 
                  className="text-input text-body-md" 
                  placeholder="Ej. Juan Pérez" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="text-caption form-label">Cargo / Rol (Opcional)</label>
                <input 
                  type="text" 
                  className="text-input text-body-md" 
                  placeholder="Ej. Supervisor" 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-caption form-label">Zona de Operación</label>
                <select 
                  className="text-input text-body-md" 
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Zona Occidente">Zona Occidente</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAddPerson}>Guardar Persona</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;
