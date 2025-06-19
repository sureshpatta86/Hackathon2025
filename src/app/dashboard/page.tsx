'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthWrapper from '@/components/AuthWrapper';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { useNotification } from '@/components/ui/notification';
import { getAvailableTemplateVariables } from '@/lib/templateVariables';
import { ValidatedForm, ValidatedInput, ValidatedSelect, ValidatedTextarea } from '@/components/ui/validation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createPatientSchema, updatePatientSchema, createTemplateSchema, updateTemplateSchema, sendCommunicationSchema } from '@/lib/validation';
import { MessageSquare, Phone, Users, Send, Plus, BarChart3, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle, Calendar, Settings, Info, Edit2, Trash2, Save, X } from 'lucide-react';

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
  phoneNumber: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  patient: Patient;
}

interface PatientGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  _count: {
    patients: number;
  };
  patients: Array<{
    id: string;
    patient: Patient;
  }>;
}

interface Analytics {
  stats: {
    totalCommunications: number;
    sms: {
      total: number;
      delivered: number;
      failed: number;
      pending: number;
    };
    voice: {
      total: number;
      delivered: number;
      failed: number;
      pending: number;
    };
  };
  successRates: {
    sms: number;
    voice: number;
  };
  dailyStats: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
  topPatients: Array<{
    name: string;
    count: number;
  }>;
  recentFailures: Array<{
    id: string;
    type: 'SMS' | 'VOICE';
    patient: string;
    phoneNumber: string;
    errorMessage: string;
    failedAt: string;
  }>;
  dateRange: {
    from: string;
    to: string;
    days: number;
  };
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30'); // days
  const [settings, setSettings] = useState<{
    messagingMode: string;
    twilioConfigured: boolean;
    twilioPhoneNumber: string | null;
  } | null>(null);
  const { addNotification } = useNotification();

  // Validation hooks
  const newPatientValidation = useFormValidation(createPatientSchema);
  const editPatientValidation = useFormValidation(updatePatientSchema);
  const newTemplateValidation = useFormValidation(createTemplateSchema);
  const editTemplateValidation = useFormValidation(updateTemplateSchema);
  const sendMessageValidation = useFormValidation(sendCommunicationSchema);

