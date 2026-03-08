import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, UserCheck, UserPlus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { parsePromptString } from '@/utils/promptParser';
import { FEATURE_MODE_MAP } from '@/config/featureModes';
import type { GenerationRequest } from '@/services/generationRequestService';

interface RequestListProps {
  requests: GenerationRequest[];
  onOpenRequest: (id: string) => void;
  onClaimAndOpenRequest: (id: string) => void;
  currentUserId?: string;
}

export const RequestList = ({
  requests,
  onOpenRequest,
  onClaimAndOpenRequest,
  currentUserId,
}: RequestListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getFeatureConfig = (featureLabel: string) => {
    return Object.values(FEATURE_MODE_MAP).find(
      (c) => c.label.toLowerCase() === featureLabel.toLowerCase()
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <Table className="min-w-[1120px]">
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
                <TableRow key={request.id} className={isClaimedByMe ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium font-mono">
                        USR-{request.user_id.substring(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        User #{request.user_id.substring(0, 6).toUpperCase()}
                      </p>
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
                  <TableCell className="max-w-[260px] truncate text-sm">{parsed.prompt}</TableCell>
                  <TableCell>
                    {request.reference_image_url ? (
                      <img
                        src={request.reference_image_url}
                        alt="Reference attachment"
                        className="w-10 h-10 rounded object-cover border border-border"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    {isClaimed ? (
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-primary" />
                        <span className={`text-xs font-medium ${isClaimedByMe ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isClaimedByMe ? 'You' : request.assigned_to_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(request.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {request.status === 'new' && !isClaimed ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onClaimAndOpenRequest(request.id)}
                          className="gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Claim & Open
                        </Button>
                      ) : request.status === 'new' && isClaimed && !isClaimedByMe ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onClaimAndOpenRequest(request.id)}
                          className="gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Reassign & Open
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => onOpenRequest(request.id)} className="gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
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
