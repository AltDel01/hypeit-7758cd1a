
import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { RequestStatus } from '@/services/requests';

interface StatusBadgeProps {
  status: RequestStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'new':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          New
        </span>
      );
    case 'in-progress':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    default:
      return null;
  }
};
