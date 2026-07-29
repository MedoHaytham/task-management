'use client';

import { useState } from 'react';
import Modal from './Modal';
import { useCreateProjectMutation } from '@/features/projectSlice';
import { useAlert } from '@/context/AlertContext';

export default function CreateProjectModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const { showAlert } = useAlert();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createProject(form).unwrap();
      showAlert('success', 'Project created successfully');
      setForm({ name: '', description: '' });
      onClose();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not create project');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold mb-1.5">
            Project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={handleChange}
            className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold mb-1.5"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={1000}
            value={form.description}
            onChange={handleChange}
            className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md py-2.5 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </Modal>
  );
}
