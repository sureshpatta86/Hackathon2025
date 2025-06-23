'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthWrapper from '@/components/AuthWrapper';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/components/ui/notification';
import {
  OverviewTab,
  SendMessageTab,
  BulkMessagingTab,
  PatientsTab,
  PatientGroupsTab,
  TemplatesTab,
  CommunicationsTab,
  AnalyticsTab
} from '@/components/dashboard';
import type { 
  Patient, 
  Template, 
  Communication, 
  Analytics, 
  AppSettings,
  PatientFormData, 
  TemplateFormData 
} from '@/types';

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
    console.log('🔄 fetchData called - timestamp:', new Date().toISOString());
    console.trace('fetchData call stack');
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
      // addNotification('error', 'Failed to load data'); // Removed to prevent dependency cycle
    } finally {
      setLoading(false);
    }
  }, []); // Removed addNotification dependency

  const fetchTemplates = useCallback(async () => {
    console.log('🔄 fetchTemplates called - timestamp:', new Date().toISOString());
    console.trace('fetchTemplates call stack');
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const templatesData = await response.json();
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

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

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
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
        await response.json(); // Parse response
        const isDemo = settings?.messagingMode === 'demo' || !settings?.twilioConfigured;
        
        if (isDemo) {
          addNotification('success', `📱 Message simulated successfully! (Demo Mode - No real ${data.type} sent)`);
        } else {
          addNotification('success', `📨 ${data.type} sent successfully!`);
        }
        
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

  const handleAddPatient = async (data: PatientFormData) => {
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

  const handleUpdatePatient = async (data: PatientFormData & { id: string }) => {
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

  const handleAddTemplate = async (data: TemplateFormData) => {
    setAddingTemplate(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addNotification('success', 'Template added successfully!');
        fetchTemplates(); // Refresh only templates
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

  const handleUpdateTemplate = async (data: TemplateFormData & { id: string }) => {
    console.log('🔧 handleUpdateTemplate called for:', data.name);
    try {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('✅ Template update API call successful');
        addNotification('success', 'Template updated successfully!');
        console.log('📢 Notification added, calling fetchTemplates...');
        fetchTemplates(); // Refresh only templates
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
        fetchTemplates(); // Refresh only templates
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
            <div className="overflow-x-auto py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <nav className="flex items-center justify-center space-x-2 min-h-[2.5rem] px-2 min-w-max">
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
                Send
              </Button>
              <Button
                variant={activeTab === 'bulk' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('bulk')}
                size="sm"
              >
                Bulk
              </Button>
              <Button
                variant={activeTab === 'patients' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('patients')}
                size="sm"
              >
                Patients
              </Button>
              <Button
                variant={activeTab === 'groups' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('groups')}
                size="sm"
              >
                Groups
              </Button>
              <Button
                variant={activeTab === 'analytics' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('analytics')}
                size="sm"
              >
                Analytics
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
              </nav>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              settings={settings}
              sendMessageAction={handleSendMessage}
              sending={sending}
            />
          )}

          {activeTab === 'bulk' && (
            <BulkMessagingTab 
              patients={patients}
              templates={templates}
              settings={settings}
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

          {activeTab === 'groups' && (
            <PatientGroupsTab 
              patients={patients}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab 
              patients={patients}
              fetchAnalyticsAction={fetchAnalytics}
              analytics={analytics}
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
        </main>
      </div>
    </AuthWrapper>
  );
}
