import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
    id: string;
    title: string;
    artist: string;
    album?: string;
    duration: string;
    plays?: string;
    image?: string;
    isLiked?: boolean;
}

export interface MusicState {
    // Current playing track
    currentTrack: Track | null;
    isPlaying: boolean;
    isPaused: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    
    // Playlist/Queue
    queue: Track[];
    currentIndex: number;
    
    // Player controls
    isShuffled: boolean;
    isRepeated: boolean;
    
    // Actions
    setCurrentTrack: (track: Track) => void;
    play: () => void;
    pause: () => void;
    togglePlayPause: () => void;
    setVolume: (volume: number) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    
    // Queue management
    setQueue: (tracks: Track[]) => void;
    addToQueue: (track: Track) => void;
    removeFromQueue: (index: number) => void;
    nextTrack: () => void;
    previousTrack: () => void;
    setCurrentIndex: (index: number) => void;
    
    // Player modes
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    
    // Utility
    reset: () => void;
}

const initialState = {
    currentTrack: null,
    isPlaying: false,
    isPaused: false,
    volume: 50,
    currentTime: 0,
    duration: 0,
    queue: [],
    currentIndex: 0,
    isShuffled: false,
    isRepeated: false,
};

export const useMusicStore = create<MusicState>()(
    persist(
        (set, get) => ({
            ...initialState,
            
            setCurrentTrack: (track: Track) => {
                set({ 
                    currentTrack: track,
                    isPlaying: true,
                    isPaused: false,
                    currentTime: 0
                });
            },
            
            play: () => {
                set({ isPlaying: true, isPaused: false });
            },
            
            pause: () => {
                set({ isPlaying: false, isPaused: true });
            },
            
            togglePlayPause: () => {
                const { isPlaying } = get();
                set({ isPlaying: !isPlaying, isPaused: isPlaying });
            },
            
            setVolume: (volume: number) => {
                set({ volume });
            },
            
            setCurrentTime: (time: number) => {
                set({ currentTime: time });
            },
            
            setDuration: (duration: number) => {
                set({ duration });
            },
            
            setQueue: (tracks: Track[]) => {
                set({ queue: tracks, currentIndex: 0 });
            },
            
            addToQueue: (track: Track) => {
                const { queue } = get();
                set({ queue: [...queue, track] });
            },
            
            removeFromQueue: (index: number) => {
                const { queue, currentIndex } = get();
                const newQueue = queue.filter((_, i) => i !== index);
                const newCurrentIndex = index < currentIndex ? currentIndex - 1 : currentIndex;
                set({ queue: newQueue, currentIndex: newCurrentIndex });
            },
            
            nextTrack: () => {
                const { queue, currentIndex, isRepeated } = get();
                if (queue.length === 0) return;
                
                let nextIndex = currentIndex + 1;
                if (nextIndex >= queue.length) {
                    nextIndex = isRepeated ? 0 : currentIndex;
                }
                
                set({ 
                    currentIndex: nextIndex,
                    currentTrack: queue[nextIndex],
                    currentTime: 0
                });
            },
            
            previousTrack: () => {
                const { queue, currentIndex } = get();
                if (queue.length === 0) return;
                
                let prevIndex = currentIndex - 1;
                if (prevIndex < 0) {
                    prevIndex = queue.length - 1;
                }
                
                set({ 
                    currentIndex: prevIndex,
                    currentTrack: queue[prevIndex],
                    currentTime: 0
                });
            },
            
            setCurrentIndex: (index: number) => {
                const { queue } = get();
                if (index >= 0 && index < queue.length) {
                    set({ 
                        currentIndex: index,
                        currentTrack: queue[index],
                        currentTime: 0
                    });
                }
            },
            
            toggleShuffle: () => {
                const { isShuffled } = get();
                set({ isShuffled: !isShuffled });
            },
            
            toggleRepeat: () => {
                const { isRepeated } = get();
                set({ isRepeated: !isRepeated });
            },
            
            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'music-storage',
            partialize: (state) => ({
                currentTrack: state.currentTrack,
                isPlaying: state.isPlaying,
                volume: state.volume,
                queue: state.queue,
                currentIndex: state.currentIndex,
                isShuffled: state.isShuffled,
                isRepeated: state.isRepeated,
            }),
        }
    )
);
