import AdminUsersClient from '@/components/AdminUsersClient';

export const metadata = {
  title: 'User Management - Task Board',
  description: 'Manage users, assign admin roles, and update user status.',
};

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
