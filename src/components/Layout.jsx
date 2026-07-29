import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { api } from '../api/client';
import { ChatPanel } from './ChatPanel';
import { CanvasPanel } from './CanvasPanel';
import { DetailPanel } from './DetailPanel';

/**
 * Layout Component
 * Main workspace with 3-panel grid: Chat | Canvas | Detail
 */
export function Layout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const project = useProjectStore(state => state.project);
  const setProject = useProjectStore(state => state.setProject);
  const setMessages = useProjectStore(state => state.setMessages);
  const setLoading = useProjectStore(state => state.setLoading);
  const setError = useProjectStore(state => state.setError);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const loadProject = async (id) => {
    setLoading('project', true);
    setError(null);

    try {
      // Load project with canvas
      const projectData = await api.projects.getById(id);
      setProject(projectData);

      // Load chat history
      const messages = await api.chat.getHistory(id);
      setMessages(messages);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err.message || 'Failed to load project');
      
      // Redirect to home if project not found
      if (err.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading('project', false);
    }
  };

  const handleBackToProjects = () => {
    navigate('/');
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToProjects}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="Back to projects"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {project.name}
            </h1>
            <p className="text-xs text-gray-500">
              Status: {project.status}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Distill v1.0
        </div>
      </div>

      {/* 3-panel grid: Chat (25%) | Canvas (40%) | Detail (35%) */}
      <div className="flex-1 grid grid-cols-[25%_40%_35%] overflow-hidden">
        {/* Left panel: Chat */}
        <div className="overflow-hidden">
          <ChatPanel projectId={projectId} />
        </div>

        {/* Center panel: Canvas */}
        <div className="overflow-hidden border-x border-gray-200">
          <CanvasPanel />
        </div>

        {/* Right panel: Detail */}
        <div className="overflow-hidden">
          <DetailPanel />
        </div>
      </div>
    </div>
  );
}

export default Layout;

// Made with Bob
