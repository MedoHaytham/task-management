'use client';

import { useState } from 'react';
import TaskCard from './TaskCard';
import EditTaskModal from './EditTaskModal';
import { useUpdateTaskMutation, useDeleteTaskMutation } from '@/features/taskSlice';
import { useAlert } from '@/context/AlertContext';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

export default function TaskBoard({ projectId, project, tasks }) {
  const [editingTask, setEditingTask] = useState(null);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { showAlert } = useAlert();

  const activeProjectId = projectId || project?._id;

  const handleStatusChange = async (id, status) => {
    try {
      await updateTask({ projectId: activeProjectId, id, status }).unwrap();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not update task');
    }
  };

  const handleDelete = async id => {
    try {
      await deleteTask({ projectId: activeProjectId, id }).unwrap();
      showAlert('success', 'Task deleted');
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not delete task');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map(status => {
          const columnTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className="bg-grey-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-grey-600">{status}</h3>
                <span className="text-xs text-grey-400 bg-white rounded-full px-2 py-0.5">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-16">
                {columnTasks.length === 0 ? (
                  <p className="text-xs text-grey-400 text-center py-6">
                    No tasks
                  </p>
                ) : (
                  columnTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      onEdit={setEditingTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        project={project}
      />
    </>
  );
}
