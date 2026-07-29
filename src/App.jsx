import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectList } from './components/ProjectList';
import { Layout } from './components/Layout';

/**
 * Main App Component
 * Sets up routing for the application
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home: Project list */}
        <Route path="/" element={<ProjectList />} />
        
        {/* Project workspace */}
        <Route path="/project/:projectId" element={<Layout />} />
        
        {/* Catch-all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// Made with Bob
