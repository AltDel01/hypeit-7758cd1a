import React from 'react';
import { Clock } from 'lucide-react';

interface EditorSlaBadgeProps {
  assignedAt: string | null;
  status: string;
  assignedTo: string | null;
}

export const EditorSlaBadge = ({ assignedAt, status, assignedTo }: EditorSlaBadgeProps) => {
  if (!assignedAt || !assignedTo || status === 'completed' || status === 'failed') {
    return null;
  }

  const minutesSinceAssigned = (Date.now() - new Date(assignedAt).getTime()) / 60000;

  if (minutesSinceAssigned >= 15) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 animate-pulse">
        <Clock className="w-3 h-3 mr-1" />
        {Math.round(minutesSinceAssigned)}m
      </span>
    );
  }

  if (minutesSinceAssigned >= 10) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        <Clock className="w-3 h-3 mr-1" />
        {Math.round(minutesSinceAssigned)}m
      </span>
    );
  }

  if (minutesSinceAssigned >= 5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
        <Clock className="w-3 h-3 mr-1" />
        {Math.round(minutesSinceAssigned)}m
      </span>
    );
  }

  return null;
};
