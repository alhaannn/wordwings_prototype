
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { MarketItem, Badge, QuizQuestion, User } from '@/lib/types';
import { sampleQuiz, allBadges } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  wordCoins: number;
  addCoins: (amount: number) => void;
  subtractCoins: (amount: number) => boolean;
  masteredWords: Map<string, number>;
  addMasteredWord: (word: string) => void;
  unlockedBadgeIds: Set<string>;
  inventory: MarketItem[];
  buyItem: (item: MarketItem) => void;
  quizQuestions: QuizQuestion[];
  addQuizQuestion: (question: QuizQuestion) => void;
  incrementStoriesGenerated: () => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// In a real app, this would be an API call to a backend database
const getUsersFromDb = (): User[] => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

const saveUsersToDb = (users: User[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('users', JSON.stringify(users));
};

const getCurrentUserFromSession = (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('currentUserEmail');
}

const setCurrentUserInSession = (email: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('currentUserEmail', email);
}

const removeCurrentUserFromSession = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('currentUserEmail');
}


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wordCoins, setWordCoins] = useState(0);
  const [masteredWords, setMasteredWords] = useState<Map<string, number>>(new Map());
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set());
  const [inventory, setInventory] = useState<MarketItem[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [storiesGenerated, setStoriesGenerated] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const loadUserData = useCallback((user: User) => {
    setWordCoins(user.wordCoins);
    setMasteredWords(new Map(user.masteredWords));
    setInventory(user.inventory);
    setQuizQuestions(user.quizQuestions.length > 0 ? user.quizQuestions : sampleQuiz);
    setUnlockedBadgeIds(new Set(user.unlockedBadgeIds));
    setStoriesGenerated(user.storiesGenerated);
  }, []);
  
  // Effect for initial load and session check
  useEffect(() => {
    const userEmail = getCurrentUserFromSession();
    if (userEmail) {
      const users = getUsersFromDb();
      const user = users.find(u => u.email === userEmail);
      if (user) {
        setCurrentUser(user);
        loadUserData(user);
      }
    }
    setIsLoaded(true);
  }, [loadUserData]);
  

  const checkForNewBadges = useCallback((currentState: any) => {
    if (!currentUser) return;
    let newBadgesAdded = false;
    const currentBadges = new Set(unlockedBadgeIds);

    allBadges.forEach(badgeTemplate => {
      if (!currentBadges.has(badgeTemplate.id) && badgeTemplate.check(currentState)) {
        currentBadges.add(badgeTemplate.id);
        newBadgesAdded = true;
        toast({
            title: "Achievement Unlocked!",
            description: `You've earned the "${badgeTemplate.name}" badge!`,
        });
      }
    });

    if (newBadgesAdded) {
      setUnlockedBadgeIds(currentBadges);
    }
  }, [unlockedBadgeIds, toast, currentUser]);

  // Effect for saving data when it changes
  useEffect(() => {
    if (!isLoaded || !currentUser) return;

     const currentState = { masteredWords, storiesGenerated, wordCoins, inventory };
     checkForNewBadges(currentState);

    const updatedUser: User = {
      ...currentUser,
      wordCoins,
      masteredWords: Array.from(masteredWords.entries()),
      inventory,
      quizQuestions,
      unlockedBadgeIds: Array.from(unlockedBadgeIds),
      storiesGenerated,
    };
    
    const users = getUsersFromDb();
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsersToDb(users);
    }

  }, [wordCoins, masteredWords, inventory, quizQuestions, unlockedBadgeIds, storiesGenerated, isLoaded, currentUser, checkForNewBadges]);


  const login = (email: string, password: string): boolean => {
    const users = getUsersFromDb();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      loadUserData(user);
      setCurrentUserInSession(user.email);
      router.push('/dashboard');
      return true;
    }
    toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    const users = getUsersFromDb();
    if (users.some(u => u.email === email)) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: 'An account with this email already exists.' });
      return false;
    }
    const newUser: User = {
      name,
      email,
      password,
      wordCoins: 100,
      masteredWords: [],
      inventory: [],
      quizQuestions: sampleQuiz,
      unlockedBadgeIds: [],
      storiesGenerated: 0,
    };
    users.push(newUser);
    saveUsersToDb(users);
    setCurrentUser(newUser);
    loadUserData(newUser);
    setCurrentUserInSession(newUser.email);
    router.push('/dashboard');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    removeCurrentUserFromSession();
    // Reset state
    setWordCoins(0);
    setMasteredWords(new Map());
    setInventory([]);
    setQuizQuestions([]);
    setUnlockedBadgeIds(new Set());
    setStoriesGenerated(0);
    router.push('/auth');
  };

  const addCoins = (amount: number) => setWordCoins((prev) => prev + amount);

  const subtractCoins = (amount: number) => {
    if (wordCoins >= amount) {
      setWordCoins((prev) => prev - amount);
      return true;
    }
    return false;
  };

  const addMasteredWord = (word: string) => {
    setMasteredWords((prev) => {
        const newMap = new Map(prev);
        if (!newMap.has(word)) {
          newMap.set(word, Date.now());
        }
        return newMap;
    });
  };
  
  const buyItem = (item: MarketItem) => {
    if (subtractCoins(item.price)) {
      setInventory(prev => [...prev, item]);
    }
  };

  const addQuizQuestion = (question: QuizQuestion) => {
    setQuizQuestions(prev => {
        if (prev.some(q => q.word === question.word)) {
            return prev;
        }
        return [...prev, question];
    });
  };

  const incrementStoriesGenerated = () => {
    setStoriesGenerated(prev => prev + 1);
  };

  const contextValue = { 
      currentUser,
      login,
      signup,
      logout,
      wordCoins, 
      addCoins, 
      subtractCoins, 
      masteredWords, 
      addMasteredWord, 
      unlockedBadgeIds, 
      inventory, 
      buyItem, 
      quizQuestions, 
      addQuizQuestion, 
      incrementStoriesGenerated,
      isLoaded,
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
