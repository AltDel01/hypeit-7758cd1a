import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { parsePromptString } from '@/utils/promptParser';
import { FEATURE_MODE_MAP } from '@/config/featureModes';
import type { GenerationRequest } from '@/services/generationRequestService';

interface RequestListProps {
  requests: GenerationRequest[];
  selectedRequest: GenerationRequest | null;
  onSelectRequest: (request: GenerationRequest) => void;
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

  const getFeatureConfig = (featureLabel: string) => {
    return Object.values(FEATURE_MODE_MAP).find(
      c => c.label.toLowerCase() === featureLabel.toLowerCase()
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Function</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead>Attachment</TableHead>
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
            requests.map((request) => {
              const parsed = parsePromptString(request.prompt);
              return (
                <TableRow 
                  key={request.id} 
                  className={`cursor-pointer ${selectedRequest?.id === request.id ? 'bg-gray-800/50' : ''}`}
                  onClick={() => onSelectRequest(request)}
                >
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{request.user_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{request.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parsed.features.length > 0 ? (
                        parsed.features.map((f) => {
                          const config = getFeatureConfig(f);
                          return (
                            <span
                              key={f}
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                              style={{
                                background: config
                                  ? `linear-gradient(135deg, ${config.colorFrom}, ${config.colorTo})`
                                  : '#6b7280',
                              }}
                            >
                              {f}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {parsed.prompt}
                  </TableCell>
                  <TableCell>
                    {request.reference_image_url ? (
                      <img
                        src={request.reference_image_url}
                        alt="Ref"
                        className="w-10 h-10 rounded object-cover border border-gray-700"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">None</span>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={request.status} /></TableCell>
                  <TableCell className="text-xs">{formatDate(request.created_at)}</TableCell>
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
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
