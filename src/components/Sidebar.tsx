import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, UserCheck, Settings, HelpCircle, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1 className="text-headline-lg brand-title">Sistema de Inventario</h1>
        <p className="text-caption brand-subtitle">Modem Back Office</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item interactive-element ${isActive ? 'active' : ''}`}>
          <LayoutDashboard className="nav-icon" size={20} />
          <span className="text-body-md">Inicio</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-item interactive-element ${isActive ? 'active' : ''}`}>
          <Box className="nav-icon" size={20} />
          <span className="text-body-md">Inventario</span>
        </NavLink>
        <NavLink to="/personal" className={({ isActive }) => `nav-item interactive-element ${isActive ? 'active' : ''}`}>
          <UserCheck className="nav-icon" size={20} />
          <span className="text-body-md">Personal</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item interactive-element ${isActive ? 'active' : ''}`}>
          <Settings className="nav-icon" size={20} />
          <span className="text-body-md">Configuración</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-action interactive-element">
          <HelpCircle className="nav-icon" size={20} />
          <span className="text-body-md">Soporte</span>
        </div>
        <div className="footer-action interactive-element">
          <LogOut className="nav-icon" size={20} />
          <span className="text-body-md">Cerrar Sesión</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
