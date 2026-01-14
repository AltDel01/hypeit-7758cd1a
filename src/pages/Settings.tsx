import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Twitter, Instagram, Linkedin, Globe, Camera, Loader2, Save, ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod';

const profileSchema = z.object({
  display_name: z.string().max(100, 'Name must be less than 100 characters').optional().nullable(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional().nullable(),
  twitter_handle: z.string().max(50, 'Twitter handle must be less than 50 characters').optional().nullable(),
  instagram_handle: z.string().max(50, 'Instagram handle must be less than 50 characters').optional().nullable(),
  linkedin_url: z.string().url('Please enter a valid URL').max(255, 'URL must be less than 255 characters').optional().nullable().or(z.literal('')),
  website_url: z.string().url('Please enter a valid URL').max(255, 'URL must be less than 255 characters').optional().nullable().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Profile extends ProfileFormData {
  id: string;
  email: string;
  avatar_url: string | null;
  subscription_tier: string | null;
}

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: '',
    phone: '',
    twitter_handle: '',
    instagram_handle: '',
    linkedin_url: '',
    website_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as Profile);
        setFormData({
          display_name: data.display_name || '',
          phone: data.phone || '',
          twitter_handle: data.twitter_handle || '',
          instagram_handle: data.instagram_handle || '',
          linkedin_url: data.linkedin_url || '',
          website_url: data.website_url || '',
        });
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate form data
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        display_name: formData.display_name || null,
        phone: formData.phone || null,
        twitter_handle: formData.twitter_handle || null,
        instagram_handle: formData.instagram_handle || null,
        linkedin_url: formData.linkedin_url || null,
        website_url: formData.website_url || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('User Avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('User Avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully!');
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
      console.error('Error uploading avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Manage your account information</p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Avatar Section */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-white text-base sm:text-lg">Profile Picture</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Upload a photo to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-gray-700">
                    <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-white text-xl sm:text-2xl">
                      {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-purple-600 hover:bg-purple-700 rounded-full cursor-pointer transition-colors"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{profile?.display_name || 'No name set'}</p>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{user.email}</p>
                  <p className="text-purple-400 text-xs mt-1 capitalize">{profile?.subscription_tier || 'Free'} Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info Section */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-gray-300 text-sm">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name || ''}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="Your name"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11 sm:h-10"
                  />
                  {errors.display_name && <p className="text-red-400 text-xs">{errors.display_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed h-11 sm:h-10"
                  />
                  <p className="text-gray-500 text-xs">Email cannot be changed</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11 sm:h-10"
                />
                {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Social Media Section */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                Social Media & Links
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Connect your social profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-gray-300 flex items-center gap-2 text-sm">
                    <Twitter className="w-4 h-4" />
                    Twitter/X Handle
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <Input
                      id="twitter"
                      value={formData.twitter_handle || ''}
                      onChange={(e) => handleInputChange('twitter_handle', e.target.value.replace('@', ''))}
                      placeholder="username"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-8 h-11 sm:h-10"
                    />
                  </div>
                  {errors.twitter_handle && <p className="text-red-400 text-xs">{errors.twitter_handle}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-gray-300 flex items-center gap-2 text-sm">
                    <Instagram className="w-4 h-4" />
                    Instagram Handle
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <Input
                      id="instagram"
                      value={formData.instagram_handle || ''}
                      onChange={(e) => handleInputChange('instagram_handle', e.target.value.replace('@', ''))}
                      placeholder="username"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-8 h-11 sm:h-10"
                    />
                  </div>
                  {errors.instagram_handle && <p className="text-red-400 text-xs">{errors.instagram_handle}</p>}
                </div>
              </div>
              <Separator className="bg-gray-800" />
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-gray-300 flex items-center gap-2 text-sm">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin_url || ''}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11 sm:h-10"
                  />
                  {errors.linkedin_url && <p className="text-red-400 text-xs">{errors.linkedin_url}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-gray-300 flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website_url || ''}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11 sm:h-10"
                  />
                  {errors.website_url && <p className="text-red-400 text-xs">{errors.website_url}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button - Sticky on mobile */}
          <div className="fixed bottom-20 left-0 right-0 p-3 bg-black/90 backdrop-blur-sm border-t border-gray-800 md:static md:p-0 md:bg-transparent md:border-0 md:flex md:justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 h-11 sm:h-10"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
