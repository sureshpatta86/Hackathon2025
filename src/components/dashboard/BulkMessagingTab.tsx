'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, Textarea, Input } from '@/components/ui/form';
import { Send, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNotification } from '@/components/ui/notification';

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

interface PatientGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  _count: {
    patients: number;
  };
  patients: Array<{
    patient: {
      id: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
  }>;
}

interface BulkMessagingTabProps {
  patients: Patient[];
  templates: Template[];
  settings: { messagingMode: string; twilioConfigured: boolean } | null;
}

export default function BulkMessagingTab({ 
  patients, 
  templates,
  settings
}: BulkMessagingTabProps) {
  const [messageType, setMessageType] = useState<'SMS' | 'VOICE'>('SMS');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [patientGroups, setPatientGroups] = useState<PatientGroup[]>([]);
  const [scheduleFor, setScheduleFor] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  const { addNotification } = useNotification();

  // Load patient groups
  useEffect(() => {
    const fetchPatientGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await fetch('/api/patient-groups');
        if (response.ok) {
          const groups = await response.json();
          setPatientGroups(groups);
        } else {
          console.error('Failed to fetch patient groups');
        }
      } catch (error) {
        console.error('Error fetching patient groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchPatientGroups();
  }, []);

  const handlePatientSelection = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    const eligiblePatients = patients.filter(patient => 
      messageType === 'SMS' ? patient.smsEnabled : patient.voiceEnabled
    );
    setSelectedPatients(eligiblePatients.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPatients([]);
  };

  const handleGroupSelection = (groupId: string) => {
    if (groupId === '') {
      setSelectedGroup('');
      setSelectedPatients([]);
      return;
    }

    const group = patientGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(groupId);
      const groupPatientIds = group.patients
        .map(gp => gp.patient.id)
        .filter(patientId => {
          const patient = patients.find(p => p.id === patientId);
          return patient && (messageType === 'SMS' ? patient.smsEnabled : patient.voiceEnabled);
        });
      setSelectedPatients(groupPatientIds);
    }
  };

  const handleSendBulkMessage = async () => {
    if ((!selectedPatients.length && !selectedGroup) || (!selectedTemplate && !customMessage.trim())) {
      addNotification('error', 'Please select recipients and provide message content');
      return;
    }

    try {
      setSending(true);
      
      const requestBody: {
        type: 'SMS' | 'VOICE';
        patientIds?: string[];
        groupId?: string;
        templateId?: string;
        customMessage?: string;
        scheduleFor?: string;
      } = {
        type: messageType,
      };

      if (selectedGroup) {
        requestBody.groupId = selectedGroup;
      } else {
        requestBody.patientIds = selectedPatients;
      }

      if (selectedTemplate) {
        requestBody.templateId = selectedTemplate;
      } else {
        requestBody.customMessage = customMessage;
      }

      if (scheduleFor) {
        requestBody.scheduleFor = scheduleFor;
      }

      const response = await fetch('/api/communications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        addNotification('success', result.message || 'Bulk messages sent successfully');
        
        // Clear form
        setSelectedPatients([]);
        setSelectedGroup('');
        setSelectedTemplate('');
        setCustomMessage('');
        setScheduleFor('');
      } else {
        addNotification('error', result.error || 'Failed to send bulk messages');
      }
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      addNotification('error', 'Failed to send bulk messages');
    } finally {
      setSending(false);
    }
  };

  const eligiblePatients = patients.filter(patient => {
    return messageType === 'SMS' ? patient.smsEnabled : patient.voiceEnabled;
  });

  return (
    <div className="space-y-6">
      {/* Configuration Warning */}
      {settings?.messagingMode === 'live' && !settings?.twilioConfigured && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                ⚠️ Configuration Required
              </h3>
              <p className="text-sm text-amber-700">
                Live mode is enabled but Twilio credentials are not configured. Messages will be simulated until configuration is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Messaging Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5" />
            Bulk Messaging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Type and Template */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Message Type</label>
              <Select
                value={messageType}
                onChange={(e) => {
                  setMessageType(e.target.value as 'SMS' | 'VOICE');
                  setSelectedPatients([]);
                  setSelectedGroup('');
                }}
              >
                <option value="SMS">SMS</option>
                <option value="VOICE">Voice Call</option>
              </Select>
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
          </div>

          {/* Message Content */}
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

          {/* Schedule Option */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Schedule For (Optional)</label>
            <Input
              type="datetime-local"
              value={scheduleFor}
              onChange={(e) => setScheduleFor(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Select Recipients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
              disabled={eligiblePatients.length === 0}
            >
              Select All Eligible ({eligiblePatients.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeselectAll}
              disabled={selectedPatients.length === 0}
            >
              Deselect All
            </Button>
          </div>

          {/* Patient Groups */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select by Group</label>
            {loadingGroups ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <Select
                value={selectedGroup}
                onChange={(e) => handleGroupSelection(e.target.value)}
              >
                <option value="">Choose a patient group...</option>
                {patientGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group._count.patients} patients)
                  </option>
                ))}
              </Select>
            )}
          </div>

          {/* Individual Patient Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Or Select Individual Patients</label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {eligiblePatients.map((patient) => (
                <label key={patient.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={() => handlePatientSelection(patient.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </span>
                      <span className="text-sm text-gray-600">({patient.phoneNumber})</span>
                      {messageType === 'SMS' && patient.smsEnabled && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">SMS</span>
                      )}
                      {messageType === 'VOICE' && patient.voiceEnabled && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Voice</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
              
              {eligiblePatients.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No patients eligible for {messageType} messaging
                </p>
              )}
            </div>
          </div>

          {/* Selected Count */}
          {selectedPatients.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedPatients.length} patient{selectedPatients.length === 1 ? '' : 's'} selected
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Button */}
      <Card>
        <CardContent className="p-6">
          <Button
            onClick={handleSendBulkMessage}
            disabled={sending || (selectedPatients.length === 0 && !selectedGroup) || (!selectedTemplate && !customMessage.trim())}
            variant="primary"
            className="w-full"
          >
            {sending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                {scheduleFor ? 'Scheduling...' : (settings?.messagingMode === 'demo' ? 'Simulating...' : 'Sending...')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {scheduleFor ? `Schedule ${messageType} Messages` : `Send ${messageType} to ${selectedPatients.length || 'Group'} Recipient${selectedPatients.length === 1 ? '' : 's'}`}
              </>
            )}
          </Button>
          
          {scheduleFor && (
            <p className="text-sm text-gray-600 text-center mt-2">
              Messages will be sent on {new Date(scheduleFor).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
