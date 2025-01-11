import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Search, Loader2, Building2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  collaborators: { count: number }[];
  organization?: Organization;
}

export function Projects() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    organization_id: null as string | null 
  });
  const [newOrg, setNewOrg] = useState({ name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }

      const [orgsResponse, projectsResponse] = await Promise.all([
        supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', session.user.id),
        supabase
          .from('projects')
          .select(`
            *,
            collaborators:project_members(count),
            organization:organizations(*)
          `)
          .eq('owner_id', session.user.id)
      ]);

      if (orgsResponse.error) throw orgsResponse.error;
      if (projectsResponse.error) throw projectsResponse.error;

      setOrganizations(orgsResponse.data || []);
      setProjects(projectsResponse.data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load projects and organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: newOrg.name,
          description: newOrg.description,
          owner_id: session.user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setOrganizations([...organizations, data]);
      setIsCreatingOrg(false);
      setNewOrg({ name: '', description: '' });
      
      await fetchData();
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to create organization');
    }
  };

  const handleCreateProject = async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newProject.name,
          description: newProject.description,
          owner_id: session.user.id,
          organization_id: newProject.organization_id
        }])
        .select(`
          *,
          collaborators:project_members(count),
          organization:organizations(*)
        `)
        .single();

      if (error) throw error;

      setProjects([...projects, data]);
      setIsCreatingProject(false);
      setNewProject({ name: '', description: '', organization_id: null });
      
      await fetchData();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.organization?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Projects</h1>
            <p className="text-gray-400 mt-1">Manage your projects and organizations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCreatingOrg(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Building2 className="w-5 h-5" />
              New Organization
            </button>
            <button
              onClick={() => setIsCreatingProject(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects and organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-8">
            {organizations.map(org => {
              const orgProjects = filteredProjects.filter(p => p.organization_id === org.id);
              if (orgProjects.length === 0) return null;
              
              return (
                <div key={org.id} className="space-y-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-500" />
                    {org.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orgProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} onSelect={() => navigate(`/editor/${project.id}`)} />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Personal Projects */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Personal Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects
                  .filter(p => !p.organization_id)
                  .map((project) => (
                    <ProjectCard key={project.id} project={project} onSelect={() => navigate(`/editor/${project.id}`)} />
                  ))}
              </div>
            </div>
          </div>
        ) : !searchQuery ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <h3 className="text-xl font-medium text-gray-300 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Create your first project or organization to get started</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsCreatingOrg(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Building2 className="w-5 h-5" />
                Create Organization
              </button>
              <button
                onClick={() => setIsCreatingProject(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Project
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <p className="text-gray-400">No projects found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Create Organization Modal */}
        {isCreatingOrg && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Organization</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-gray-300">
                    Organization Name
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="My Organization"
                  />
                </div>
                <div>
                  <label htmlFor="orgDescription" className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="orgDescription"
                    value={newOrg.description}
                    onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your organization..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsCreatingOrg(false)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateOrganization}
                    disabled={!newOrg.name}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Organization
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        {isCreatingProject && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-300">
                    Organization (Optional)
                  </label>
                  <select
                    id="organization"
                    value={newProject.organization_id || ''}
                    onChange={(e) => setNewProject({ ...newProject, organization_id: e.target.value || null })}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Personal Project</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Project Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your project..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsCreatingProject(false)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProject.name}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, onSelect }: { project: Project; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className="group bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10"
    >
      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
        {project.name}
      </h3>
      <p className="text-gray-400 mb-4 line-clamp-2">{project.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{new Date(project.created_at).toLocaleDateString()}</span>
        <span>{project.collaborators[0]?.count || 0} collaborators</span>
      </div>
    </div>
  );
}