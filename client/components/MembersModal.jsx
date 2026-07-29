'use client';

import { useState } from 'react';
import { UserMinus } from 'lucide-react';
import Modal from './Modal';
import {
  useGetMeQuery,
  useLazyLookupUserByEmailQuery,
} from '@/features/userSlice';
import {
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
} from '@/features/projectSlice';
import { useAlert } from '@/context/AlertContext';

export default function MembersModal({ isOpen, onClose, project }) {
  const [email, setEmail] = useState('');
  const { data: meData } = useGetMeQuery();
  const currentUser = meData?.data?.data;

  const [lookupUserByEmail, { isFetching: isLookingUp }] =
    useLazyLookupUserByEmailQuery();
  const [addMember, { isLoading: isAdding }] = useAddProjectMemberMutation();
  const [removeMember] = useRemoveProjectMemberMutation();
  const { showAlert } = useAlert();

  if (!project) return null;

  const isOwner = currentUser && project.owner._id === currentUser._id;

  const handleAdd = async e => {
    e.preventDefault();
    try {
      const { data, error } = await lookupUserByEmail(email);
      if (error) {
        showAlert('error', error?.data?.message || 'User not found');
        return;
      }

      await addMember({
        projectId: project._id,
        userId: data.data.data._id,
      }).unwrap();

      showAlert('success', 'Member added');
      setEmail('');
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not add member');
    }
  };

  const handleRemove = async userId => {
    try {
      await removeMember({ projectId: project._id, userId }).unwrap();
      showAlert('success', 'Member removed');
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not remove member');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project members">
      <ul className="space-y-2 mb-5 max-h-56 overflow-y-auto">
        <li className="flex items-center justify-between text-sm py-1.5">
          <span>
            {project.owner.name}{' '}
            <span className="text-xs text-primary font-semibold">Owner</span>
          </span>
        </li>
        {(project.members || []).map(member => (
          <li
            key={member._id}
            className="flex items-center justify-between text-sm py-1.5"
          >
            <span>{member.name}</span>
            {isOwner && (
              <button
                type="button"
                onClick={() => handleRemove(member._id)}
                aria-label="Remove member"
                className="text-grey-300 hover:text-error cursor-pointer"
              >
                <UserMinus size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="member@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 rounded-md bg-grey-100 border-2 border-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isLookingUp || isAdding}
            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md px-4 disabled:opacity-60 cursor-pointer"
          >
            Add
          </button>
        </form>
      )}
    </Modal>
  );
}
