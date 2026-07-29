'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useUpdateUserMutation } from '@/features/userSlice';
import { useAlert } from '@/context/AlertContext';

export default function EditUserModal({ isOpen, onClose, user }) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'member',
    active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'member',
        active: user.active !== false,
      });
    }
  }, [user]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser({
        id: user._id,
        name: form.name,
        email: form.email,
        role: form.role,
        active: form.active,
      }).unwrap();

      showAlert('success', 'User updated successfully');
      onClose();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not update user');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="user-name" className="block text-sm font-semibold mb-1.5">
            Name
          </label>
          <input
            id="user-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="user-email" className="block text-sm font-semibold mb-1.5">
            Email
          </label>
          <input
            id="user-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="user-role" className="block text-sm font-semibold mb-1.5">
              Role
            </label>
            <select
              id="user-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="user-active" className="block text-sm font-semibold mb-1.5">
              Status
            </label>
            <select
              id="user-active"
              name="active"
              value={form.active ? 'true' : 'false'}
              onChange={e =>
                setForm(prev => ({ ...prev, active: e.target.value === 'true' }))
              }
              className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md py-2.5 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </Modal>
  );
}
