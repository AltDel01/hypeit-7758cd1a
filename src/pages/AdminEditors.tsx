import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, RefreshCw, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GenerationRequest } from '@/services/generationRequestService';

interface EditorInfo {
  userId: string;
  email: string;
  displayName: string | null;
  createdAt: string | null;
  totalAssigned: number;
  totalCompleted: number;
  avgTurnaroundHours: number | null;
}

const AdminEditors = () => {
  const [editors, setEditors] = useState<EditorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEditor, setNewEditor] = useState({ email: '', password: '', displayName: '' });
  const [isCreating, setIsCreating] = useState(false);

  const loadEditors = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get all editor roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, created_at')
        .eq('role', 'editor');

      if (rolesError) {
        console.error('Error loading editor roles:', rolesError);
        setIsLoading(false);
        return;
      }

      if (!roles || roles.length === 0) {
        setEditors([]);
        setIsLoading(false);
        return;
      }

      const editorIds = roles.map((r) => r.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, display_name, created_at')
        .in('id', editorIds);

      // Get all requests for stats
      const { data: requests } = await supabase
        .from('generation_requests')
        .select('assigned_to, status, assigned_at, completed_at')
        .in('assigned_to', editorIds);

      const editorInfos: EditorInfo[] = editorIds.map((uid) => {
        const profile = profiles?.find((p) => p.id === uid);
        const role = roles.find((r) => r.user_id === uid);
        const editorRequests = (requests || []).filter((r) => r.assigned_to === uid);
        const completed = editorRequests.filter((r) => r.status === 'completed');

        let avgTurnaround: number | null = null;
        const turnarounds = completed
          .filter((r) => r.assigned_at && r.completed_at)
          .map((r) => {
            const start = new Date(r.assigned_at!).getTime();
            const end = new Date(r.completed_at!).getTime();
            return (end - start) / (1000 * 60 * 60);
          });
        if (turnarounds.length > 0) {
          avgTurnaround = turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length;
        }

        return {
          userId: uid,
          email: profile?.email || 'Unknown',
          displayName: profile?.display_name || null,
          createdAt: role?.created_at || profile?.created_at || null,
          totalAssigned: editorRequests.length,
          totalCompleted: completed.length,
          avgTurnaroundHours: avgTurnaround,
        };
      });

      setEditors(editorInfos);
    } catch (error) {
      console.error('Error loading editors:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEditors();
  }, [loadEditors]);

  const handleCreateEditor = async () => {
    if (!newEditor.email || !newEditor.password) {
      toast.error('Email and password are required');
      return;
    }
    if (newEditor.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-editor', {
        body: {
          email: newEditor.email,
          password: newEditor.password,
          displayName: newEditor.displayName || undefined,
        },
      });

      if (error) {
        toast.error('Failed to create editor: ' + error.message);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`Editor account created for ${newEditor.email}`);
      setNewEditor({ email: '', password: '', displayName: '' });
      setDialogOpen(false);
      await loadEditors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create editor');
    } finally {
      setIsCreating(false);
    }
  };

  const formatHours = (hours: number | null) => {
    if (hours === null) return '—';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">Editor Management</h1>
                <p className="text-muted-foreground">Register and manage video editors</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadEditors} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="newPurple" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Editor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register New Editor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label htmlFor="editor-name">Display Name</Label>
                        <Input
                          id="editor-name"
                          placeholder="John Doe"
                          value={newEditor.displayName}
                          onChange={(e) => setNewEditor((p) => ({ ...p, displayName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editor-email">Email</Label>
                        <Input
                          id="editor-email"
                          type="email"
                          placeholder="editor@example.com"
                          value={newEditor.email}
                          onChange={(e) => setNewEditor((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editor-password">Password</Label>
                        <Input
                          id="editor-password"
                          type="password"
                          placeholder="Min 6 characters"
                          value={newEditor.password}
                          onChange={(e) => setNewEditor((p) => ({ ...p, password: e.target.value }))}
                        />
                      </div>
                      <Button
                        onClick={handleCreateEditor}
                        disabled={isCreating}
                        className="w-full"
                        variant="newPurple"
                      >
                        {isCreating ? 'Creating...' : 'Create Editor Account'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : editors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No editors registered yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Click "Add Editor" to create the first editor account</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-3 font-medium text-muted-foreground">Editor</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Assigned
                          </div>
                        </th>
                        <th className="text-center p-3 font-medium text-muted-foreground">
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Completed
                          </div>
                        </th>
                        <th className="text-center p-3 font-medium text-muted-foreground">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" /> Avg Speed
                          </div>
                        </th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editors.map((editor) => (
                        <tr key={editor.userId} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium text-foreground">
                            {editor.displayName || editor.email.split('@')[0]}
                          </td>
                          <td className="p-3 text-muted-foreground">{editor.email}</td>
                          <td className="p-3 text-center text-foreground">{editor.totalAssigned}</td>
                          <td className="p-3 text-center text-foreground">{editor.totalCompleted}</td>
                          <td className="p-3 text-center text-foreground">{formatHours(editor.avgTurnaroundHours)}</td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {editor.createdAt ? new Date(editor.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default AdminEditors;
