'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutGrid, Shield } from 'lucide-react';
import { useGetMeQuery } from '@/features/userSlice';
import { useLogoutMutation } from '@/features/authSlice';
import { useAlert } from '@/context/AlertContext';

export default function Header() {
  const { data } = useGetMeQuery();
  const user = data?.data?.data ?? null;
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      showAlert('success', 'Logged out successfully');
      router.push('/login');
    } catch {
      showAlert('error', 'Could not log out. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <header className="border-b border-grey-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/projects"
            className="flex items-center gap-2 font-bold text-grey-700"
          >
            <LayoutGrid size={20} className="text-primary" />
            Task Board
          </Link>

          {user.role === 'admin' && (
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full transition-colors"
            >
              <Shield size={14} />
              Admin Users
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-grey-500 hidden sm:inline">
            {user.name}{' '}
            {user.role === 'admin' && (
              <span className="ml-1 text-xs font-semibold text-primary uppercase">
                Admin
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-grey-500 hover:text-error transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
