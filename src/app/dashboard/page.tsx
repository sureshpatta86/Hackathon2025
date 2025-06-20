'use client';

import { useState, useEffect } from 'react';
import AuthWrapper from '@/components/AuthWrapper';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { useNotification } from '@/components/ui/notification';
import { getAvailableTemplateVariables } from '@/lib/templateVariables';
import { MessageSquare, Phone, Send, Plus, Edit2, Trash2, X } from 'lucide-react';
import {
  OverviewTab,
  SettingsTab
} from '@/components/dashboard';
import { GlobalSearch, AdvancedFilters } from '@/components/search';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { PaginatedTable, TableColumn } from '@/components/ui/PaginatedTable';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
  _count?: {
    appointments: number;
    communications: number;
  };
  [key: string]: unknown;
}

interface Template {
  id: string;
  name: string;
  type: 'SMS' | 'VOICE';
  content: string;
  [key: string]: unknown;
}

interface Communication {
  id: string;
  type: 'SMS' | 'VOICE';
  content: string;
  status: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  template?: {
    id: string;
    name: string;
  };
  [key: string]: unknown;
}

interface PatientGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  patients: {
    id: string;
    patient: {
      id: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
  }[];
  _count: {
    patients: number;
  };
}

interface Analytics {
  stats: {
    totalCommunications: number;
    sms: { total: number; delivered: number; failed: number; pending: number };
    voice: { total: number; delivered: number; failed: number; pending: number };
  };
  successRates: { sms: number; voice: number };
  dailyStats: { date: string; sms: number; voice: number; total: number }[];
  topPatients: { name: string; count: number }[];
  recentFailures: {
    id: string;
    type: string;
    patient: string;
    phoneNumber: string;
    errorMessage: string;
    failedAt: string;
  }[];
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [patientGroups, setPatientGroups] = useState<PatientGroup[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<{
    messagingMode: string;
    twilioConfigured: boolean;
    twilioPhoneNumber: string | null;
  } | null>(null);
  
  // Search queries for individual tables
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [communicationSearchQuery, setCommunicationSearchQuery] = useState('');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  
  const { addNotification } = useNotification();

  // Advanced Search & Filtering
  const search = useAdvancedSearch();

  // Table column definitions
  const patientColumns: TableColumn<Patient>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (patient) => (
        <div>
          <div className="font-medium text-gray-900">
            {patient.firstName} {patient.lastName}
          </div>
          <div className="text-sm text-gray-500">{patient.phoneNumber}</div>
          {patient.email && (
            <div className="text-sm text-gray-500">{patient.email}</div>
          )}
        </div>
      ),
      width: '25%'
    },
    {
      key: 'preferences',
      header: 'Preferences',
      render: (patient) => (
        <div className="flex flex-wrap gap-1">
          {patient.smsEnabled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              SMS
            </span>
          )}
          {patient.voiceEnabled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Voice
            </span>
          )}
        </div>
      ),
      width: '20%'
    },
    {
      key: 'stats',
      header: 'Activity',
      render: (patient) => (
        <div className="text-sm text-gray-500">
          {patient._count ? (
            <>
              <div>{patient._count.appointments} appointments</div>
              <div>{patient._count.communications} messages</div>
            </>
          ) : (
            'No activity'
          )}
        </div>
      ),
      width: '20%'
    }
  ];

  // Communication columns for table
  const communicationColumns: TableColumn<Communication>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (comm) => (
        <div className="flex items-center space-x-2">
          {comm.type === 'SMS' ? (
            <MessageSquare className="h-4 w-4 text-green-500" />
          ) : (
            <Phone className="h-4 w-4 text-purple-500" />
          )}
          <span className="text-sm font-medium">{comm.type}</span>
        </div>
      ),
      width: '10%'
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (comm) => (
        <div>
          <div className="font-medium text-gray-900">
            {comm.patient.firstName} {comm.patient.lastName}
          </div>
          <div className="text-sm text-gray-500">{comm.patient.phoneNumber}</div>
        </div>
      ),
      width: '25%'
    },
    {
      key: 'content',
      header: 'Message',
      render: (comm) => (
        <div>
          <p className="text-sm text-gray-700 line-clamp-2">{comm.content}</p>
          {comm.template && (
            <p className="text-xs text-gray-500 mt-1">Template: {comm.template.name}</p>
          )}
        </div>
      ),
      width: '40%'
    },
    {
      key: 'status',
      header: 'Status',
      render: (comm) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            comm.status === 'DELIVERED'
              ? 'bg-green-100 text-green-800'
              : comm.status === 'SENT'
              ? 'bg-blue-100 text-blue-800'
              : comm.status === 'FAILED'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {comm.status}
        </span>
      ),
      width: '12%'
    },
    {
      key: 'timestamp',
      header: 'Date',
      render: (comm) => (
        <div className="text-xs text-gray-500">
          {comm.deliveredAt && (
            <p>Delivered: {new Date(comm.deliveredAt).toLocaleDateString()}</p>
          )}
          {comm.sentAt && !comm.deliveredAt && (
            <p>Sent: {new Date(comm.sentAt).toLocaleDateString()}</p>
          )}
          {comm.failedAt && (
            <p>Failed: {new Date(comm.failedAt).toLocaleDateString()}</p>
          )}
        </div>
      ),
      width: '13%'
    }
  ];

  // Template columns for table
  const templateColumns: TableColumn<Template>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (template) => (
        <div className="font-medium text-gray-900">{template.name}</div>
      ),
      width: '25%'
    },
    {
      key: 'type',
      header: 'Type',
      render: (template) => (
        <div className="flex items-center space-x-2">
          {template.type === 'SMS' ? (
            <MessageSquare className="h-4 w-4 text-green-500" />
          ) : (
            <Phone className="h-4 w-4 text-purple-500" />
          )}
          <span className="text-sm">{template.type}</span>
        </div>
      ),
      width: '15%'
    },
    {
      key: 'content',
      header: 'Content',
      render: (template) => (
        <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
      ),
      width: '60%'
    }
  ];

  // Bulk messaging state
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [scheduleMessage, setScheduleMessage] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Form states
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'VOICE'>('SMS');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Patient modal state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientModalData, setPatientModalData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    smsEnabled: true,
    voiceEnabled: true,
  });

  // Template modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateModalData, setTemplateModalData] = useState({
    name: '',
    type: 'SMS' as 'SMS' | 'VOICE',
    content: '',
  });
  
  // CSV import state
  const [csvData, setCsvData] = useState('');
  const [skipHeader, setSkipHeader] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Patient Group modal state
  const [isPatientGroupModalOpen, setIsPatientGroupModalOpen] = useState(false);
  const [editingPatientGroup, setEditingPatientGroup] = useState<PatientGroup | null>(null);
  const [patientGroupModalData, setPatientGroupModalData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    patientIds: [] as string[],
  });
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsRes, templatesRes, communicationsRes, groupsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/templates'),
        fetch('/api/communications'),
        fetch('/api/patient-groups'),
      ]);
      
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
      }
      
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData);
      }
      
      if (communicationsRes.ok) {
        const communicationsData = await communicationsRes.json();
        setCommunications(communicationsData);
      }
      
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setPatientGroups(groupsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedPatient || (!selectedTemplate && !customMessage)) return;
    
    try {
      setSending(true);
      const endpoint = messageType === 'SMS' ? '/api/communications/sms' : '/api/communications/voice';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient,
          templateId: selectedTemplate || undefined,
          customMessage: customMessage || undefined,
        }),
      });
      
      if (response.ok) {
        addNotification('success', 'Message sent successfully!');
        setSelectedPatient('');
        setSelectedTemplate('');
        setCustomMessage('');
        fetchData(); // Refresh communication history
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addNotification('error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleBulkSend = async () => {
    if (!customMessage.trim() || (!selectedPatients.length && !selectedGroups.length)) {
      addNotification('error', 'Please select recipients and enter a message');
      return;
    }

    setSending(true);
    try {
      const payload: {
        type: 'SMS' | 'VOICE';
        customMessage: string;
        templateId?: string | null;
        patientIds?: string[];
        groupId?: string;
        scheduleFor?: string;
      } = {
        type: messageType,
        customMessage,
        templateId: selectedTemplate || null,
      };

      if (selectedPatients.length > 0) {
        payload.patientIds = selectedPatients;
      }

      if (selectedGroups.length > 0) {
        payload.groupId = selectedGroups[0]; // For now, support one group at a time
      }

      if (scheduleMessage && scheduledTime) {
        payload.scheduleFor = new Date(scheduledTime).toISOString();
      }

      const response = await fetch('/api/communications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        addNotification('success', result.message);
        setSelectedPatients([]);
        setSelectedGroups([]);
        setCustomMessage('');
        setSelectedTemplate('');
        setScheduleMessage(false);
        setScheduledTime('');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      addNotification('error', 'Failed to send bulk messages');
    } finally {
      setSending(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvData.trim()) {
      addNotification('error', 'Please provide CSV data');
      return;
    }

    setImporting(true);
    try {
      // Parse CSV data
      const lines = csvData.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) {
        addNotification('error', 'No data found in CSV');
        return;
      }

      // Convert to array format expected by the API
      const csvArray = lines.map(line => line.split(',').map(cell => cell.trim()));

      const response = await fetch('/api/patients/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvData: csvArray,
          skipHeader,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setImportResults(result.results);
        addNotification('success', result.message);
        fetchData(); // Refresh patient list
        setCsvData(''); // Clear the CSV data
      } else {
        const error = await response.json();
        addNotification('error', `Import failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      addNotification('error', 'Failed to import CSV data');
    } finally {
      setImporting(false);
    }
  };

  // Patient modal handler functions
  const openAddPatientModal = () => {
    setEditingPatient(null);
    setPatientModalData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      smsEnabled: true,
      voiceEnabled: true,
    });
    setIsPatientModalOpen(true);
  };

  const openEditPatientModal = (patient: Patient) => {
    setEditingPatient(patient);
    setPatientModalData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      phoneNumber: patient.phoneNumber,
      email: patient.email || '',
      smsEnabled: patient.smsEnabled,
      voiceEnabled: patient.voiceEnabled,
    });
    setIsPatientModalOpen(true);
  };

  const closePatientModal = () => {
    setIsPatientModalOpen(false);
    setEditingPatient(null);
    setPatientModalData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      smsEnabled: true,
      voiceEnabled: true,
    });
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validatePhoneNumber(patientModalData.phoneNumber)) {
      addNotification('error', 'Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }
    
    try {
      const isEditing = editingPatient !== null;
      const url = isEditing ? `/api/patients/${editingPatient.id}` : '/api/patients';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientModalData),
      });
      
      if (response.ok) {
        addNotification('success', `Patient ${isEditing ? 'updated' : 'added'} successfully!`);
        closePatientModal();
        fetchData();
      } else {
        const error = await response.json();
        
        // Handle different error response formats
        let errorMessage = 'An error occurred';
        
        if (error.errors) {
          // Validation errors from Zod or custom validation
          const errorMessages = Object.entries(error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = errorMessages;
        } else if (error.error) {
          // Generic error message
          errorMessage = error.error;
        } else if (error.message) {
          // General message
          errorMessage = error.message;
        }
        
        addNotification('error', `Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`Error ${editingPatient ? 'updating' : 'adding'} patient:`, error);
      addNotification('error', `Failed to ${editingPatient ? 'update' : 'add'} patient`);
    }
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete ${patientName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        addNotification('success', 'Patient deleted successfully!');
        fetchData();
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      addNotification('error', 'Failed to delete patient');
    }
  };

  // Template modal handler functions
  const openAddTemplateModal = () => {
    setEditingTemplate(null);
    setTemplateModalData({
      name: '',
      type: 'SMS',
      content: '',
    });
    setIsTemplateModalOpen(true);
  };

  const openEditTemplateModal = (template: Template) => {
    setEditingTemplate(template);
    setTemplateModalData({
      name: template.name,
      type: template.type,
      content: template.content,
    });
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
    setTemplateModalData({
      name: '',
      type: 'SMS',
      content: '',
    });
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!templateModalData.name.trim()) {
      addNotification('error', 'Template name is required');
      return;
    }
    
    if (!templateModalData.content.trim()) {
      addNotification('error', 'Template content is required');
      return;
    }
    
    if (templateModalData.content.length > 1600) {
      addNotification('error', 'Template content must be at most 1600 characters');
      return;
    }
    
    try {
      const url = '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      const body = editingTemplate 
        ? { id: editingTemplate.id, ...templateModalData }
        : templateModalData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        addNotification('success', `Template ${editingTemplate ? 'updated' : 'created'} successfully!`);
        closeTemplateModal();
        fetchData();
      } else {
        const error = await response.json();
        
        // Handle different error response formats
        let errorMessage = 'An error occurred';
        
        if (error.errors) {
          // Validation errors from Zod or custom validation
          const errorMessages = Object.entries(error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = errorMessages;
        } else if (error.error) {
          // Generic error message
          errorMessage = error.error;
        } else if (error.message) {
          // General message
          errorMessage = error.message;
        }
        
        addNotification('error', `Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`Error ${editingTemplate ? 'updating' : 'adding'} template:`, error);
      addNotification('error', `Failed to ${editingTemplate ? 'update' : 'add'} template`);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/templates?id=${templateId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        addNotification('success', 'Template deleted successfully!');
        fetchData();
      } else {
        const error = await response.json();
        
        // Handle different error response formats
        let errorMessage = 'An error occurred';
        
        if (error.errors) {
          // Validation errors from Zod or custom validation
          const errorMessages = Object.entries(error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = errorMessages;
        } else if (error.error) {
          // Generic error message
          errorMessage = error.error;
        } else if (error.message) {
          // General message
          errorMessage = error.message;
        }
        
        addNotification('error', `Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      addNotification('error', 'Failed to delete template');
    }
  };

  // Phone number formatting helper
  const formatPhoneInput = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add + prefix if not present
    if (digits && !value.startsWith('+')) {
      return '+' + digits;
    }
    
    return value;
  };

  const validatePhoneNumber = (phone: string) => {
    // Basic validation: should start with + followed by 1-3 digit country code and 7-15 total digits
    const phoneRegex = /^\+[1-9]\d{7,15}$/;
    return phoneRegex.test(phone);
  };

  // Patient Group modal handler functions
  const openAddPatientGroupModal = () => {
    setEditingPatientGroup(null);
    setPatientGroupModalData({
      name: '',
      description: '',
      color: '#3B82F6',
      patientIds: [],
    });
    setIsPatientGroupModalOpen(true);
  };

  const openEditPatientGroupModal = (group: PatientGroup) => {
    setEditingPatientGroup(group);
    setPatientGroupModalData({
      name: group.name,
      description: group.description || '',
      color: group.color,
      patientIds: group.patients.map(p => p.patient.id),
    });
    setIsPatientGroupModalOpen(true);
  };

  const closePatientGroupModal = () => {
    setIsPatientGroupModalOpen(false);
    setEditingPatientGroup(null);
    setPatientGroupModalData({
      name: '',
      description: '',
      color: '#3B82F6',
      patientIds: [],
    });
  };

  const handlePatientGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!patientGroupModalData.name.trim()) {
      addNotification('error', 'Group name is required');
      return;
    }
    
    try {
      const isEditing = editingPatientGroup !== null;
      const url = '/api/patient-groups';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { id: editingPatientGroup.id, ...patientGroupModalData }
        : patientGroupModalData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        await response.json();
        addNotification('success', `Group ${isEditing ? 'updated' : 'created'} successfully!`);
        closePatientGroupModal();
        fetchData();
      } else {
        const error = await response.json();
        
        // Handle different error response formats
        let errorMessage = 'An error occurred';
        
        if (error.errors) {
          // Validation errors from Zod or custom validation
          const errorMessages = Object.entries(error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = errorMessages;
        } else if (error.error) {
          // Generic error message
          errorMessage = error.error;
        } else if (error.message) {
          // General message
          errorMessage = error.message;
        }
        
        addNotification('error', `Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`Error ${editingPatientGroup ? 'updating' : 'creating'} group:`, error);
      addNotification('error', `Failed to ${editingPatientGroup ? 'update' : 'create'} group`);
    }
  };

  const handleDeletePatientGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/patient-groups?id=${groupId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        addNotification('success', 'Patient group deleted successfully!');
        fetchData();
      } else {
        const error = await response.json();
        
        // Handle different error response formats
        let errorMessage = 'An error occurred';
        
        if (error.errors) {
          // Validation errors from Zod or custom validation
          const errorMessages = Object.entries(error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = errorMessages;
        } else if (error.error) {
          // Generic error message
          errorMessage = error.error;
        } else if (error.message) {
          // General message
          errorMessage = error.message;
        }
        
        addNotification('error', `Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      addNotification('error', 'Failed to delete patient group');
    }
  };

  const filteredTemplates = templates.filter(t => t.type === messageType);
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  // Load analytics when analytics tab is opened
  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) {
      const loadAnalytics = async () => {
        try {
          const res = await fetch('/api/analytics');
          if (res.ok) {
            const data = await res.json();
            setAnalytics(data);
          }
        } catch (error) {
          console.error('Error loading analytics:', error);
        }
      };
      loadAnalytics();
    }
  }, [activeTab, analytics]);

  // Settings actions
  const fetchSettingsAction = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const setActiveTabAction = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation variant="dashboard" />
        
        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto py-4 scrollbar-hide">
              <Button
                variant={activeTab === 'dashboard' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('dashboard')}
                size="sm"
                className="flex-shrink-0"
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === 'send' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('send')}
                size="sm"
                className="flex-shrink-0"
              >
                Send
              </Button>
              <Button
                variant={activeTab === 'bulk' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('bulk')}
                size="sm"
                className="flex-shrink-0"
              >
                Bulk
              </Button>
              <Button
                variant={activeTab === 'patients' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('patients')}
                size="sm"
                className="flex-shrink-0"
              >
                Patients
              </Button>
              <Button
                variant={activeTab === 'groups' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('groups')}
                size="sm"
                className="flex-shrink-0"
              >
                Groups
              </Button>
              <Button
                variant={activeTab === 'analytics' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('analytics')}
                size="sm"
                className="flex-shrink-0"
              >
                Analytics
              </Button>
              <Button
                variant={activeTab === 'templates' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('templates')}
                size="sm"
                className="flex-shrink-0"
              >
                Templates
              </Button>
              <Button
                variant={activeTab === 'history' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('history')}
                size="sm"
                className="flex-shrink-0"
              >
                History
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('settings')}
                size="sm"
                className="flex-shrink-0"
              >
                Settings
              </Button>
            </nav>
          </div>
        </div>

        {/* Global Search */}
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center">
              <GlobalSearch
                onSearch={search.performSearch}
                onFiltersToggle={search.toggleAdvancedFilters}
                filters={search.filters}
                hasActiveFilters={search.hasActiveFilters}
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters Modal */}
        <AdvancedFilters
          filters={search.filters}
          onFiltersChange={search.updateFilters}
          onSavePreset={search.savePreset}
          onLoadPreset={search.loadPreset}
          onDeletePreset={search.deletePreset}
          savedPresets={search.savedPresets}
          isOpen={search.showAdvancedFilters}
          onClose={search.toggleAdvancedFilters}
        />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <OverviewTab 
            patients={patients}
            templates={templates}
            communications={communications}
          />
        )}

        {activeTab === 'send' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Send Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Message Type Selection */}
                <div className="flex space-x-4">
                  <Button
                    variant={messageType === 'SMS' ? 'primary' : 'outline'}
                    onClick={() => setMessageType('SMS')}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    variant={messageType === 'VOICE' ? 'primary' : 'outline'}
                    onClick={() => setMessageType('VOICE')}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Voice Call
                  </Button>
                </div>

                {/* Patient Selection */}
                <Select
                  label="Select Patient"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">Choose a patient...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.phoneNumber}
                    </option>
                  ))}
                </Select>

                {/* Template Selection */}
                <Select
                  label="Template (Optional)"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Custom message...</option>
                  {filteredTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Select>

                {/* Message Content */}
                <Textarea
                  label="Message"
                  value={selectedTemplateData ? selectedTemplateData.content : customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Enter your ${messageType.toLowerCase()} message here...`}
                  rows={4}
                  disabled={!!selectedTemplateData}
                />

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={!selectedPatient || (!selectedTemplate && !customMessage) || sending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : `Send ${messageType}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Messaging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Message Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message Type</label>
                  <Select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as 'SMS' | 'VOICE')}
                  >
                    <option value="SMS">SMS Message</option>
                    <option value="VOICE">Voice Call</option>
                  </Select>
                </div>

                {/* Recipient Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">Recipients</label>
                  
                  {/* Individual Patients */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Select Individual Patients</h4>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                      {patients.map((patient) => (
                        <label key={patient.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedPatients.includes(patient.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPatients([...selectedPatients, patient.id]);
                              } else {
                                setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-900">
                            {patient.firstName} {patient.lastName} ({patient.phoneNumber})
                            {messageType === 'SMS' && !patient.smsEnabled && 
                              <span className="text-red-500 ml-1">(SMS disabled)</span>}
                            {messageType === 'VOICE' && !patient.voiceEnabled && 
                              <span className="text-red-500 ml-1">(Voice disabled)</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Patient Groups */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Select Patient Groups</h4>
                    <div className="space-y-2">
                      {patientGroups.map((group) => (
                        <label key={group.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroups([...selectedGroups, group.id]);
                              } else {
                                setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: group.color }}
                          ></span>
                          <span className="text-sm text-gray-900">
                            {group.name} ({group._count.patients} patients)
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message Template</label>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      const template = templates.find(t => t.id === e.target.value && t.type === messageType);
                      if (template) {
                        setCustomMessage(template.content);
                      }
                    }}
                  >
                    <option value="">Select a template (optional)</option>
                    {templates
                      .filter(template => template.type === messageType)
                      .map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                  </Select>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message Content</label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={`Enter your ${messageType.toLowerCase()} message here...`}
                    rows={4}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    Available variables: {'{firstName}'}, {'{lastName}'}, {'{fullName}'}
                  </div>
                </div>

                {/* Scheduling Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Delivery Options</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={!scheduleMessage}
                        onChange={() => setScheduleMessage(false)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-900">Send immediately</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={scheduleMessage}
                        onChange={() => setScheduleMessage(true)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-900">Schedule for later</span>
                    </label>
                    {scheduleMessage && (
                      <div className="ml-6 space-y-2">
                        <Input
                          type="datetime-local"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleBulkSend}
                  disabled={sending || (!selectedPatients.length && !selectedGroups.length) || !customMessage.trim()}
                  className="w-full"
                  variant="primary"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : scheduleMessage ? 'Schedule Messages' : `Send Bulk ${messageType}`}
                </Button>

                {/* Summary */}
                {(selectedPatients.length > 0 || selectedGroups.length > 0) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Delivery Summary</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      {selectedPatients.length > 0 && (
                        <p>Individual patients: {selectedPatients.length}</p>
                      )}
                      {selectedGroups.length > 0 && (
                        <p>Patient groups: {selectedGroups.length} ({patientGroups.filter(g => selectedGroups.includes(g.id)).reduce((sum, g) => sum + g._count.patients, 0)} patients)</p>
                      )}
                      <p className="font-medium">
                        Total recipients: {selectedPatients.length + patientGroups.filter(g => selectedGroups.includes(g.id)).reduce((sum, g) => sum + g._count.patients, 0)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CSV Import */}
            <Card>
              <CardHeader>
                <CardTitle>Import Patients from CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CSV Data</label>
                  <Textarea
                    placeholder="Paste CSV data here or drag and drop a file..."
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    rows={6}
                    className="w-full font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500">
                    Expected format: firstName, lastName, phoneNumber, email, smsEnabled, voiceEnabled, medicalNotes
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skipHeader"
                    checked={skipHeader}
                    onChange={(e) => setSkipHeader(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="skipHeader" className="text-sm text-gray-700">
                    Skip header row
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleCsvImport}
                    disabled={!csvData.trim() || importing}
                    variant="primary"
                  >
                    {importing ? 'Importing...' : 'Import Patients'}
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/patients/import/template');
                        const data = await res.json();
                        const csvTemplate = data.template.map((row: string[]) => row.join(',')).join('\\n');
                        setCsvData(csvTemplate);
                        addNotification('info', 'Template loaded - edit as needed');
                      } catch (error) {
                        console.error('Error loading template:', error);
                        addNotification('error', 'Failed to load template');
                      }
                    }}
                    variant="outline"
                  >
                    Load Template
                  </Button>
                </div>

                {importResults && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Import Results</h4>
                    <div className="text-sm space-y-1">
                      <p className="text-green-600">✓ Successfully imported: {importResults.successful}</p>
                      <p className="text-red-600">✗ Failed: {importResults.failed}</p>
                      <p className="text-gray-600">Total processed: {importResults.total}</p>
                    </div>
                    {importResults.errors.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-red-800 mb-1">Errors:</h5>
                        <div className="text-xs text-red-600 space-y-1 max-h-20 overflow-y-auto">
                          {importResults.errors.slice(0, 5).map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                          {importResults.errors.length > 5 && (
                            <p>... and {importResults.errors.length - 5} more errors</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-8">
            {/* Patients Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
              <Button onClick={openAddPatientModal} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>

            {/* Patient Search */}
            <Card>
              <CardContent className="p-4">
                <Input
                  type="text"
                  placeholder="Search patients by name, phone, or email..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Patients Table */}
            <PaginatedTable<Patient>
              data={patients}
              columns={patientColumns}
              title={`All Patients (${patients.length})`}
              itemsPerPage={10}
              searchQuery={patientSearchQuery}
              emptyMessage="No patients added yet."
              actions={(patient) => (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditPatientModal(patient)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePatient(patient.id, `${patient.firstName} ${patient.lastName}`)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              headerActions={
                patients.length === 0 ? (
                  <Button onClick={openAddPatientModal} variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Patient
                  </Button>
                ) : null
              }
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8">
            {/* Communication History Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Communication History</h2>
            </div>

            {/* Communication Search */}
            <Card>
              <CardContent className="p-4">
                <Input
                  type="text"
                  placeholder="Search communications by patient name, content, or status..."
                  value={communicationSearchQuery}
                  onChange={(e) => setCommunicationSearchQuery(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Communications Table */}
            <PaginatedTable<Communication>
              data={communications}
              columns={communicationColumns}
              title={`Communications (${communications.length})`}
              itemsPerPage={10}
              searchQuery={communicationSearchQuery}
              emptyMessage="No communications sent yet."
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-8">
            {/* Template Management Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Template Management</h2>
              <Button onClick={openAddTemplateModal} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </div>

            {/* Template Search */}
            <Card>
              <CardContent className="p-4">
                <Input
                  type="text"
                  placeholder="Search templates by name, type, or content..."
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Templates Table */}
            <PaginatedTable<Template>
              data={templates}
              columns={templateColumns}
              title={`All Templates (${templates.length})`}
              itemsPerPage={10}
              searchQuery={templateSearchQuery}
              emptyMessage="No templates created yet."
              actions={(template) => (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditTemplateModal(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              headerActions={
                templates.length === 0 ? (
                  <Button onClick={openAddTemplateModal} variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                ) : null
              }
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Communication Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Communications */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900">Total Communications</h3>
                    <p className="text-3xl font-bold text-blue-700">{analytics?.stats.totalCommunications || 0}</p>
                    <p className="text-sm text-blue-600 mt-2">All time messages sent</p>
                  </div>

                  {/* SMS Stats */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900">SMS Messages</h3>
                    <p className="text-3xl font-bold text-green-700">{analytics?.stats.sms.total || 0}</p>
                    <div className="text-sm text-green-600 mt-2">
                      <p>Delivered: {analytics?.stats.sms.delivered || 0}</p>
                      <p>Failed: {analytics?.stats.sms.failed || 0}</p>
                      <p>Success Rate: {analytics?.successRates.sms || 0}%</p>
                    </div>
                  </div>

                  {/* Voice Stats */}
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900">Voice Calls</h3>
                    <p className="text-3xl font-bold text-purple-700">{analytics?.stats.voice.total || 0}</p>
                    <div className="text-sm text-purple-600 mt-2">
                      <p>Delivered: {analytics?.stats.voice.delivered || 0}</p>
                      <p>Failed: {analytics?.stats.voice.failed || 0}</p>
                      <p>Success Rate: {analytics?.successRates.voice || 0}%</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Chart */}
                {analytics?.dailyStats && analytics.dailyStats.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity (Last 30 Days)</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-7 gap-2 text-xs">
                        {analytics.dailyStats.slice(-7).map((day, index) => (
                          <div key={index} className="text-center">
                            <div className="font-medium text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div className="bg-blue-200 rounded mt-1" style={{ height: `${Math.max(20, (day.total / Math.max(...analytics.dailyStats.map(d => d.total), 1)) * 60)}px` }}>
                              <div className="text-xs font-medium pt-1 text-blue-800">{day.total}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Patients */}
                {analytics?.topPatients && analytics.topPatients.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Patients</h3>
                    <div className="space-y-2">
                      {analytics.topPatients.slice(0, 5).map((patient, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{patient.name}</span>
                          <span className="text-sm text-gray-600">{patient.count} messages</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Failures */}
                {analytics?.recentFailures && analytics.recentFailures.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Recent Failures</h3>
                    <div className="space-y-2">
                      {analytics.recentFailures.slice(0, 3).map((failure, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="font-medium text-red-800">{failure.patient}</div>
                          <div className="text-sm text-red-600">{failure.type} to {failure.phoneNumber}</div>
                          <div className="text-xs text-red-500">{failure.errorMessage}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refresh Button */}
                <div className="mt-8">
                  <Button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/analytics');
                        if (res.ok) {
                          const data = await res.json();
                          setAnalytics(data);
                          addNotification('success', 'Analytics refreshed');
                        }
                      } catch (error) {
                        console.error('Error refreshing analytics:', error);
                        addNotification('error', 'Failed to refresh analytics');
                      }
                    }}
                    variant="outline"
                  >
                    Refresh Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-8">
            {/* Add New Group Button */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Patient Group Management</span>
                  <Button onClick={openAddPatientGroupModal} variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Group
                  </Button>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Existing Groups */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Groups ({patientGroups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientGroups.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No patient groups created yet.</p>
                      <Button onClick={openAddPatientGroupModal} variant="primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Group
                      </Button>
                    </div>
                  ) : (
                    patientGroups.map((group) => (
                      <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: group.color }}
                            ></div>
                            <div>
                              <h3 className="font-medium text-gray-900">{group.name}</h3>
                              {group.description && (
                                <p className="text-sm text-gray-600">{group.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {group._count.patients} patients
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  // Quick bulk message to group
                                  setSelectedGroups([group.id]);
                                  setActiveTab('bulk');
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Message Group
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditPatientGroupModal(group)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePatientGroup(group.id, group.name)}
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {group.patients.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Patients:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {group.patients.slice(0, 6).map((member) => (
                                <div key={member.id} className="text-sm text-gray-900">
                                  {member.patient.firstName} {member.patient.lastName}
                                </div>
                              ))}
                              {group.patients.length > 6 && (
                                <div className="text-sm text-gray-500">
                                  ... and {group.patients.length - 6} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            settings={settings}
            fetchSettingsAction={fetchSettingsAction}
            setActiveTabAction={setActiveTabAction}
          />
        )}
      </main>

      {/* Patient Modal */}
      {isPatientModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closePatientModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                </h2>
                <button
                  onClick={closePatientModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePatient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name *"
                    value={patientModalData.firstName}
                    onChange={(e) => setPatientModalData({ ...patientModalData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name *"
                    value={patientModalData.lastName}
                    onChange={(e) => setPatientModalData({ ...patientModalData, lastName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number *"
                    type="tel"
                    value={patientModalData.phoneNumber}
                    onChange={(e) => setPatientModalData({ ...patientModalData, phoneNumber: formatPhoneInput(e.target.value) })}
                    placeholder="+1234567890"
                    required
                  />
                  <Input
                    label="Email (Optional)"
                    type="email"
                    value={patientModalData.email}
                    onChange={(e) => setPatientModalData({ ...patientModalData, email: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="smsEnabled"
                      checked={patientModalData.smsEnabled}
                      onChange={(e) => setPatientModalData({ ...patientModalData, smsEnabled: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="smsEnabled" className="text-sm text-gray-700">
                      SMS Enabled
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="voiceEnabled"
                      checked={patientModalData.voiceEnabled}
                      onChange={(e) => setPatientModalData({ ...patientModalData, voiceEnabled: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="voiceEnabled" className="text-sm text-gray-700">
                      Voice Enabled
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    {editingPatient ? 'Update Patient' : 'Add Patient'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closePatientModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeTemplateModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingTemplate ? 'Edit Template' : 'Add New Template'}
                </h2>
                <button
                  onClick={closeTemplateModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Template Name *"
                    value={templateModalData.name}
                    onChange={(e) => setTemplateModalData({ ...templateModalData, name: e.target.value })}
                    placeholder="e.g., Appointment Reminder"
                    required
                  />
                  <Select
                    label="Template Type *"
                    value={templateModalData.type}
                    onChange={(e) => setTemplateModalData({ ...templateModalData, type: e.target.value as 'SMS' | 'VOICE' })}
                  >
                    <option value="SMS">SMS Message</option>
                    <option value="VOICE">Voice Call</option>
                  </Select>
                </div>
                
                <Textarea
                  label="Template Content *"
                  value={templateModalData.content}
                  onChange={(e) => setTemplateModalData({ ...templateModalData, content: e.target.value })}
                  placeholder="Enter your message template here. Use variables like {firstName}, {lastName}, etc."
                  rows={4}
                  required
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Available Variables ({Object.keys(getAvailableTemplateVariables()).length} total):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs max-h-48 overflow-y-auto">
                    {Object.entries(getAvailableTemplateVariables()).map(([variable, description]) => (
                      <div key={variable} className="flex items-start">
                        <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono mr-2 whitespace-nowrap">
                          {variable}
                        </code>
                        <span className="text-blue-700 text-xs">{description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeTemplateModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Patient Group Modal */}
      {isPatientGroupModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closePatientGroupModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingPatientGroup ? 'Edit Patient Group' : 'Add New Patient Group'}
                </h2>
                <button
                  onClick={closePatientGroupModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePatientGroupSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Group Name *</label>
                    <Input
                      value={patientGroupModalData.name}
                      onChange={(e) => setPatientGroupModalData({ ...patientGroupModalData, name: e.target.value })}
                      placeholder="e.g., Diabetes Patients"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Color</label>
                    <Input
                      type="color"
                      value={patientGroupModalData.color}
                      onChange={(e) => setPatientGroupModalData({ ...patientGroupModalData, color: e.target.value })}
                      className="w-20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Textarea
                    value={patientGroupModalData.description}
                    onChange={(e) => setPatientGroupModalData({ ...patientGroupModalData, description: e.target.value })}
                    placeholder="Optional description for this group"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Add Patients to Group</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                    {patients.map((patient) => (
                      <label key={patient.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={patientGroupModalData.patientIds.includes(patient.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPatientGroupModalData({
                                ...patientGroupModalData,
                                patientIds: [...patientGroupModalData.patientIds, patient.id]
                              });
                            } else {
                              setPatientGroupModalData({
                                ...patientGroupModalData,
                                patientIds: patientGroupModalData.patientIds.filter(id => id !== patient.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-900">
                          {patient.firstName} {patient.lastName} ({patient.phoneNumber})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    {editingPatientGroup ? 'Update Group' : 'Create Group'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closePatientGroupModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthWrapper>
  );
}
