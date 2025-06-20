'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, Textarea } from '@/components/ui/form';
import { Send } from 'lucide-react';

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
  );
}
