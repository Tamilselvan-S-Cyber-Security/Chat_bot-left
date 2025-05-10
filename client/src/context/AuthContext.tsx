import { createContext, useState, useEffect, ReactNode } from "react";
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  FirebaseUser,
  db,
  ref,
  get,
  set,
  GoogleAuthProvider,
  signInWithPopup
} from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Define the User type extended from Firebase User
export interface User extends Omit<FirebaseUser, "metadata"> {
  displayName: string | null;
  photoURL: string | null;
  isNewUser?: boolean;
  about?: string;
  status?: 'online' | 'away' | 'offline';
}

// Define the context shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setupProfile: (displayName: string, photoURL: string | null, about: string) => Promise<void>;
  updateUserStatus: (status: 'online' | 'away' | 'offline') => Promise<void>;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  setupProfile: async () => {},
  updateUserStatus: async () => {}
});

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if the user exists in the database
  const checkUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        // User exists in db, merge Firebase user with db data
        const userData = snapshot.val();
        return {
          ...firebaseUser,
          about: userData.about || '',
          status: userData.status || 'online',
          isNewUser: false
        } as User;
      } else {
        // User doesn't exist in db, mark as new
        return {
          ...firebaseUser,
          isNewUser: true
        } as User;
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      return { ...firebaseUser, isNewUser: true } as User;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Make sure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const extendedUser = await checkUserProfile(firebaseUser);
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
      clearTimeout(timeoutId);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Register a new user
  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = {
        ...userCredential.user,
        isNewUser: true
      } as User;
      setUser(newUser);
      toast({
        title: "Account created",
        description: "Please complete your profile setup",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login an existing user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back",
        description: "You've successfully logged in",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in our database
      const userSnapshot = await get(ref(db, `users/${result.user.uid}`));
      
      if (!userSnapshot.exists()) {
        // First time Google login, mark as new user
        setUser({ 
          ...result.user,
          isNewUser: true 
        } as User);
      } else {
        // Existing user
        toast({
          title: "Welcome back",
          description: "You've successfully logged in with Google",
        });
      }
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout the current user
  const logout = async () => {
    try {
      if (user) {
        // Set user status to offline before logging out
        await updateUserStatus('offline');
      }
      await firebaseSignOut(auth);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Setup user profile after registration
  const setupProfile = async (displayName: string, photoURL: string | null, about: string) => {
    try {
      if (!auth.currentUser) throw new Error("User not authenticated");
      
      // Update profile in Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: photoURL || '',
      });
      
      // Create or update user in database
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      await set(userRef, {
        displayName,
        photoURL: photoURL || '',
        about,
        status: 'online',
        email: auth.currentUser.email,
        createdAt: new Date().toISOString(),
      });
      
      // Update local user state
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          displayName,
          photoURL,
          about,
          status: 'online',
          isNewUser: false
        };
      });
      
      toast({
        title: "Profile setup complete",
        description: "Your profile has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Profile setup failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update user status
  const updateUserStatus = async (status: 'online' | 'away' | 'offline') => {
    try {
      if (!auth.currentUser) throw new Error("User not authenticated");
      
      // Update status in database
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      await set(userRef, {
        status,
        lastActiveAt: new Date().toISOString(),
      });
      
      // Update local user state
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          status
        };
      });
    } catch (error: any) {
      console.error("Failed to update status:", error);
    }
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        setupProfile,
        updateUserStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
