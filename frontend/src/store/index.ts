import { create } from 'zustand';
import type { User, FileInfo, FileDetail, Template } from '../types';

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
