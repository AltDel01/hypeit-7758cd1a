
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { ImageRequest, RequestStatus } from '@/types/imageRequest';

interface StatusBadgeProps {
  status: RequestStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
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

interface RequestListProps {
  requests: ImageRequest[];
  selectedRequest: ImageRequest | null;
  onSelectRequest: (request: ImageRequest) => void;
  onUpdateStatus: (id: string, status: RequestStatus) => void;
  formatDate: (date: string) => string;
}

const RequestList = ({
  requests,
  selectedRequest,
  onSelectRequest,
  onUpdateStatus,
  formatDate
}: RequestListProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead>Aspect Ratio</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                No requests found
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow 
                key={request.id} 
                className={`cursor-pointer ${selectedRequest?.id === request.id ? 'bg-gray-800/50' : ''}`}
                onClick={() => onSelectRequest(request)}
              >
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.userName}</TableCell>
                <TableCell className="max-w-xs truncate">{request.prompt}</TableCell>
                <TableCell>{request.aspectRatio}</TableCell>
                <TableCell><StatusBadge status={request.status} /></TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    {request.status === 'new' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onUpdateStatus(request.id, 'in-progress')}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestList;
