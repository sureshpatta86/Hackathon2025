'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone } from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
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

interface CommunicationsTabProps {
  communications: Communication[];
}

export default function CommunicationsTab({ communications }: CommunicationsTabProps) {
  return (
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
  );
}
