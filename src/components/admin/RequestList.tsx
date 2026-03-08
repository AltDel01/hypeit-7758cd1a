import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserCheck, UserPlus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { parsePromptString } from '@/utils/promptParser';
import { FEATURE_MODE_MAP } from '@/config/featureModes';
import type { GenerationRequest } from '@/services/generationRequestService';

interface RequestListProps {
  requests: GenerationRequest[];
  selectedRequest: GenerationRequest | null;
  onSelectRequest: (request: GenerationRequest) => void;
  onUpdateStatus: (id: string, status: 'in-progress') => void;
  onClaimRequest: (id: string) => void;
  currentUserId?: string;
}

export const RequestList = ({ 
  requests, 
  selectedRequest, 
  onSelectRequest, 
  onUpdateStatus,
  onClaimRequest,
  currentUserId
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
            <TableHead>Editor</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No requests found
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => {
              const parsed = parsePromptString(request.prompt);
              const isClaimedByMe = request.assigned_to === currentUserId;
              const isClaimed = !!request.assigned_to;
              
              return (
                <TableRow 
                  key={request.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedRequest?.id === request.id 
                      ? 'bg-accent/20' 
                      : isClaimedByMe 
                        ? 'bg-primary/5' 
                        : ''
                  }`}
                  onClick={() => onSelectRequest(request)}
                >
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{request.user_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{request.user_email}</p>
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
                        <span className="text-muted-foreground text-xs">—</span>
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
                        className="w-10 h-10 rounded object-cover border border-border"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">None</span>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={request.status} /></TableCell>
                  <TableCell>
                    {isClaimed ? (
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-green-500" />
                        <span className={`text-xs font-medium ${isClaimedByMe ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {isClaimedByMe ? 'You' : request.assigned_to_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(request.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {request.status === 'new' && !isClaimed && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onClaimRequest(request.id)}
                          className="gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Claim
                        </Button>
                      )}
                      {request.status === 'new' && isClaimed && !isClaimedByMe && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onClaimRequest(request.id)}
                          className="gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Reassign
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
