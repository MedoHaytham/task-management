'use client';

import { Trash2, User, Pencil } from 'lucide-react';

const PRIORITY_STYLES = {
  High: 'bg-red-50 text-error',
  Medium: 'bg-amber-50 text-warning',
  Low: 'bg-grey-100 text-grey-500',
};

const STATUSES = ['To Do', 'In Progress', 'Done'];

export default function TaskCard({ task, onDelete, onStatusChange, onEdit }) {
  return (
    <div className="bg-white rounded-md shadow-card p-4 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-grey-700">{task.title}</p>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              className="text-grey-400 hover:text-primary cursor-pointer p-0.5"
            >
              <Pencil size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            aria-label="Delete task"
            className="text-grey-300 hover:text-error cursor-pointer p-0.5"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-grey-500 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium
          }`}
        >
          {task.priority}
        </span>

        <span className="flex items-center gap-1 text-[11px] text-grey-400">
          <User size={12} />
          {task.assignee?.name || 'Unassigned'}
        </span>
      </div>

      <select
        value={task.status}
        onChange={e => onStatusChange(task._id, e.target.value)}
        className="mt-3 w-full text-xs border border-grey-200 rounded-md px-2 py-1.5 text-grey-600 focus:outline-none focus:border-primary cursor-pointer"
      >
        {STATUSES.map(status => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
