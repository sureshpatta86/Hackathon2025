'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, CheckCircle, AlertTriangle, Phone, Send } from 'lucide-react';

interface Settings {
  messagingMode: string;
  twilioConfigured: boolean;
  twilioPhoneNumber: string | null;
}

interface SettingsTabProps {
  settings: Settings | null;
  fetchSettingsAction: () => Promise<void>;
  setActiveTabAction: (tab: string) => void;
}

export default function SettingsTab({ 
  settings, 
  fetchSettingsAction, 
  setActiveTabAction 
}: SettingsTabProps) {
  
  // Load settings when component mounts
  useEffect(() => {
    fetchSettingsAction();
  }, [fetchSettingsAction]);

  return (
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
                    <span className="text-sm font-medium text-gray-900">
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
                          onClick={() => setActiveTabAction('send')}
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
  );
}
