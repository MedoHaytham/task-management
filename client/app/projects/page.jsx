'use client';

import { useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useGetProjectsQuery } from '@/features/projectSlice';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import ProjectCardLoading from '@/components/ProjectCardLoading';
import CreateProjectModal from '@/components/CreateProjectModal';

export default function ProjectsPage() {
  const { isReady } = useAuthGuard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useGetProjectsQuery(undefined, {
    skip: !isReady,
  });
  const projects = data?.data?.data ?? [];

  if (!isReady) return <LoadingScreen />;

  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-grey-700">Your projects</h1>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md px-4 py-2.5 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New project
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ProjectCardLoading />
          </div>
        ) : error ? (
          <p className="text-error text-sm">
            Couldn&apos;t load your projects. Please try again.
          </p>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-grey-400">
            <FolderKanban size={40} className="mb-3" />
            <p className="text-sm">
              No projects yet. Create your first one to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
