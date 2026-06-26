import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, X } from 'lucide-react';
import './Assignments.css';

interface Person {
  id: string;
  name: string;
  role: string;
}

const Assignments: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Roberto Jimenez', role: 'Técnico Terreno' },
    { id: '2', name: 'María Fernanda Ruiz', role: 'Instaladora' },
    { id: '3', name: 'Daniel Castro', role: 'Soporte Nivel 2' },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleAddPerson = () => {
    if (newName.trim() === '') return;
    const newPerson: Person = {
      id: Date.now().toString(),
      name: newName,
      role: newRole || 'Colaborador',
    };
    setPeople([...people, newPerson]);
    setNewName('');
    setNewRole('');
    setIsModalOpen(false);
  };

  const handleRemovePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="assignments-page">
      <div className="page-header">
        <div>
          <h2 className="text-display" style={{ fontSize: '28px' }}>Gestión de Asignaciones</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 'var(--space-xs)' }}>
            Administra las personas disponibles para asignar equipos.
          </p>
        </div>
        <button className="btn-primary interactive-element flex-center" style={{ gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Agregar Persona
        </button>
      </div>

      <div className="people-list">
        {people.map(person => (
          <div key={person.id} className="person-card interactive-card">
            <div className="person-info">
              <div className="person-avatar">
                {getInitials(person.name)}
              </div>
              <div>
                <p className="text-headline-md" style={{ fontSize: '16px' }}>{person.name}</p>
                <p className="text-caption" style={{ color: 'var(--color-on-surface-variant)' }}>{person.role}</p>
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
            <p className="text-body-lg">No hay personas registradas.</p>
          </div>
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
                  placeholder="Ej. Técnico Terreno" 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                />
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

export default Assignments;
