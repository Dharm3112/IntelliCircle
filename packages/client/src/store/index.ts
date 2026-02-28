import { create } from "zustand";

interface AppState {
    roomId: number | null;
    setRoomId: (id: number | null) => void;
    // Note: we will expand this when implementing Phase 5 (WebSockets)
}

export const useAppStore = create<AppState>((set) => ({
    roomId: null,
    setRoomId: (id) => set({ roomId: id }),
}));
