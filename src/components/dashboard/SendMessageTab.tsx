'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, Textarea } from '@/components/ui/form';
import { Send, AlertTriangle } from 'lucide-react';

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

interface SendMessageTabProps {
  patients: Patient[];
  templates: Template[];
  settings: { messagingMode: string; twilioConfigured: boolean } | null;
  sendMessageAction: (data: {
    patientId: string;
    type: 'SMS' | 'VOICE';
    content: string;
    phoneNumber: string;
  }) => Promise<void>;
  sending: boolean;
}

export default function SendMessageTab({ 
  patients, 
  templates,
  settings,
  sendMessageAction, 
  sending 
}: SendMessageTabProps) {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'VOICE'>('SMS');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const handleSendMessage = async () => {
    if (!selectedPatient || (!selectedTemplate && !customMessage.trim())) {
      return;
    }

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    const content = selectedTemplateData ? selectedTemplateData.content : customMessage;

    await sendMessageAction({
      patientId: selectedPatient,
      type: messageType,
      content,
      phoneNumber: patient.phoneNumber,
    });

    // Clear form after successful send
    setSelectedPatient('');
    setSelectedTemplate('');
    setCustomMessage('');
  };

  return (
    <div className="space-y-4">

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
          {sending ? 
            (settings?.messagingMode === 'demo' ? '🔄 Simulating...' : '📤 Sending...') : 
            (settings?.messagingMode === 'demo' ? '🎭 Simulate Message' : '📨 Send Message')
          }
        </Button>
      </CardContent>
    </Card>
    </div>
  );
}
