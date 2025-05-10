import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle, Clock, Monitor, Moon, Sun, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { storage, storageRef, uploadBytes, getDownloadURL } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  displayName: z.string().min(3, { message: 'Display name must be at least 3 characters' }),
  about: z.string().max(150, { message: 'About me must be at most 150 characters' }),
  email: z.string().email({ message: 'Please enter a valid email' }).optional(),
  notifications: z.boolean().default(true),
  theme: z.enum(['dark', 'light', 'system']),
  status: z.enum(['online', 'away', 'offline']),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, setupProfile, updateUserStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.photoURL || '');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      about: user?.about || '',
      email: user?.email || '',
      notifications: true,
      theme: 'dark',
      status: user?.status || 'online',
    },
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.setValue('displayName', user.displayName || '');
      form.setValue('about', user.about || '');
      form.setValue('email', user.email || '');
      form.setValue('status', user.status || 'online');
      setAvatarUrl(user.photoURL || '');
    }
  }, [user, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Only accept images
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      let photoURL = user?.photoURL || '';
      
      // Only upload new avatar if changed
      if (avatar) {
        const avatarId = uuidv4();
        const avatarRef = storageRef(storage, `avatars/${avatarId}`);
        await uploadBytes(avatarRef, avatar);
        photoURL = await getDownloadURL(avatarRef);
      }
      
      // Update profile
      await setupProfile(data.displayName, photoURL, data.about);
      
      // Update status if changed
      if (data.status !== user?.status) {
        await updateUserStatus(data.status);
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-sans">Profile Settings</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex mb-6">
              <div className="mr-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-light flex items-center justify-center">
                        <User className="h-12 w-12 text-text-secondary" />
                      </div>
                    )}
                  </div>
                  <label htmlFor="profile-avatar-upload" className="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-lg cursor-pointer">
                    <Camera className="h-4 w-4 text-white" />
                    <input 
                      id="profile-avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium mb-1">{user?.displayName || 'User'}</h3>
                <p className="text-text-secondary mb-3">{user?.about || 'Cyber Wolf Chat User'}</p>
                <div className="flex items-center mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    user?.status === 'online' ? 'bg-status-online' : 
                    user?.status === 'away' ? 'bg-status-away' : 'bg-status-offline'
                  }`}></span>
                  <span className="capitalize">{user?.status || 'Online'}</span>
                </div>
                <div className="text-sm text-text-secondary">
                  Member since {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="px-4 py-3 rounded-lg bg-dark-light border border-secondary focus:border-primary"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Me</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="px-4 py-3 rounded-lg bg-dark-light border border-secondary focus:border-primary resize-none"
                      rows={3}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="px-4 py-3 rounded-lg bg-dark-light border border-secondary focus:border-primary"
                      disabled={true} // Email cannot be changed
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Preference</FormLabel>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      className={`py-2 px-3 rounded-lg glass-dark border ${
                        field.value === 'dark' 
                          ? 'border-primary text-primary' 
                          : 'border-secondary text-text-secondary'
                      } flex items-center justify-center`}
                      onClick={() => field.onChange('dark')}
                      disabled={isLoading}
                    >
                      <Moon className="h-4 w-4 mr-1" /> Dark
                    </Button>
                    <Button
                      type="button"
                      className={`py-2 px-3 rounded-lg glass-dark border ${
                        field.value === 'light' 
                          ? 'border-primary text-primary' 
                          : 'border-secondary text-text-secondary'
                      } flex items-center justify-center`}
                      onClick={() => field.onChange('light')}
                      disabled={isLoading}
                    >
                      <Sun className="h-4 w-4 mr-1" /> Light
                    </Button>
                    <Button
                      type="button"
                      className={`py-2 px-3 rounded-lg glass-dark border ${
                        field.value === 'system' 
                          ? 'border-primary text-primary' 
                          : 'border-secondary text-text-secondary'
                      } flex items-center justify-center`}
                      onClick={() => field.onChange('system')}
                      disabled={isLoading}
                    >
                      <Monitor className="h-4 w-4 mr-1" /> System
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      className={`py-2 px-3 rounded-lg glass-dark border ${
                        field.value === 'online' 
                          ? 'border-status-online text-status-online' 
                          : 'border-secondary text-text-secondary'
                      } flex items-center justify-center`}
                      onClick={() => field.onChange('online')}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Online
                    </Button>
                    <Button
                      type="button"
                      className={`py-2 px-3 rounded-lg glass-dark border ${
                        field.value === 'away' 
                          ? 'border-status-away text-status-away' 
                          : 'border-secondary text-text-secondary'
                      } flex items-center justify-center`}
                      onClick={() => field.onChange('away')}
                      disabled={isLoading}
                    >
                      <Clock className="h-4 w-4 mr-1" /> Away
                    </Button>
                    <Button
                      type="button"
                      className={`py-2 px-3 rounded-lg glass-dark border ${
                        field.value === 'offline' 
                          ? 'border-secondary text-text-secondary' 
                          : 'border-secondary text-text-secondary'
                      } flex items-center justify-center`}
                      onClick={() => field.onChange('offline')}
                      disabled={isLoading}
                    >
                      <span className="h-2 w-2 rounded-full border border-text-secondary mr-1"></span> Invisible
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <FormLabel>Enable notifications</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex justify-between pt-4 border-t border-secondary">
              <Button variant="secondary" disabled={isLoading}>
                Change Password
              </Button>
              <Button type="submit" className="bg-primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
