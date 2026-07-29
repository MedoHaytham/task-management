'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useUpdateProjectMutation } from '@/features/projectSlice';
import { useAlert } from '@/context/AlertContext';

export default function EditProjectModal({ isOpen, onClose, project }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [updateProject, { isLoading }] = useUpdateProjectMutation();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || '',
        description: project.description || '',
      });
    }
  }, [project]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!project) return;

    try {
      await updateProject({
        id: project._id,
        name: form.name.trim(),
        description: form.description.trim(),
      }).unwrap();
      showAlert('success', 'Project updated successfully');
      onClose();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not update project');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-name" className="block text-sm font-semibold mb-1.5">
            Project name
          </label>
          <input
            id="edit-name"
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
            htmlFor="edit-description"
            className="block text-sm font-semibold mb-1.5"
          >
            Description
          </label>
          <textarea
            id="edit-description"
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
          {isLoading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </Modal>
  );
}
