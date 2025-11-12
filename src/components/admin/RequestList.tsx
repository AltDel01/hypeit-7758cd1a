
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { ImageRequest } from '@/services/requests';

interface RequestListProps {
  requests: ImageRequest[];
  selectedRequest: ImageRequest | null;
  onSelectRequest: (request: ImageRequest) => void;
  onUpdateStatus: (id: string, status: 'in-progress') => void;
}

export const RequestList = ({ 
  requests, 
  selectedRequest, 
  onSelectRequest, 
  onUpdateStatus 
}: RequestListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
