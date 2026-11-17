import { create } from 'zustand';
import type { User, FileInfo, FileDetail, Template } from '../types';

// ---- Auth Store ----
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    localStorage.setItem('ecuview_token', token);
    localStorage.setItem('ecuview_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('ecuview_token');
    localStorage.removeItem('ecuview_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('ecuview_token');
    const userStr = localStorage.getItem('ecuview_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('ecuview_token');
        localStorage.removeItem('ecuview_user');
      }
    }
  },
}));

// ---- Theme Store ----
type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  loadFromStorage: () => void;
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ecuview_theme', newTheme);
    applyTheme(newTheme);
    set({ theme: newTheme });
  },

  setTheme: (theme) => {
    localStorage.setItem('ecuview_theme', theme);
    applyTheme(theme);
    set({ theme });
  },

  loadFromStorage: () => {
    const stored = localStorage.getItem('ecuview_theme') as Theme | null;
    if (stored) {
      applyTheme(stored);
      set({ theme: stored });
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      applyTheme(theme);
      set({ theme });
    }
  },
}));

// ---- App Store ----
interface AppState {
  files: FileInfo[];
  selectedFile: FileDetail | null;
  selectedChannels: string[];
  templates: Template[];
  sidebarOpen: boolean;

  setFiles: (files: FileInfo[]) => void;
  setSelectedFile: (file: FileDetail | null) => void;
  toggleChannel: (name: string) => void;
  setSelectedChannels: (channels: string[]) => void;
  clearChannels: () => void;
  setTemplates: (templates: Template[]) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  selectedFile: null,
  selectedChannels: [],
  templates: [],
  sidebarOpen: true,

  setFiles: (files) => set({ files }),
  setSelectedFile: (file) => set({ selectedFile: file, selectedChannels: [] }),

  toggleChannel: (name) =>
    set((state) => ({
      selectedChannels: state.selectedChannels.includes(name)
        ? state.selectedChannels.filter((n) => n !== name)
        : [...state.selectedChannels, name],
    })),

  setSelectedChannels: (channels) => set({ selectedChannels: channels }),
  clearChannels: () => set({ selectedChannels: [] }),
  setTemplates: (templates) => set({ templates }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
