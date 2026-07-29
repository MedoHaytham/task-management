import GuestGuard from '@/components/GuestGuard';
import LoginForm from '@/components/LoginForm';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-8 text-grey-700">Log in</h1>
        <LoginForm />
      </main>
    </GuestGuard>
  );
}
