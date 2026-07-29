'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useUpdateTaskMutation } from '@/features/taskSlice';
import { useAlert } from '@/context/AlertContext';

export default function EditTaskModal({ isOpen, onClose, task, project }) {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
    assignee: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'To Do',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        assignee: task.assignee?._id || task.assignee || '',
      });
    }
  }, [task]);

  const assignableUsers = project
    ? [project.owner, ...(project.members || [])]
    : [];

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!task || !project) return;

    try {
      const body = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
        assignee: form.assignee || null,
      };

      await updateTask({
        projectId: project._id,
        id: task._id,
        ...body,
      }).unwrap();

      showAlert('success', 'Task updated');
      onClose();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not update task');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-semibold mb-1.5">
            Title
          </label>
          <input
            id="edit-title"
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
            htmlFor="edit-description"
            className="block text-sm font-semibold mb-1.5"
          >
            Description
          </label>
          <textarea
            id="edit-description"
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
              htmlFor="edit-status"
              className="block text-sm font-semibold mb-1.5"
            >
              Status
            </label>
            <select
              id="edit-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-priority"
              className="block text-sm font-semibold mb-1.5"
            >
              Priority
            </label>
            <select
              id="edit-priority"
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="edit-dueDate"
              className="block text-sm font-semibold mb-1.5"
            >
              Due date
            </label>
            <input
              id="edit-dueDate"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className="block w-full rounded-md bg-grey-100 border-2 border-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="edit-assignee"
              className="block text-sm font-semibold mb-1.5"
            >
              Assignee
            </label>
            <select
              id="edit-assignee"
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
