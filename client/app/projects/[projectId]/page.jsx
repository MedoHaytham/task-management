import ProjectDetailClient from '@/components/ProjectDetailClient';

// Next.js 16: params is a Promise and must be awaited
export default async function ProjectDetailPage({ params }) {
  const { projectId } = await params;

  return <ProjectDetailClient projectId={projectId} />;
}
