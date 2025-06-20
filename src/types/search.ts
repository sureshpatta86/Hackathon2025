export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: FilterConfig;
  createdAt: string;
  isDefault?: boolean;
}

export interface FilterConfig {
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  communicationType?: string[];
  patientEnabled?: {
    sms?: boolean;
    voice?: boolean;
  };
  templateType?: string[];
}

export interface SearchResult {
  type: 'patient' | 'template' | 'communication';
  id: string;
  title: string;
  subtitle: string;
  content: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AdvancedFiltersProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  onSavePreset: (name: string, description?: string) => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onDeletePreset: (presetId: string) => void;
  savedPresets: FilterPreset[];
  isOpen: boolean;
  onClose: () => void;
}
