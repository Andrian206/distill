import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

/**
 * ProjectList Component
 * Displays list of projects with create/delete actions
 */
export function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.projects.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const project = await api.projects.create(newProjectName.trim());
      setNewProjectName('');
      
      // Navigate to the new project
      navigate(`/project/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err.message || 'Failed to create project');
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.projects.delete(projectId);
      // Reload projects list
      loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleOpenProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎨 Distill
          </h1>
          <p className="text-gray-600">
            AI Creative Reasoning Companion — From Ambiguity to Action
          </p>
        </div>

        {/* Create new project */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Start New Discovery
          </h2>
          <form onSubmit={handleCreateProject} className="flex gap-3">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
              disabled={creating}
            />
            <button
              type="submit"
              disabled={!newProjectName.trim() || creating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Projects list */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Projects
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No projects yet</p>
              <p className="text-sm">Create your first project to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => handleOpenProject(project.id)}
                  onDelete={() => handleDeleteProject(project.id, project.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Gemini AI • Built with React & Express</p>
        </div>
      </div>
    </div>
  );
}

/**
 * ProjectCard Component
 */
function ProjectCard({ project, onOpen, onDelete }) {
  const statusColors = {
    discovering: 'bg-blue-100 text-blue-700',
    distilling: 'bg-yellow-100 text-yellow-700',
    validating: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
  };

  const statusColor = statusColors[project.status] || statusColors.discovering;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 cursor-pointer" onClick={onOpen}>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {project.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
              {project.status}
            </span>
            <span>
              Created {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 transition-colors ml-4"
          title="Delete project"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default ProjectList;

// Made with Bob
