'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignupMutation } from '@/features/authSlice';
import { useAlert } from '@/context/AlertContext';

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [signup, { isLoading }] = useSignupMutation();
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');

    if (form.password !== form.passwordConfirm) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      await signup(form).unwrap();
      showAlert('success', 'Account created successfully!');
      router.push('/projects');
      router.refresh();
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Signup failed. Please try again.');
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
        <label htmlFor="name" className="block text-sm font-semibold mb-1.5">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={handleChange}
          className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="passwordConfirm"
          className="block text-sm font-semibold mb-1.5"
        >
          Confirm password
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          minLength={8}
          value={form.passwordConfirm}
          onChange={handleChange}
          className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md py-3 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-grey-500">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold">
          Log in
        </Link>
      </p>
    </form>
  );
}
