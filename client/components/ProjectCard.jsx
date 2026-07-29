import Link from 'next/link';
import { Users } from 'lucide-react';

export default function ProjectCard({ project }) {
  const memberCount = (project.members?.length ?? 0) + 1; // +1 for the owner

  return (
    <Link
      href={`/projects/${project._id}`}
      className="block bg-white rounded-lg shadow-card p-5 hover:-translate-y-0.5 transition-transform"
    >
      <h3 className="font-bold text-grey-700 mb-1 truncate">
        {project.name}
      </h3>
      <p className="text-sm text-grey-500 line-clamp-2 mb-4 min-h-10">
        {project.description || 'No description'}
      </p>
      <div className="flex items-center gap-1.5 text-xs text-grey-400">
        <Users size={14} />
        {memberCount} {memberCount === 1 ? 'member' : 'members'}
      </div>
    </Link>
  );
}
