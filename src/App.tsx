import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Personal from './pages/Personal';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <main className="content-area">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory searchTerm={searchTerm} />} />
                  <Route path="/personal" element={<Personal searchTerm={searchTerm} />} />
                  <Route path="/settings" element={<Settings searchTerm={searchTerm} />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
