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

function readAuthFromStorage(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  try {
    const token = localStorage.getItem('ecuview_token');
    const userStr = localStorage.getItem('ecuview_user');
    if (!token || !userStr) {
      return { token: null, user: null, isAuthenticated: false };
    }
    const user = JSON.parse(userStr) as User;
    return { token, user, isAuthenticated: true };
  } catch {
    localStorage.removeItem('ecuview_token');
    localStorage.removeItem('ecuview_user');
    return { token: null, user: null, isAuthenticated: false };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  // Hydrate synchronously so hard refresh does not bounce to /login
  ...readAuthFromStorage(),

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
    set(readAuthFromStorage());
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

function readThemeFromStorage(): Theme {
  const stored = localStorage.getItem('ecuview_theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const initialTheme = readThemeFromStorage();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,

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
    const theme = readThemeFromStorage();
    applyTheme(theme);
    set({ theme });
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
