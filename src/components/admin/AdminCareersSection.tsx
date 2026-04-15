import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Phone, FileText, ExternalLink, Calendar, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Application {
  id: string;
  full_name: string;
  phone: string;
  position: string;
  application_type: string;
  cv_url: string | null;
  portfolio_url: string | null;
  cover_letter: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  reviewed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  shortlisted: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const AdminCareersSection = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('career_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setApplications(data as Application[]);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('career_applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    } else {
      toast({ title: `Status updated to ${status}` });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const downloadCV = async (cvUrl: string) => {
    const path = cvUrl.replace('storage:career-applications/', '');
    const { data, error } = await supabase.storage
      .from('career-applications')
      .createSignedUrl(path, 300);

    if (error || !data?.signedUrl) {
      toast({ title: 'Could not generate download link', variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Career Applications</h2>
        <Badge variant="outline" className="text-sm">{applications.length} total</Badge>
      </div>

      {applications.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No applications yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="border-border/40 bg-card/80 backdrop-blur-sm">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{app.full_name}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Briefcase className="h-3 w-3" />
                        {app.position}
                        <span className="text-primary/70">
                          ({app.application_type === 'intern' ? 'Intern' : 'Full-Time'})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs ${statusColors[app.status] || statusColors.new}`}>
                      {app.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {expandedId === app.id && (
                <CardContent className="border-t border-border/30 pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{app.phone}</span>
                    </div>
                    {app.portfolio_url && (
                      <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <ExternalLink className="h-4 w-4" />
                        Portfolio
                      </a>
                    )}
                  </div>

                  {app.cv_url && (
                    <Button variant="outline" size="sm" onClick={() => downloadCV(app.cv_url!)} className="gap-2">
                      <FileText className="h-4 w-4" /> Download CV
                    </Button>
                  )}

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Cover Letter</p>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{app.cover_letter}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-muted-foreground">Update status:</span>
                    <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCareersSection;
