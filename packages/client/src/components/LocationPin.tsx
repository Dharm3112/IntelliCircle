'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LocationPinProps {
  label?: string;
  color?: string;
  onClick?: () => void;
}

export function LocationPin({ label, color = '#6366F1', onClick }: LocationPinProps) {
  return (
    <motion.div
      className="relative flex flex-col items-center group cursor-pointer"
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="absolute -top-8 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs font-semibold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {label || 'Location'}
      </div>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
        />
      </svg>
      <div className="w-4 h-1 bg-black/20 blur-[2px] rounded-full mt-1 group-hover:w-3 group-hover:bg-black/30 transition-all duration-300" />
    </motion.div>
  );
}
