'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { allBadges } from '@/lib/data';
import type { QuizQuestion, MarketItem } from '@/lib/types';
import type { Database } from '@/lib/supabase';

// Types from Supabase schema
type AppUser = Database['public']['Tables']['users']['Row'];

interface AppContextType {
  currentUser: AppUser | null;
  isLoaded: boolean;
  wordCoins: number;
  masteredWords: Map<string, number>; // Map of word -> timestamp
  unlockedBadgeIds: Set<string>;
  inventory: MarketItem[];
  quizQuestions: QuizQuestion[];
  storiesGenerated: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addCoins: (amount: number) => void;
  buyItem: (item: MarketItem) => void;
  addMasteredWord: (word: string) => void;
  addQuizQuestion: (question: QuizQuestion) => void;
  incrementStoriesGenerated: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wordCoins, setWordCoins] = useState(0);
  const [masteredWords, setMasteredWords] = useState<Map<string, number>>(new Map());
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set());
  const [inventory, setInventory] = useState<MarketItem[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [storiesGenerated, setStoriesGenerated] = useState(0);
  
  const router = useRouter();
  const { toast } = useToast();

  const checkAndAwardBadges = useCallback(async (state: { masteredWords: Map<string, number>; storiesGenerated: number; }) => {
    if (!currentUser) return;

    for (const badge of allBadges) {
      if (!unlockedBadgeIds.has(badge.id) && badge.check(state)) {
        console.log(`Awarding badge: ${badge.id} to user: ${currentUser.id}`);
        
        // Optimistic update
        setUnlockedBadgeIds(prev => new Set(prev).add(badge.id));

        // Save to database
        const { error } = await supabase.from('user_badges').insert({
          user_id: currentUser.id,
          badge_id: badge.id,
        });

        if (error) {
          console.error(`Failed to save badge ${badge.id}:`, error);
          
          // Revert optimistic update
          setUnlockedBadgeIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(badge.id);
            return newSet;
          });
          
          toast({
            variant: 'destructive',
            title: 'Badge Error',
            description: `Could not save ${badge.name} badge.`,
          });
        } else {
          console.log(`Badge awarded successfully: ${badge.name}`);
          toast({
            title: 'Achievement Unlocked!',
            description: `You earned the "${badge.name}" badge!`,
          });
        }
      }
    }
  }, [currentUser, unlockedBadgeIds, toast]);

  // Helper function to create user profile with correct ID
  const createUserProfile = useCallback(async (user: SupabaseUser, name: string, email: string) => {
    console.log('Creating user profile for auth user ID:', user.id);
    
    try {
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        console.log('Profile already exists for user:', user.id);
        return true; // Profile already exists, no need to create
      }

      // Create new profile
      const profileData = {
        id: user.id,
        name,
        email,
        word_coins: 100,
        stories_generated: 0
      };
      
      console.log('Creating profile with data:', profileData);
      
      const { error: profileError } = await supabase
        .from('users')
        .insert(profileData);

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message || 'Unknown error'}`);
      }

      console.log('Profile created successfully for user ID:', user.id);
      return true;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  }, []);

  // Enhanced loadUserData with automatic profile creation for missing profiles
  const loadUserData = useCallback(async (user: SupabaseUser) => {
    console.log('Loading user data for auth user ID:', user.id);
    
    try {
      // Fetch profile using the exact auth user ID
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      let userProfile = profile;
      
      // Handle missing profile
      if (profileError && profileError.code === 'PGRST116') {
        console.log('No profile found for user ID:', user.id, 'Creating one...');
        
        const userMetadata = user.user_metadata;
        const userName = userMetadata?.name || user.email?.split('@')[0] || 'User';
        const userEmail = user.email || '';
        
        // Create missing profile
        try {
          await createUserProfile(user, userName, userEmail);
          
          // Retry loading the profile
          const { data: newProfile, error: newProfileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (newProfileError || !newProfile) {
            console.error('Failed to load newly created profile:', newProfileError);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create user profile.' });
            await supabase.auth.signOut();
            return;
          }
          
          userProfile = newProfile;
        } catch (createError) {
          console.error('Failed to create profile during load:', createError);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not create user profile.' });
          await supabase.auth.signOut();
          return;
        }
      } else if (profileError) {
        console.error('Profile fetch failed with error:', profileError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load user profile.' });
        await supabase.auth.signOut();
        return;
      }
      
      if (!userProfile) {
        console.error('No profile data returned for user ID:', user.id);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load user profile.' });
        await supabase.auth.signOut();
        return;
      }

      // Profile found successfully
      setCurrentUser(userProfile);
      setWordCoins(userProfile.word_coins);
      setStoriesGenerated(userProfile.stories_generated);
      console.log('Profile loaded successfully:', userProfile);

      // Fetch mastered words
      const { data: wordsData, error: wordsError } = await supabase
        .from('mastered_words')
        .select('word, mastered_at')
        .eq('user_id', user.id);
        
      if (wordsError) console.error('Error fetching mastered words:', wordsError);
      
      const loadedMasteredWords = wordsData ? new Map(wordsData.map(w => [w.word, new Date(w.mastered_at).getTime()])) : new Map();
      setMasteredWords(loadedMasteredWords);

      // Fetch badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);
        
      if (badgesError) console.error('Error fetching badges:', badgesError);
      
      const loadedBadgeIds = badgesData ? new Set(badgesData.map(b => b.badge_id)) : new Set();
      setUnlockedBadgeIds(loadedBadgeIds);

      // Check for badges after loading data
      await checkAndAwardBadges({
        masteredWords: loadedMasteredWords,
        storiesGenerated: userProfile.stories_generated || 0
      });

      console.log('All user data loaded successfully for user ID:', user.id);

    } catch (err) {
      console.error('Error in loadUserData:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load your data.' });
    }
  }, [toast, createUserProfile, checkAndAwardBadges]);

  // Initialize app and handle auth state changes
  useEffect(() => {
    const checkUser = async () => {
      console.log('Checking initial user session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Initial session check:', { 
          sessionExists: !!session, 
          userExists: !!session?.user,
          userId: session?.user?.id,
          error 
        });
        
        if (session?.user) {
          console.log('Found existing session for user ID:', session.user.id);
          await loadUserData(session.user);
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
      } finally {
        setIsLoaded(true);
        console.log('App initialization complete');
      }
    };

    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'User ID:', session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, loading data for user ID:', session.user.id);
          await loadUserData(session.user);
          setIsLoaded(true);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing data...');
          setCurrentUser(null);
          setWordCoins(0);
          setMasteredWords(new Map());
          setUnlockedBadgeIds(new Set());
          setInventory([]);
          setQuizQuestions([]);
          setStoriesGenerated(0);
          setIsLoaded(true);
          router.push('/auth');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUserData, router]);

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.log('Login error:', error);
        toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
        return;
      }

      if (data.user) {
        console.log('User logged in successfully with ID:', data.user.id);
        toast({ title: 'Success!', description: 'You are now logged in.' });
        
        await loadUserData(data.user);
        console.log('User data loaded, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('Login succeeded but no user object returned');
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Please check your credentials.' });
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast({ variant: 'destructive', title: 'Login Failed', description: 'An unexpected error occurred.' });
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    console.log('Attempting signup for:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { name: name }
        }
      });
      
      if (error) {
        console.log('Signup error:', error);
        toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
        return;
      }

      if (data.user) {
        console.log('Auth user created with ID:', data.user.id);
        
        // User is immediately confirmed in local dev, create profile
        console.log('User created, creating profile...');
        
        try {
          await createUserProfile(data.user, name, email);
          
          toast({ title: 'Welcome!', description: 'Your account has been created.' });
          
          await loadUserData(data.user);
          console.log('User data loaded after signup, redirecting to dashboard');
          router.push('/dashboard');
        } catch (profileError) {
          console.error('Profile creation failed during signup:', profileError);
          toast({ 
            variant: 'destructive', 
            title: 'Signup Failed', 
            description: 'Could not create user profile. Please try again.' 
          });
          
          await supabase.auth.signOut();
        }
      } else {
        toast({ 
          title: 'Check your email!', 
          description: 'We sent you a confirmation link. Please click it to complete your account setup.' 
        });
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast({ variant: 'destructive', title: 'Signup Failed', description: 'An unexpected error occurred.' });
    }
  };

  const logout = async () => {
    console.log('Logging out user...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({ variant: 'destructive', title: 'Logout Failed', description: error.message });
      } else {
        console.log('User logged out successfully');
        toast({ title: 'Goodbye!', description: 'You have been logged out.' });
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };
  
  const addMasteredWord = async (word: string) => {
    if (!currentUser || masteredWords.has(word)) {
      return;
    }
    
    // Optimistic update
    const newMasteredWords = new Map(masteredWords).set(word, Date.now());
    setMasteredWords(newMasteredWords);
    addCoins(10);
    
    try {
      const { error } = await supabase
        .from('mastered_words')
        .insert({ 
          user_id: currentUser.id,
          word 
        });
      
      if (error) {
        console.error('Failed to save mastered word:', error);
        toast({ variant: 'destructive', title: 'Sync Error', description: 'Could not save new word.' });
        
        // Revert optimistic update
        const revertedWords = new Map(masteredWords);
        revertedWords.delete(word);
        setMasteredWords(revertedWords);
      } else {
        toast({ title: 'Word Mastered!', description: `You learned "${word}" and earned 10 coins!` });
        // Check for badges after word is successfully saved
        checkAndAwardBadges({ masteredWords: newMasteredWords, storiesGenerated });
      }
    } catch (error) {
      console.error('Unexpected error adding mastered word:', error);
    }
  };

  const addCoins = async (amount: number) => {
    if (!currentUser) {
      return;
    }
    
    // Optimistic update
    const newCoins = wordCoins + amount;
    setWordCoins(newCoins);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ word_coins: newCoins })
        .eq('id', currentUser.id);
        
      if (error) {
        console.error('Failed to update coins:', error);
        toast({ variant: 'destructive', title: 'Sync Error', description: 'Could not update your coin balance.' });
        setWordCoins(wordCoins); // Revert
      }
    } catch (error) {
      console.error('Unexpected error updating coins:', error);
    }
  };

  const buyItem = async (item: MarketItem) => {
    if (!currentUser || wordCoins < item.price) {
      return;
    }
    
    // Optimistic update
    const newCoins = wordCoins - item.price;
    setWordCoins(newCoins);
    setInventory([...inventory, item]);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ word_coins: newCoins })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Failed to complete purchase:', error);
        toast({ variant: 'destructive', title: 'Purchase Failed', description: 'Could not complete the transaction.' });
        
        // Revert optimistic updates
        setWordCoins(wordCoins);
        setInventory(inventory.filter(i => i.id !== item.id));
      } else {
        toast({ title: 'Purchase Successful!', description: `You bought ${item.name}!` });
      }
    } catch (error) {
      console.error('Unexpected error during purchase:', error);
    }
  };
  
  const incrementStoriesGenerated = async () => {
    if (!currentUser) {
      return;
    }
    
    // Optimistic update
    const newCount = storiesGenerated + 1;
    setStoriesGenerated(newCount);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ stories_generated: newCount })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Failed to update story count:', error);
        toast({ variant: 'destructive', title: 'Sync Error', description: 'Could not update story count.' });
        setStoriesGenerated(storiesGenerated); // Revert
      } else {
        checkAndAwardBadges({ masteredWords, storiesGenerated: newCount });
      }
    } catch (error) {
      console.error('Unexpected error updating story count:', error);
    }
  };
  
  const addQuizQuestion = (question: QuizQuestion) => {
    setQuizQuestions(prev => [...prev, question]);
  };

  const value = {
    currentUser,
    isLoaded,
    wordCoins,
    masteredWords,
    unlockedBadgeIds,
    inventory,
    quizQuestions,
    storiesGenerated,
    login,
    signup,
    logout,
    addCoins,
    buyItem,
    addMasteredWord,
    addQuizQuestion,
    incrementStoriesGenerated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
