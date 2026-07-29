'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Shield,
  User,
  Trash2,
  Edit3,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  useGetMeQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/features/userSlice';
import Header from './Header';
import LoadingScreen from './LoadingScreen';
import EditUserModal from './EditUserModal';
import { useAlert } from '@/context/AlertContext';

export default function AdminUsersClient() {
  const { isReady } = useAuthGuard();
  const { showAlert } = useAlert();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const { data: meData } = useGetMeQuery();
  const currentUser = meData?.data?.data;

  const { data: usersData, isLoading, isError } = useGetUsersQuery(
    { search: search.trim() },
    { skip: !isReady || currentUser?.role !== 'admin' }
  );

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const rawUsers = usersData?.data?.data ?? [];

  const filteredUsers = rawUsers.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  if (!isReady) return <LoadingScreen />;

  if (currentUser && currentUser.role !== 'admin') {
    return (
      <>
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-12 text-center">
          <div className="bg-red-50 text-error rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-2">Access Denied</h2>
            <p className="text-sm mb-4">
              You must be an administrator to access the User Management panel.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              <ArrowLeft size={14} />
              Return to Projects
            </Link>
          </div>
        </main>
      </>
    );
  }

  const handleRoleToggle = async user => {
    if (user._id === currentUser._id) {
      showAlert('error', 'You cannot change your own admin role');
      return;
    }
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    try {
      await updateUser({ id: user._id, role: newRole }).unwrap();
      showAlert('success', `Updated ${user.name}'s role to ${newRole}`);
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async user => {
    if (user._id === currentUser._id) {
      showAlert('error', 'You cannot deactivate your own account');
      return;
    }
    const newStatus = user.active === false;
    try {
      await updateUser({ id: user._id, active: newStatus }).unwrap();
      showAlert(
        'success',
        `${user.name} is now ${newStatus ? 'Active' : 'Inactive'}`
      );
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async user => {
    if (user._id === currentUser._id) {
      showAlert('error', 'You cannot delete your own account');
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      return;
    }
    try {
      await deleteUser(user._id).unwrap();
      showAlert('success', 'User deleted successfully');
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not delete user');
    }
  };

  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="text-primary" size={22} />
              <h1 className="text-xl font-bold text-grey-700">
                User Management
              </h1>
            </div>
            <p className="text-sm text-grey-500 mt-1">
              Manage accounts, assign admin roles, and update active statuses.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-grey-500 hover:text-grey-700 border border-grey-200 rounded-md px-3 py-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
        </div>

        {/* Search & Filter toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-grey-200 mb-6 shadow-sm">
          <div className="relative flex-1 min-w-55">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400"
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-sm bg-grey-100 rounded-md pl-9 pr-3 py-2 text-grey-700 focus:outline-none focus:border-primary border border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-sm border border-grey-200 rounded-md px-3 py-2 text-grey-600 focus:outline-none focus:border-primary cursor-pointer bg-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        {isLoading ? (
          <p className="text-sm text-grey-400 py-6">Loading users…</p>
        ) : isError ? (
          <p className="text-sm text-error py-6">
            Failed to load users list. Please try again.
          </p>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg border border-grey-200 text-center py-12 px-4">
            <User className="mx-auto text-grey-300 mb-2" size={32} />
            <p className="text-sm text-grey-500 font-semibold">No users found</p>
            <p className="text-xs text-grey-400 mt-1">
              Try adjusting your search query or role filter.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-grey-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-grey-100 border-b border-grey-200 text-xs font-semibold text-grey-600 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-200 text-sm text-grey-700">
                  {filteredUsers.map(u => {
                    const isSelf = u._id === currentUser?._id;
                    const isActive = u.active !== false;

                    return (
                      <tr
                        key={u._id}
                        className="hover:bg-grey-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="ml-2 text-[10px] bg-grey-200 text-grey-600 px-1.5 py-0.5 rounded font-normal">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-grey-500">{u.email}</td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleRoleToggle(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot edit own role' : 'Click to toggle role'}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                : 'bg-grey-100 text-grey-600 border-grey-200 hover:bg-grey-200'
                            }`}
                          >
                            <Shield size={12} />
                            {u.role === 'admin' ? 'Admin' : 'Member'}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot deactivate yourself' : 'Click to toggle status'}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-error border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 size={12} />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={12} />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingUser(u)}
                              aria-label="Edit user"
                              className="text-grey-400 hover:text-primary p-1.5 rounded-md hover:bg-grey-100 transition-colors cursor-pointer"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(u)}
                              disabled={isSelf}
                              aria-label="Delete user"
                              className="text-grey-300 hover:text-error p-1.5 rounded-md hover:bg-grey-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />
    </>
  );
}
