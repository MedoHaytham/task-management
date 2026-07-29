'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useLoginMutation } from '@/features/authSlice';
import { useAlert } from '@/context/AlertContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login({ email, password }).unwrap();
      showAlert('success', 'Logged in successfully!');
      router.push('/projects');
      router.refresh();
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Could not log in. Try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-error px-4 py-3 text-error rounded-sm text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:border-primary placeholder:text-grey-400"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:border-primary placeholder:text-grey-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600"
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md py-3 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? 'Logging in…' : 'Log in'}
      </button>

      <p className="text-center text-sm text-grey-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-semibold">
          Sign up
        </Link>
      </p>
    </form>
  );
}
