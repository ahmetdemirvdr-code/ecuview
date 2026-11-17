// API types matching backend schemas

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  company: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ChannelInfo {
  id: number;
  name: string;
  unit: string | null;
  group_index: number;
  sample_count: number | null;
  sample_rate_hz: number | null;
  min_value: number | null;
  max_value: number | null;
  category: string | null;
}

export interface FileInfo {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  file_format: string;
  mdf_version: string | null;
  recording_date: string | null;
  recording_time: string | null;
  duration_seconds: number | null;
  channel_count: number | null;
  group_count: number | null;
  program: string | null;
  created_at: string;
}

export interface FileDetail extends FileInfo {
  channels: ChannelInfo[];
}

export interface StorageQuota {
  used_bytes: number;
  max_bytes: number;
  remaining_bytes: number;
  max_file_bytes: number;
  used_human: string;
  max_human: string;
  remaining_human: string;
  max_file_human: string;
}

export interface SignalData {
  name: string;
  unit: string | null;
  timestamps: number[];
  values: number[];
  min: number;
  max: number;
  mean: number;
  std: number;
  sample_count: number;
  error?: string;
}

export interface ChannelStatistics {
  name: string;
  unit: string | null;
  min: number;
  max: number;
  mean: number;
  std: number;
  median: number;
  sample_count: number;
  duration: number;
  sample_rate: number;
}

export interface TemplateChannel {
  name: string;
  label: string;
  color: string;
  yAxis: number;
}

export interface TemplateConfig {
  channels: TemplateChannel[];
  layout: {
    title: string;
    yAxes: string[];
  };
}

export interface Template {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  is_system: boolean;
  config: string;
  created_at: string;
}

// Category display names (Turkish)
export const CATEGORY_LABELS: Record<string, string> = {
  engine: 'Motor',
  injection: 'Enjeksiyon',
  rail: 'Rail Basinc',
  governor: 'Governor',
  temperature: 'Sicaklik',
  pressure: 'Basinc',
  pedal: 'Gaz Pedali',
  battery: 'Akue',
  vehicle: 'Arac',
  fuel_system: 'Yakit Sistemi',
  protection: 'Motor Koruma',
  diagnostics: 'Ariza/Hata',
  metering_unit: 'Olcu Birimi',
  sensor_raw: 'Ham Sensor',
  other: 'Diger',
};

// Chart color palette
export const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
  '#6366f1', '#84cc16', '#e11d48', '#0ea5e9', '#d946ef',
];
