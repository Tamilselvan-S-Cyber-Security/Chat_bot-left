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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Define form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  // Temporarily remove the auth context dependency to fix loading issues
  // const { login, loginWithGoogle } = useAuth();
  const login = async () => console.log("Login functionality temporarily disabled");
  const loginWithGoogle = async () => console.log("Google login temporarily disabled");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
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
          <i className="ri-wolf-2-line text-primary"></i> Cyber Wolf Chat
        </h1>
        <p className="text-text-secondary">Secure. Private. Real-time.</p>
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
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg bg-dark-light border border-secondary focus:border-primary"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className="h-4 w-4 accent-primary"
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-text-secondary">Remember me</FormLabel>
                </FormItem>
              )}
            />
            
            <Button variant="link" className="p-0 text-sm text-primary hover:underline" disabled={isLoading}>
              Forgot password?
            </Button>
          </div>
          
          <Button
            type="submit"
            className="ripple w-full py-3 px-4 bg-primary hover:bg-opacity-90 text-white font-medium rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
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
            Sign in with Google
          </Button>
          
          <p className="text-center text-text-secondary">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </Form>
    </GlassCard>
  );
}
