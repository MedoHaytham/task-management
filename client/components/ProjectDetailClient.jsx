'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Users, Trash2 } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useGetMeQuery } from '@/features/userSlice';
import {
  useGetProjectQuery,
  useDeleteProjectMutation,
} from '@/features/projectSlice';
import { useGetTasksQuery } from '@/features/taskSlice';
import Header from './Header';
import LoadingScreen from './LoadingScreen';
import TaskBoard from './TaskBoard';
import CreateTaskModal from './CreateTaskModal';
import MembersModal from './MembersModal';
import { useAlert } from '@/context/AlertContext';

export default function ProjectDetailClient({ projectId }) {
  const { isReady } = useAuthGuard();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [filters, setFilters] = useState({ priority: '', assignee: '' });

  const { data: meData } = useGetMeQuery();
  const currentUser = meData?.data?.data;

  const {
    data: projectData,
    isLoading: isProjectLoading,
    error: projectError,
  } = useGetProjectQuery(projectId, { skip: !isReady });

  const project = projectData?.data?.data;

  const { data: tasksData, isLoading: isTasksLoading } = useGetTasksQuery(
    { projectId, ...filters },
    { skip: !project }
  );
  const tasks = tasksData?.data?.data ?? [];

  const [deleteProject] = useDeleteProjectMutation();

  if (!isReady || isProjectLoading) return <LoadingScreen />;

  if (projectError) {
    return (
      <>
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-10 text-sm text-error">
          You don&apos;t have access to this project, or it doesn&apos;t
          exist.
        </main>
      </>
    );
  }

  const isOwner = currentUser && project.owner._id === currentUser._id;
  const assignableUsers = [project.owner, ...(project.members || [])];

  const handleDeleteProject = async () => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await deleteProject(project._id).unwrap();
      showAlert('success', 'Project deleted');
      router.push('/projects');
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not delete project');
    }
  };

  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-grey-500 hover:text-grey-700 mb-6"
        >
          <ArrowLeft size={16} />
          Back to projects
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-xl font-bold text-grey-700">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-grey-500 mt-1 max-w-xl">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMembersModalOpen(true)}
              className="flex items-center gap-1.5 border border-grey-200 hover:bg-grey-100 text-grey-600 text-sm font-semibold rounded-md px-3 py-2 transition-colors cursor-pointer"
            >
              <Users size={15} />
              Members
            </button>

            <button
              type="button"
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md px-3 py-2 transition-colors cursor-pointer"
            >
              <Plus size={15} />
              New task
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={handleDeleteProject}
                aria-label="Delete project"
                className="text-grey-400 hover:text-error border border-grey-200 rounded-md p-2 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Filters — PDF requirement: filter by priority / assignee (status is the column grouping itself) */}
        <div className="flex flex-wrap gap-3 mt-6 mb-6">
          <select
            value={filters.priority}
            onChange={e =>
              setFilters(prev => ({ ...prev, priority: e.target.value }))
            }
            className="text-sm border border-grey-200 rounded-md px-3 py-2 text-grey-600 focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={filters.assignee}
            onChange={e =>
              setFilters(prev => ({ ...prev, assignee: e.target.value }))
            }
            className="text-sm border border-grey-200 rounded-md px-3 py-2 text-grey-600 focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">All assignees</option>
            {assignableUsers.map(u => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {isTasksLoading ? (
          <p className="text-sm text-grey-400">Loading tasks…</p>
        ) : (
          <TaskBoard projectId={projectId} project={project} tasks={tasks} />
        )}
      </main>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        project={project}
      />

      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        project={project}
      />
    </>
  );
}
