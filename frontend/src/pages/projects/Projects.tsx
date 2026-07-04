import { motion } from 'framer-motion';
import { Plus, FolderKanban, MoreVertical, Edit, Trash2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusChip, getStatusVariant, EmptyState, ListSkeleton } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const handleCreate = () => {
    const name = prompt('Enter project name:');
    if (!name) return;
    const desc = prompt('Enter project description (optional):') || '';
    createProject.mutate({ name, description: desc });
  };

  const handleEdit = (id: string, currentName: string, currentDesc: string) => {
    const newName = prompt('Edit project name:', currentName);
    if (newName === null) return;
    const newDesc = prompt('Edit project description:', currentDesc) || '';
    updateProject.mutate({ id, data: { name: newName, description: newDesc } });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateProject.mutate({ id, data: { status: nextStatus } });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete project "${name}"?`)) {
      deleteProject.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-description">Manage your distributed job projects</p>
          </div>
        </div>
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="page-container select-none">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item} className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title font-display">Projects</h1>
            <p className="page-description">Manage your distributed job projects</p>
          </div>
          <Button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </motion.div>

        {projects?.data.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start managing distributed jobs."
            action={{ label: 'Create Project', onClick: handleCreate }}
          />
        ) : (
          <motion.div
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects?.data.map((project) => (
              <motion.div
                key={project.id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                className="glass-card glass-hover rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#163177]/10 flex items-center justify-center text-[#6C63FF]">
                          <FolderKanban className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-cronix-text font-display">{project.name}</h3>
                          <StatusChip
                            status={project.status}
                            variant={getStatusVariant(project.status)}
                          />
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-[#163177]/10 rounded-xl">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-card border-none p-1 rounded-2xl min-w-[140px] shadow-extruded">
                          <DropdownMenuItem
                            onClick={() => handleEdit(project.id, project.name, project.description || '')}
                            className="cursor-pointer rounded-xl font-semibold"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(project.id, project.status)}
                            className="cursor-pointer rounded-xl font-semibold"
                          >
                            {project.status === 'active' ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(project.id, project.name)}
                            className="cursor-pointer text-coral rounded-xl font-semibold hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-cronix-secondary font-medium mb-4 line-clamp-2">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#163177]/10">
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-[#38B2AC] font-display">{project.queueCount}</p>
                      <p className="text-[10px] uppercase font-bold text-cronix-secondary mt-0.5">Queues</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-cronix-text font-display">{project.jobCount}</p>
                      <p className="text-[10px] uppercase font-bold text-cronix-secondary mt-0.5">Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-[#6C63FF] font-display">{project.workerCount}</p>
                      <p className="text-[10px] uppercase font-bold text-cronix-secondary mt-0.5">Workers</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-[#163177]/5 border-t border-[#163177]/10">
                  <p className="text-[10px] uppercase font-bold text-cronix-secondary tracking-wider">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
