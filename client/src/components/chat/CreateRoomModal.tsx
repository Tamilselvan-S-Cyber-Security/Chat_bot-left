import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/hooks/useChat';
import { LockIcon, UnlockIcon, Loader2 } from 'lucide-react';

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Room name must be at least 3 characters' }).max(50),
  description: z.string().max(200).optional(),
  isPrivate: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createRoom, setActiveRoom } = useChat();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isPrivate: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const roomId = await createRoom(data.name, data.description || '', data.isPrivate);
      
      // Get the created room details and set as active
      const createdRoom = {
        id: roomId,
        name: data.name,
        description: data.description || '',
        isPrivate: data.isPrivate,
        createdBy: 'currentUser', // This will be set correctly in the context
        createdAt: Date.now(),
        members: {}
      };
      
      setActiveRoom(createdRoom);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass rounded-2xl w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-sans">Create a New Room</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter room name"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What's this room about?"
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
              name="isPrivate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      className={`py-2 px-3 rounded-lg glass-dark border ${
                        !field.value 
                          ? 'border-primary text-primary' 
                          : 'border-secondary text-text-secondary'
                      } flex items-center justify-center`}
                      onClick={() => field.onChange(false)}
                      disabled={isLoading}
                    >
                      <UnlockIcon className="h-4 w-4 mr-1" /> Public
                    </Button>
                    <Button
                      type="button"
                      className={`py-2 px-3 rounded-lg glass-dark border ${
                        field.value 
                          ? 'border-primary text-primary' 
                          : 'border-secondary text-text-secondary'
                      } flex items-center justify-center`}
                      onClick={() => field.onChange(true)}
                      disabled={isLoading}
                    >
                      <LockIcon className="h-4 w-4 mr-1" /> Private
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4 border-t border-secondary">
              <Button
                type="submit"
                className="w-full py-3 px-4 bg-primary hover:bg-opacity-90 text-white font-medium rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isLoading ? 'Creating Room...' : 'Create Room'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
