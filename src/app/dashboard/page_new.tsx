'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthWrapper from '@/components/AuthWrapper';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/components/ui/notification';
import { Settings } from 'lucide-react';
import {
  OverviewTab,
  SendMessageTab,
  PatientsTab,
  TemplatesTab,
  CommunicationsTab,
  AnalyticsTab,
  SettingsTab
} from '@/components/dashboard';

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

interface AppSettings {
  messagingMode: string;
  twilioConfigured: boolean;
  twilioPhoneNumber: string | null;
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { addNotification } = useNotification();

  // Loading states
  const [sending, setSending] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);
  const [addingTemplate, setAddingTemplate] = useState(false);

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

  const fetchAnalytics = useCallback(async (days: string) => {
    try {
      const response = await fetch(`/api/analytics?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Action handlers for tabs
  const handleSendMessage = async (data: {
    patientId: string;
    type: 'SMS' | 'VOICE';
    content: string;
    phoneNumber: string;
  }) => {
    setSending(true);
    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addNotification('success', 'Message sent successfully!');
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

  const handleAddPatient = async (data: any) => {
    setAddingPatient(true);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addNotification('success', 'Patient added successfully!');
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

  const handleUpdatePatient = async (data: any) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addNotification('success', 'Patient updated successfully!');
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

  const handleAddTemplate = async (data: any) => {
    setAddingTemplate(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addNotification('success', 'Template added successfully!');
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

  const handleUpdateTemplate = async (data: any) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addNotification('success', 'Template updated successfully!');
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

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <OverviewTab 
              patients={patients}
              templates={templates}
              communications={communications}
            />
          )}

          {activeTab === 'send' && (
            <SendMessageTab 
              patients={patients}
              templates={templates}
              sendMessageAction={handleSendMessage}
              sending={sending}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsTab 
              patients={patients}
              addPatientAction={handleAddPatient}
              updatePatientAction={handleUpdatePatient}
              deletePatientAction={handleDeletePatient}
              addingPatient={addingPatient}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesTab 
              templates={templates}
              addTemplateAction={handleAddTemplate}
              updateTemplateAction={handleUpdateTemplate}
              deleteTemplateAction={handleDeleteTemplate}
              addingTemplate={addingTemplate}
            />
          )}

          {activeTab === 'communications' && (
            <CommunicationsTab 
              communications={communications}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab 
              patients={patients}
              fetchAnalyticsAction={fetchAnalytics}
              analytics={analytics}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              settings={settings}
              fetchSettingsAction={fetchSettings}
              setActiveTabAction={setActiveTab}
            />
          )}
        </main>
      </div>
    </AuthWrapper>
  );
}
