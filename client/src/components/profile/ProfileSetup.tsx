import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/ui/glass-card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { storage, storageRef, uploadBytes, getDownloadURL } from '@/lib/firebase';
import { Camera, CheckCircle, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Define form schema
const formSchema = z.object({
  displayName: z.string().min(3, { message: 'Display name must be at least 3 characters' }),
  about: z.string().max(150, { message: 'About me must be at most 150 characters' }),
  status: z.enum(['online', 'away', 'invisible']),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const { setupProfile } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      about: '',
      status: 'online',
    },
  });

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
      let photoURL = null;
      
      if (avatar) {
        // Upload avatar to Firebase Storage
        const avatarId = uuidv4();
        const avatarRef = storageRef(storage, `avatars/${avatarId}`);
        await uploadBytes(avatarRef, avatar);
        
        // Get download URL
        photoURL = await getDownloadURL(avatarRef);
      }
      
      await setupProfile(data.displayName, photoURL, data.about);
      
      // Redirect will happen automatically via the Router in App.tsx
    } catch (error: any) {
      toast({
        title: 'Profile Setup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-sans text-text-primary mb-2">Complete Your Profile</h1>
        <p className="text-text-secondary">Set up your profile to get started</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-light flex items-center justify-center">
                    <span className="text-4xl text-text-secondary">
                      {form.watch('displayName')?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-lg cursor-pointer">
                <Camera className="h-4 w-4 text-white" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </label>
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
                    placeholder="Choose a display name"
                    className="w-full px-4 py-3 rounded-lg bg-dark-light border border-secondary focus:border-primary"
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
                    placeholder="Share a little bit about yourself"
                    className="w-full px-4 py-3 rounded-lg bg-dark-light border border-secondary focus:border-primary resize-none"
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
                      field.value === 'invisible' 
                        ? 'border-secondary text-text-secondary' 
                        : 'border-secondary text-text-secondary'
                    } flex items-center justify-center`}
                    onClick={() => field.onChange('invisible')}
                    disabled={isLoading}
                  >
                    <span className="h-2 w-2 rounded-full border border-text-secondary mr-1"></span> Invisible
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="ripple w-full py-3 px-4 bg-primary hover:bg-opacity-90 text-white font-medium rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Setting Up Profile...' : 'Continue to Chat'}
          </Button>
        </form>
      </Form>
    </GlassCard>
  );
}
