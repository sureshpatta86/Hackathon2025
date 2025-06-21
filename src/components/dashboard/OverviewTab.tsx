'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, Users, BarChart3, Clock } from 'lucide-react';
import type { Patient, Template, Communication } from '@/types';

interface OverviewTabProps {
  patients: Patient[];
  templates: Template[];
  communications: Communication[];
}

export default function OverviewTab({ patients, templates, communications }: OverviewTabProps) {
  const successRate = communications.length > 0 
    ? Math.round((communications.filter(c => c.status === 'DELIVERED').length / communications.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to HealthComm Dashboard</h1>
        <p className="text-blue-100">Manage your patient communications efficiently and effectively.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
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
        
        <Card className="hover:shadow-lg transition-shadow">
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
        
        <Card className="hover:shadow-lg transition-shadow">
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
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Recent Communications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communications.slice(0, 5).map((comm) => (
              <div key={comm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
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
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No communications yet.</p>
                <p className="text-sm text-gray-400 mt-1">Start sending messages to see activity here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
