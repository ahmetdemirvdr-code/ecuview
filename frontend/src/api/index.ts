import axios from 'axios';
import type {
  Token,
  FileInfo,
  FileDetail,
  SignalData,
  ChannelStatistics,
  Template,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecuview_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecuview_token');
      localStorage.removeItem('ecuview_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    company?: string;
  }): Promise<Token> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  login: async (username: string, password: string): Promise<Token> => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Files
export const filesAPI = {
  upload: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<FileDetail> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data;
  },

  list: async (): Promise<FileInfo[]> => {
    const res = await api.get('/files/');
    return res.data;
  },

  get: async (fileId: number): Promise<FileDetail> => {
    const res = await api.get(`/files/${fileId}`);
    return res.data;
  },

  delete: async (fileId: number): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },
};

// Analysis
export const analysisAPI = {
  getSignals: async (
    fileId: number,
    channelNames: string[],
    options?: {
      start_time?: number;
      end_time?: number;
      downsample?: number;
    }
  ): Promise<SignalData[]> => {
    const res = await api.post('/analysis/signals', {
      file_id: fileId,
      channel_names: channelNames,
      ...options,
    });
    return res.data;
  },

  compare: async (
    fileIds: number[],
    channelNames: string[],
    normalizeTime: boolean = true
  ) => {
    const res = await api.post('/analysis/compare', {
      file_ids: fileIds,
      channel_names: channelNames,
      normalize_time: normalizeTime,
    });
    return res.data;
  },

  getStatistics: async (
    fileId: number,
    channelNames: string[]
  ): Promise<ChannelStatistics[]> => {
    const res = await api.post('/analysis/statistics', {
      file_id: fileId,
      channel_names: channelNames,
    });
    return res.data;
  },

  exportData: async (
    fileId: number,
    channelNames: string[],
    format: string = 'csv'
  ): Promise<Blob> => {
    const res = await api.post(
      '/analysis/export',
      {
        file_id: fileId,
        channel_names: channelNames,
        format,
      },
      { responseType: 'blob' }
    );
    return res.data;
  },
};

// Templates
export const templatesAPI = {
  list: async (): Promise<Template[]> => {
    const res = await api.get('/templates/');
    return res.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    category?: string;
    config: string;
  }): Promise<Template> => {
    const res = await api.post('/templates/', data);
    return res.data;
  },

  delete: async (templateId: number): Promise<void> => {
    await api.delete(`/templates/${templateId}`);
  },
};

export default api;
