import GuestGuard from '@/components/GuestGuard';
import RegisterForm from '@/components/RegisterForm';

export const metadata = { title: 'Sign up' };

export default function RegisterPage() {
  return (
    <GuestGuard>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-8 text-grey-700">
          Create an account
        </h1>
        <RegisterForm />
      </main>
    </GuestGuard>
  );
}
