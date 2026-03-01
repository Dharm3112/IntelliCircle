import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: number;
    username: string;
    role: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    setAuth: (accessToken: string, user: User) => void;
    updateProfile: (updates: Partial<User>) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
            updateProfile: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),
            logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
        }),
        {
            name: "intellicircle-auth", // unique name for local storage key
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated
            }), // Only persist these fields
        }
    )
);
