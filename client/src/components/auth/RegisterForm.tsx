import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/ui/glass-card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Define form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await register(data.email, data.password);
      // Redirect will happen automatically via the Router in App.tsx
    } catch (error) {
      // Error is already handled in the auth context
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-sans text-text-primary mb-2">
          <i className="ri-wolf-2-line text-primary"></i> Create Account
        </h1>
        <p className="text-text-secondary">Join the secure messaging platform</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    placeholder="Enter your email"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Create a password"
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 rounded-lg bg-dark-light border border-secondary focus:border-primary"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="ripple w-full py-3 px-4 bg-primary hover:bg-opacity-90 text-white font-medium rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <div className="relative my-6">
            <Separator className="my-4" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-muted-foreground text-sm">or continue with</div>
          </div>
          
          <Button
            type="button"
            className="ripple w-full py-3 px-4 glass-dark border border-secondary hover:bg-opacity-20 font-medium rounded-lg flex items-center justify-center"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                await loginWithGoogle();
                // Redirect will happen automatically via the Router in App.tsx
              } catch (error) {
                // Error is already handled in the auth context
                console.error(error);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign up with Google
          </Button>
          
          <p className="text-center text-text-secondary">
            Already have an account?{' '}
            <Link href="/" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </GlassCard>
  );
}
