'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface User {
  id: string | number;
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface UserListProps {
  users: User[];
  onUserClick?: (user: User) => void;
}

export function UserList({ users, onUserClick }: UserListProps) {
  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        No users found.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
      {users.map((user, index) => (
        <motion.li
          key={user.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
          onClick={() => onUserClick?.(user)}
        >
          <div className="flex items-center space-x-4">
            <div className="relative h-10 w-10 flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  src={user.avatarUrl}
                  alt={user.name}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.name}
              </p>
              {user.role && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.role}
                </p>
              )}
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
