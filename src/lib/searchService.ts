import { SearchResult, FilterConfig, FilterPreset } from '@/types/search';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
}

interface Template {
  id: string;
  name: string;
  type: 'SMS' | 'VOICE';
  content: string;
}

interface Communication {
  id: string;
  type: 'SMS' | 'VOICE';
  content: string;
  status: string;
  sentAt?: string;
  patient: {
    firstName: string;
    lastName: string;
  };
}

export class SearchService {
  static async performGlobalSearch(
    query: string,
    filters: FilterConfig
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Fetch data from APIs with credentials to include authentication cookies
    const [patientsRes, templatesRes, communicationsRes] = await Promise.all([
      fetch('/api/patients', { credentials: 'include' }),
      fetch('/api/templates', { credentials: 'include' }),
      fetch('/api/communications', { credentials: 'include' }),
    ]);

    const patients: Patient[] = patientsRes.ok ? await patientsRes.json() : [];
    const templates: Template[] = templatesRes.ok ? await templatesRes.json() : [];
    const communications: Communication[] = communicationsRes.ok ? await communicationsRes.json() : [];

    // Search patients
    const filteredPatients = this.searchPatients(patients, query, filters);
    results.push(...filteredPatients);

    // Search templates
    const filteredTemplates = this.searchTemplates(templates, query, filters);
    results.push(...filteredTemplates);

    // Search communications
    const filteredCommunications = this.searchCommunications(communications, query, filters);
    results.push(...filteredCommunications);

    return results.slice(0, 50); // Limit results
  }

  private static searchPatients(patients: Patient[], query: string, filters: FilterConfig): SearchResult[] {
    let filtered = patients;

    // Apply filters
    if (filters.patientEnabled?.sms !== undefined) {
      filtered = filtered.filter(p => p.smsEnabled === filters.patientEnabled!.sms);
    }
    if (filters.patientEnabled?.voice !== undefined) {
      filtered = filtered.filter(p => p.voiceEnabled === filters.patientEnabled!.voice);
    }

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm) ||
        patient.phoneNumber.includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm))
      );
    }

    return filtered.map(patient => ({
      type: 'patient' as const,
      id: patient.id,
      title: `${patient.firstName} ${patient.lastName}`,
      subtitle: patient.phoneNumber,
      content: patient.email || 'No email provided',
      metadata: {
        smsEnabled: patient.smsEnabled,
        voiceEnabled: patient.voiceEnabled,
      }
    }));
  }

  private static searchTemplates(templates: Template[], query: string, filters: FilterConfig): SearchResult[] {
    let filtered = templates;

    // Apply communication type filter
    if (filters.communicationType && filters.communicationType.length > 0) {
      filtered = filtered.filter(t => filters.communicationType!.includes(t.type));
    }

    // Apply template type filter
    if (filters.templateType && filters.templateType.length > 0) {
      filtered = filtered.filter(t => filters.templateType!.includes(t.type));
    }

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.content.toLowerCase().includes(searchTerm)
      );
    }

    return filtered.map(template => ({
      type: 'template' as const,
      id: template.id,
      title: template.name,
      subtitle: `${template.type} Template`,
      content: template.content.substring(0, 100) + (template.content.length > 100 ? '...' : ''),
      metadata: {
        type: template.type,
      }
    }));
  }

  private static searchCommunications(communications: Communication[], query: string, filters: FilterConfig): SearchResult[] {
    let filtered = communications;

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(c => filters.status!.includes(c.status));
    }

    // Apply communication type filter
    if (filters.communicationType && filters.communicationType.length > 0) {
      filtered = filtered.filter(c => filters.communicationType!.includes(c.type));
    }

    // Apply date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      filtered = filtered.filter(comm => {
        if (!comm.sentAt) return false;
        const sentDate = new Date(comm.sentAt);
        const startDate = filters.dateRange?.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange?.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && sentDate < startDate) return false;
        if (endDate && sentDate > endDate) return false;
        return true;
      });
    }

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(comm =>
        comm.content.toLowerCase().includes(searchTerm) ||
        comm.patient.firstName.toLowerCase().includes(searchTerm) ||
        comm.patient.lastName.toLowerCase().includes(searchTerm)
      );
    }

    return filtered.map(comm => ({
      type: 'communication' as const,
      id: comm.id,
      title: `${comm.patient.firstName} ${comm.patient.lastName}`,
      subtitle: `${comm.type} - ${comm.status}`,
      content: comm.content.substring(0, 100) + (comm.content.length > 100 ? '...' : ''),
      metadata: {
        type: comm.type,
        status: comm.status,
        sentAt: comm.sentAt || '',
      }
    }));
  }

  static saveFilterPreset(preset: Omit<FilterPreset, 'id' | 'createdAt'>): FilterPreset {
    const newPreset: FilterPreset = {
      ...preset,
      id: `preset_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const savedPresets = this.getSavedPresets();
    savedPresets.push(newPreset);
    localStorage.setItem('search_filter_presets', JSON.stringify(savedPresets));

    return newPreset;
  }

  static getSavedPresets(): FilterPreset[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem('search_filter_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static deleteFilterPreset(presetId: string): void {
    const savedPresets = this.getSavedPresets();
    const filtered = savedPresets.filter(p => p.id !== presetId);
    localStorage.setItem('search_filter_presets', JSON.stringify(filtered));
  }

  static hasActiveFilters(filters: FilterConfig): boolean {
    return !!(
      filters.searchQuery ||
      filters.dateRange?.start ||
      filters.dateRange?.end ||
      (filters.status && filters.status.length > 0) ||
      (filters.communicationType && filters.communicationType.length > 0) ||
      filters.patientEnabled?.sms !== undefined ||
      filters.patientEnabled?.voice !== undefined ||
      (filters.templateType && filters.templateType.length > 0)
    );
  }
}