  // Form states
  const [selectedPatient, setSelectedPatient] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'VOICE'>('SMS');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  // New patient form
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    smsEnabled: true,
    voiceEnabled: false,
  });
  const [addingPatient, setAddingPatient] = useState(false);

  // Edit patient form
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editPatientData, setEditPatientData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    smsEnabled: true,
    voiceEnabled: false,
  });

  // New template form
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'SMS' as 'SMS' | 'VOICE',
    content: '',
  });
  const [addingTemplate, setAddingTemplate] = useState(false);

  // Edit template form
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editTemplateData, setEditTemplateData] = useState({
    name: '',
    type: 'SMS' as 'SMS' | 'VOICE',
    content: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [patientsRes, templatesRes, communicationsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/templates'),
        fetch('/api/communications'),
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
    } catch (error) {
      console.error('Error fetching data:', error);
      addNotification('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics?days=${analyticsDateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [analyticsDateRange]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  // Load analytics when analytics tab is opened or date range changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, fetchAnalytics]);

  // Load settings when settings tab is opened
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, fetchSettings]);

  // Load settings on component mount to show correct mode indicator
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSendMessage = async () => {
    if (!selectedPatient || (!selectedTemplate && !customMessage.trim())) {
      addNotification('error', 'Please select a patient and provide a message');
      return;
    }

    setSending(true);
    try {
      const patient = patients.find(p => p.id === selectedPatient);
      if (!patient) return;

      const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
      const content = selectedTemplateData ? selectedTemplateData.content : customMessage;

      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient,
          type: messageType,
          content,
          phoneNumber: patient.phoneNumber,
        }),
      });

      if (response.ok) {
        addNotification('success', 'Message sent successfully!');
        setSelectedPatient('');
        setSelectedTemplate('');
        setCustomMessage('');
        fetchData(); // Refresh data
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

  const handleAddPatient = async () => {
    const validation = newPatientValidation.validate(newPatient);
    
    if (!validation.isValid) {
      addNotification('error', 'Please fix the validation errors below');
      return;
    }

    setAddingPatient(true);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      if (response.ok) {
        addNotification('success', 'Patient added successfully!');
        setNewPatient({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: '',
          smsEnabled: true,
          voiceEnabled: false,
        });
        fetchData(); // Refresh patient list
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      addNotification('error', 'Failed to add patient');
    } finally {
      setAddingPatient(false);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setEditPatientData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      phoneNumber: patient.phoneNumber,
      email: patient.email || '',
      smsEnabled: patient.smsEnabled,
      voiceEnabled: patient.voiceEnabled,
    });
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient || !editPatientData.firstName || !editPatientData.lastName || !editPatientData.phoneNumber) {
      addNotification('error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPatient.id,
          ...editPatientData,
        }),
      });

      if (response.ok) {
        addNotification('success', 'Patient updated successfully!');
        setEditingPatient(null);
        fetchData(); // Refresh patient list
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      addNotification('error', 'Failed to update patient');
    }
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete patient "${patientName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/patients?id=${patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addNotification('success', 'Patient deleted successfully!');
        fetchData(); // Refresh patient list
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      addNotification('error', 'Failed to delete patient');
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      addNotification('error', 'Please fill in all fields');
      return;
    }

    setAddingTemplate(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      if (response.ok) {
        addNotification('success', 'Template added successfully!');
        setNewTemplate({
          name: '',
          type: 'SMS',
          content: '',
        });
        fetchData(); // Refresh templates
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding template:', error);
      addNotification('error', 'Failed to add template');
    } finally {
      setAddingTemplate(false);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setEditTemplateData({
      name: template.name,
      type: template.type as 'SMS' | 'VOICE',
      content: template.content,
    });
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !editTemplateData.name || !editTemplateData.content) {
      addNotification('error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTemplate.id,
          ...editTemplateData,
        }),
      });

      if (response.ok) {
        addNotification('success', 'Template updated successfully!');
        setEditingTemplate(null);
        fetchData(); // Refresh templates
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      addNotification('error', 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete template "${templateName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/templates?id=${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addNotification('success', 'Template deleted successfully!');
        fetchData(); // Refresh templates
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      addNotification('error', 'Failed to delete template');
    }
  };

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AuthWrapper>
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
            <nav className="flex space-x-2 overflow-x-auto py-4">
              <Button
                variant={activeTab === 'dashboard' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('dashboard')}
                size="sm"
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === 'send' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('send')}
                size="sm"
              >
                Send Message
              </Button>
              <Button
                variant={activeTab === 'patients' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('patients')}
                size="sm"
              >
                Patients
              </Button>
              <Button
                variant={activeTab === 'templates' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('templates')}
                size="sm"
              >
                Templates
              </Button>
              <Button
                variant={activeTab === 'communications' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('communications')}
                size="sm"
              >
                History
              </Button>
              <Button
                variant={activeTab === 'analytics' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('analytics')}
                size="sm"
              >
                Analytics
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('settings')}
                size="sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Messaging Mode Indicator */}
          {settings && (
            <div className={`mb-6 p-3 border rounded-lg ${
              settings.messagingMode === 'live' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  settings.messagingMode === 'live' ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>
                <p className={`text-sm ${
                  settings.messagingMode === 'live' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  <strong>{settings.messagingMode === 'live' ? 'Live Mode:' : 'Demo Mode:'}</strong> {
                    settings.messagingMode === 'live' 
                      ? 'Messages will be sent to real phone numbers via Twilio. Make sure phone numbers are valid and you have Twilio credits.'
                      : 'Messages are simulated and not actually sent to phones. To enable real messaging, configure Twilio in Settings.'
                  }
                </p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Patients</p>
                        <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <MessageSquare className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                        <p className="text-2xl font-bold text-gray-900">{communications.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Templates</p>
                        <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {communications.length > 0 
                            ? Math.round((communications.filter(c => c.status === 'DELIVERED').length / communications.length) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Communications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {communications.slice(0, 5).map((comm) => (
                      <div key={comm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {comm.type === 'SMS' ? (
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Phone className="h-5 w-5 text-green-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {comm.patient.firstName} {comm.patient.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{comm.content.substring(0, 50)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            comm.status === 'DELIVERED' 
                              ? 'bg-green-100 text-green-800'
                              : comm.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {comm.status}
                          </span>
                          {comm.sentAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comm.sentAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {communications.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No communications yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'send' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Patient</label>
                    <Select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} ({patient.phoneNumber})
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Message Type</label>
                    <Select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value as 'SMS' | 'VOICE')}
                    >
                      <option value="SMS">SMS</option>
                      <option value="VOICE">Voice Call</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Template (Optional)</label>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    <option value="">Choose a template or write custom message...</option>
                    {templates
                      .filter(template => template.type === messageType)
                      .map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message Content</label>
                  <Textarea
                    value={selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.content || '' : customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    disabled={!!selectedTemplate}
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={sending}
                  variant="primary"
                  className="w-full"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-8">
              {/* Add New Patient */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Add New Patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ValidatedForm 
                    errors={newPatientValidation.errors}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddPatient();
                    }}
                    isLoading={addingPatient}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ValidatedInput
                        label="First Name"
                        name="firstName"
                        value={newPatient.firstName}
                        onChange={(value) => {
                          setNewPatient({ ...newPatient, firstName: value });
                          newPatientValidation.clearFieldError('firstName');
                        }}
                        placeholder="Enter first name"
                        required
                        error={newPatientValidation.errors.firstName}
                      />
                      <ValidatedInput
                        label="Last Name"
                        name="lastName"
                        value={newPatient.lastName}
                        onChange={(value) => {
                          setNewPatient({ ...newPatient, lastName: value });
                          newPatientValidation.clearFieldError('lastName');
                        }}
                        placeholder="Enter last name"
                        required
                        error={newPatientValidation.errors.lastName}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ValidatedInput
                        label="Phone Number"
                        name="phoneNumber"
                        value={newPatient.phoneNumber}
                        onChange={(value) => {
                          setNewPatient({ ...newPatient, phoneNumber: value });
                          newPatientValidation.clearFieldError('phoneNumber');
                        }}
                        placeholder="+1234567890"
                        required
                        error={newPatientValidation.errors.phoneNumber}
                      />
                      <ValidatedInput
                        label="Email"
                        name="email"
                        type="email"
                        value={newPatient.email}
                        onChange={(value) => {
                          setNewPatient({ ...newPatient, email: value });
                          newPatientValidation.clearFieldError('email');
                        }}
                        placeholder="email@example.com"
                        error={newPatientValidation.errors.email}
                      />
                    </div>

                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newPatient.smsEnabled}
                          onChange={(e) => setNewPatient({ ...newPatient, smsEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Enable SMS</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newPatient.voiceEnabled}
                          onChange={(e) => setNewPatient({ ...newPatient, voiceEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Enable Voice Calls</span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={addingPatient}
                      variant="primary"
                    >
                      {addingPatient ? 'Adding...' : 'Add Patient'}
                    </Button>
                  </ValidatedForm>
                </CardContent>
              </Card>

              {/* Edit Patient Modal */}
              {editingPatient && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Edit2 className="mr-2 h-5 w-5" />
                        Edit Patient: {editingPatient.firstName} {editingPatient.lastName}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPatient(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <Input
                          value={editPatientData.firstName}
                          onChange={(e) => setEditPatientData({ ...editPatientData, firstName: e.target.value })}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <Input
                          value={editPatientData.lastName}
                          onChange={(e) => setEditPatientData({ ...editPatientData, lastName: e.target.value })}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <Input
                          value={editPatientData.phoneNumber}
                          onChange={(e) => setEditPatientData({ ...editPatientData, phoneNumber: e.target.value })}
                          placeholder="+1234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email (Optional)</label>
                        <Input
                          value={editPatientData.email}
                          onChange={(e) => setEditPatientData({ ...editPatientData, email: e.target.value })}
                          placeholder="patient@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="edit-sms-enabled"
                          checked={editPatientData.smsEnabled}
                          onChange={(e) => setEditPatientData({ ...editPatientData, smsEnabled: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="edit-sms-enabled" className="text-sm font-medium text-gray-700">
                          SMS Enabled
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="edit-voice-enabled"
                          checked={editPatientData.voiceEnabled}
                          onChange={(e) => setEditPatientData({ ...editPatientData, voiceEnabled: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="edit-voice-enabled" className="text-sm font-medium text-gray-700">
                          Voice Enabled
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleUpdatePatient}
                        variant="primary"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Update Patient
                      </Button>
                      <Button
                        onClick={() => setEditingPatient(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patients List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Patients ({patients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{patient.phoneNumber}</p>
                          {patient.email && (
                            <p className="text-sm text-gray-600">{patient.email}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {patient.smsEnabled && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">SMS</span>
                          )}
                          {patient.voiceEnabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Voice</span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPatient(patient)}
                            className="ml-2"
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
                      </div>
                    ))}
                    
                    {patients.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No patients added yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-8">
              {/* Add New Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Add New Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Template Name</label>
                      <Input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., Appointment Reminder"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <Select
                        value={newTemplate.type}
                        onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as 'SMS' | 'VOICE' })}
                      >
                        <option value="SMS">SMS</option>
                        <option value="VOICE">Voice Call</option>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Template Variables Helper */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Available Template Variables</h3>
                        <p className="text-sm text-blue-700 mb-3">
                          Use these variables in your template content. They will be automatically replaced with actual patient data:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {Object.entries(getAvailableTemplateVariables()).map(([variable, description]) => (
                            <div key={variable} className="flex items-center">
                              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono mr-2">
                                {variable}
                              </code>
                              <span className="text-blue-600">{description}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-2 bg-blue-100 rounded">
                          <p className="text-xs text-blue-800">
                            <strong>Example:</strong> Hi {`{firstName}`}, your appointment is on {`{appointmentDate}`} at {`{appointmentTime}`}. Please call {`{clinicPhone}`} if you need to reschedule.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Template Content</label>
                    <Textarea
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      placeholder="Enter your message template..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleAddTemplate}
                    disabled={addingTemplate}
                    variant="primary"
                  >
                    {addingTemplate ? 'Adding...' : 'Add Template'}
                  </Button>
                </CardContent>
              </Card>

              {/* Edit Template Modal */}
              {editingTemplate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Edit2 className="mr-2 h-5 w-5" />
                        Edit Template: {editingTemplate.name}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTemplate(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Template Name</label>
                        <Input
                          value={editTemplateData.name}
                          onChange={(e) => setEditTemplateData({ ...editTemplateData, name: e.target.value })}
                          placeholder="e.g., Appointment Reminder"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <Select
                          value={editTemplateData.type}
                          onChange={(e) => setEditTemplateData({ ...editTemplateData, type: e.target.value as 'SMS' | 'VOICE' })}
                        >
                          <option value="SMS">SMS</option>
                          <option value="VOICE">Voice Call</option>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Template Content</label>
                      <Textarea
                        value={editTemplateData.content}
                        onChange={(e) => setEditTemplateData({ ...editTemplateData, content: e.target.value })}
                        placeholder="Enter your template content here. Use {firstName}, {appointmentDate}, etc. for dynamic variables."
                        rows={4}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleUpdateTemplate}
                        variant="primary"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Update Template
                      </Button>
                      <Button
                        onClick={() => setEditingTemplate(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Templates List */}
              <Card>
                <CardHeader>
                  <CardTitle>Message Templates ({templates.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div key={template.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              template.type === 'SMS' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {template.type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTemplate(template)}
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
                        </div>
                        <p className="text-sm text-gray-600">{template.content}</p>
                      </div>
                    ))}
                    
                    {templates.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No templates created yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'communications' && (
            <Card>
              <CardHeader>
                <CardTitle>Communication History ({communications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div key={comm.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {comm.type === 'SMS' ? (
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Phone className="h-5 w-5 text-green-500" />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {comm.patient.firstName} {comm.patient.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{comm.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            comm.status === 'DELIVERED' 
                              ? 'bg-green-100 text-green-800'
                              : comm.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {comm.status}
                          </span>
                          {comm.sentAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comm.sentAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {comm.content}
                      </p>
                      {comm.errorMessage && (
                        <p className="text-xs text-red-600 mt-2">Error: {comm.errorMessage}</p>
                      )}
                    </div>
                  ))}
                  
                  {communications.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No communications yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Date Range Selector */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Time Period:</label>
                      <Select
                        value={analyticsDateRange}
                        onChange={(e) => setAnalyticsDateRange(e.target.value)}
                        className="w-auto"
                      >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="365">Last year</option>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analytics ? (
                  <>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <MessageSquare className="h-8 w-8 text-blue-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Messages</p>
                            <p className="text-2xl font-bold text-gray-900">{analytics.stats?.totalCommunications || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-green-600">
                              {analytics.stats?.totalCommunications > 0 
                                ? Math.round(((analytics.stats.sms.delivered + analytics.stats.voice.delivered) / analytics.stats.totalCommunications) * 100)
                                : 0}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-purple-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Patients</p>
                            <p className="text-2xl font-bold text-purple-600">{patients.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <XCircle className="h-8 w-8 text-red-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Failed Messages</p>
                            <p className="text-2xl font-bold text-red-600">{(analytics.stats?.sms.failed || 0) + (analytics.stats?.voice.failed || 0)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="ml-4 flex-1">
                              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Message Type Breakdown */}
              {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Message Type Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <MessageSquare className="h-6 w-6 text-blue-500 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">SMS Messages</p>
                              <p className="text-sm text-gray-600">{analytics.stats?.sms.total || 0} sent</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              {analytics.successRates?.sms ? Math.round(analytics.successRates.sms) : 0}%
                            </p>
                            <p className="text-xs text-gray-500">Success Rate</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <Phone className="h-6 w-6 text-green-500 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">Voice Calls</p>
                              <p className="text-sm text-gray-600">{analytics.stats?.voice.total || 0} sent</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {analytics.successRates?.voice ? Math.round(analytics.successRates.voice) : 0}%
                            </p>
                            <p className="text-xs text-gray-500">Success Rate</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Top Communicating Patients
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.topPatients && analytics.topPatients.length > 0 ? (
                          analytics.topPatients.slice(0, 5).map((patient, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                  index === 0 ? 'bg-yellow-500' : 
                                  index === 1 ? 'bg-gray-400' : 
                                  index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                }`}>
                                  #{index + 1}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{patient.name}</p>
                                  <p className="text-sm text-gray-600">{patient.count} messages</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No patient communication data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Daily Activity Chart */}
              {analytics && analytics.dailyStats && analytics.dailyStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Daily Activity (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.dailyStats.slice(-7).map((day, index) => {
                        const total = day.sent + day.delivered + day.failed;
                        const successPercentage = total > 0 ? (day.delivered / total) * 100 : 0;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="text-sm font-medium text-gray-900 w-20">
                                {new Date(day.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-6">
                                  <div className="text-sm">
                                    <span className="text-blue-600 font-medium">{day.sent}</span>
                                    <span className="text-gray-500 ml-1">sent</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-green-600 font-medium">{day.delivered}</span>
                                    <span className="text-gray-500 ml-1">delivered</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-red-600 font-medium">{day.failed}</span>
                                    <span className="text-gray-500 ml-1">failed</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {successPercentage.toFixed(1)}% success
                              </div>
                              <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                                <div 
                                  className="h-2 bg-green-500 rounded-full" 
                                  style={{ width: `${successPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Failures */}
              {analytics && analytics.recentFailures && analytics.recentFailures.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                      Recent Failed Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.recentFailures.slice(0, 5).map((failure, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {failure.type === 'SMS' ? (
                              <MessageSquare className="h-5 w-5 text-red-500" />
                            ) : (
                              <Phone className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{failure.patient}</p>
                              <p className="text-sm text-gray-600">{failure.phoneNumber}</p>
                              <p className="text-xs text-red-600">{failure.errorMessage}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {failure.failedAt ? new Date(failure.failedAt).toLocaleString() : 'Unknown time'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Insights */}
              {analytics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Most Used Channel</p>
                            <p className="text-lg font-bold text-blue-700">
                              {(analytics.stats?.sms.total || 0) > (analytics.stats?.voice.total || 0) ? 'SMS' : 'Voice'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-900">Best Performance</p>
                            <p className="text-lg font-bold text-green-700">
                              {analytics.successRates?.sms > analytics.successRates?.voice ? 
                                `SMS (${Math.round(analytics.successRates.sms)}%)` : 
                                `Voice (${Math.round(analytics.successRates.voice)}%)`}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center">
                          <Calendar className="h-6 w-6 text-purple-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Analysis Period</p>
                            <p className="text-lg font-bold text-purple-700">
                              {analyticsDateRange} days
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loading State */}
              {!analytics && (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading comprehensive analytics...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Messaging Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Mode Display */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Current Mode</h3>
                      {settings ? (
                        <>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              settings.messagingMode === 'live' ? 'bg-green-400' : 'bg-yellow-400'
                            }`}></div>
                            <span className="text-sm font-medium">
                              {settings.messagingMode === 'live' ? 'Live Mode' : 'Demo Mode'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {settings.messagingMode === 'live' 
                              ? 'Messages are sent to real phone numbers via Twilio'
                              : 'Messages are simulated for testing purposes'
                            }
                          </p>
                        </>
                      ) : (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-48"></div>
                        </div>
                      )}
                    </div>

                    {/* Twilio Configuration */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Twilio Configuration</h3>
                      {settings ? (
                        <>
                          {settings.twilioConfigured ? (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                <span className="text-sm font-medium text-green-800">
                                  Twilio is properly configured and ready for live messaging!
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                                <span className="text-sm font-medium text-yellow-800">
                                  Twilio credentials not configured. Currently in demo mode.
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account SID
                              </label>
                              <div className={`p-3 rounded border ${
                                settings.twilioConfigured ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'
                              }`}>
                                <code className={`text-sm ${
                                  settings.twilioConfigured ? 'text-green-700' : 'text-gray-600'
                                }`}>
                                  {settings.twilioConfigured ? 
                                    'AC****...configured ✓' : 
                                    'Not configured'
                                  }
                                </code>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                              </label>
                              <div className={`p-3 rounded border ${
                                settings.twilioPhoneNumber ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'
                              }`}>
                                <code className={`text-sm ${
                                  settings.twilioPhoneNumber ? 'text-green-700' : 'text-gray-600'
                                }`}>
                                  {settings.twilioPhoneNumber ? 
                                    `${settings.twilioPhoneNumber} ✓` : 
                                    'Not configured'
                                  }
                                </code>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                          </div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Test Configuration */}
                    {settings && settings.twilioConfigured && settings.messagingMode === 'live' && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Your Configuration</h3>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-blue-900 mb-2">
                                Ready to send real messages!
                              </p>
                              <p className="text-sm text-blue-700 mb-3">
                                Your Twilio configuration is complete. Go to the Send Message tab to:
                              </p>
                              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                                <li>Add a patient with your phone number</li>
                                <li>Send yourself a test SMS message</li>
                                <li>View the message in Communications History</li>
                                <li>Check Analytics for delivery statistics</li>
                              </ul>
                              <div className="mt-4">
                                <Button
                                  onClick={() => setActiveTab('send')}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Go to Send Message
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">How to Enable Live Messaging</h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start">
                          <span className="flex w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs items-center justify-center mr-3 mt-0.5">1</span>
                          <div>
                            <p className="font-medium">Sign up for Twilio</p>
                            <p>Create a free account at <a href="https://www.twilio.com" target="_blank" className="text-blue-600 hover:underline">twilio.com</a></p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="flex w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs items-center justify-center mr-3 mt-0.5">2</span>
                          <div>
                            <p className="font-medium">Get your credentials</p>
                            <p>Copy your Account SID, Auth Token, and get a phone number from the Twilio Console</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="flex w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs items-center justify-center mr-3 mt-0.5">3</span>
                          <div>
                            <p className="font-medium">Update environment file</p>
                            <p>Add your Twilio credentials to the .env file and set MESSAGING_MODE=live</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="flex w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs items-center justify-center mr-3 mt-0.5">4</span>
                          <div>
                            <p className="font-medium">Restart the application</p>
                            <p>Restart the development server to apply the new settings</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Important Notes</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Live Mode Considerations:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Real messages will be sent to actual phone numbers</li>
                              <li>Twilio charges apply for SMS and voice calls</li>
                              <li>Ensure phone numbers are valid and properly formatted</li>
                              <li>Consider setting up Twilio webhooks for delivery status updates</li>
                              <li>Test with your own phone number first</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </AuthWrapper>
  );
}
