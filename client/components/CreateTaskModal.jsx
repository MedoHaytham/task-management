'use client';

import { useState } from 'react';
import Modal from './Modal';
import { useCreateTaskMutation } from '@/features/taskSlice';
import { useAlert } from '@/context/AlertContext';

export default function CreateTaskModal({ isOpen, onClose, project }) {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
  });

  // Anyone who can be assigned a task must be the owner or a member
  const assignableUsers = project
    ? [project.owner, ...(project.members || [])]
    : [];

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const body = { ...form };
      if (!body.assignee) delete body.assignee;
      if (!body.dueDate) delete body.dueDate;

      await createTask({ projectId: project._id, ...body }).unwrap();
      showAlert('success', 'Task created');
      setForm({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        assignee: '',
      });
      onClose();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not create task');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold mb-1.5">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={150}
            value={form.title}
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
            rows={2}
            maxLength={2000}
            value={form.description}
            onChange={handleChange}
            className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-semibold mb-1.5"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-semibold mb-1.5"
            >
              Due date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="assignee"
            className="block text-sm font-semibold mb-1.5"
          >
            Assignee
          </label>
          <select
            id="assignee"
            name="assignee"
            value={form.assignee}
            onChange={handleChange}
            className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Unassigned</option>
            {assignableUsers.map(u => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md py-2.5 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? 'Creating…' : 'Create task'}
        </button>
      </form>
    </Modal>
  );
}
