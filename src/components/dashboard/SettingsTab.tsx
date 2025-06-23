'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/components/ui/notification';
import { Settings, CheckCircle, AlertTriangle, Phone, Send, Power, RotateCcw } from 'lucide-react';

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
  
  const [isChangingMode, setIsChangingMode] = useState(false);
  const { addNotification } = useNotification();
  
  // Load settings when component mounts
  useEffect(() => {
    fetchSettingsAction();
  }, [fetchSettingsAction]);

  // Function to change messaging mode
  const handleModeChange = async (newMode: 'demo' | 'live') => {
    if (!settings || settings.messagingMode === newMode) return;

    try {
      setIsChangingMode(true);
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ messagingMode: newMode }),
      });

      if (response.ok) {
        const result = await response.json();
        addNotification('success', result.message);
        // Refresh settings to show the updated mode
        await fetchSettingsAction();
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: { messagingMode: newMode }
        }));
      } else {
        const error = await response.json();
        addNotification('error', error.error || 'Failed to update messaging mode');
      }
    } catch (error) {
      console.error('Error changing messaging mode:', error);
      addNotification('error', 'Failed to update messaging mode');
    } finally {
      setIsChangingMode(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">System Settings</h2>
            <p className="text-purple-100 mt-1">Configure messaging and system preferences</p>
          </div>
        </div>
      </div>

      {/* Current Mode Card */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center text-purple-800">
            <Settings className="mr-2 h-5 w-5" />
            Current Messaging Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {settings ? (
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-purple-100">
                <div className={`w-4 h-4 rounded-full mr-4 ${
                  settings.messagingMode === 'live' ? 'bg-green-400 shadow-lg' : 'bg-yellow-400 shadow-lg'
                }`}></div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    {settings.messagingMode === 'live' ? 'Live Mode' : 'Demo Mode'}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {settings.messagingMode === 'live' 
                      ? 'Messages are sent to real phone numbers via Twilio'
                      : 'Messages are simulated for testing purposes'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-purple-100 rounded w-32"></div>
              <div className="h-4 bg-purple-100 rounded w-48"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messaging Mode Control Card */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center text-purple-800">
            <Power className="mr-2 h-5 w-5" />
            Messaging Mode Control
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {settings ? (
            <div className="space-y-6">
              <div className="text-sm text-gray-600 mb-4">
                Switch between demo and live messaging modes instantly. Changes apply immediately without requiring a restart.
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Demo Mode Card */}
                <div 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    settings.messagingMode === 'demo' 
                      ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleModeChange('demo')}
                >
                  <div className="flex items-start">
                    <div className={`w-6 h-6 rounded-full mr-4 mt-1 flex items-center justify-center ${
                      settings.messagingMode === 'demo' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      {settings.messagingMode === 'demo' && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        settings.messagingMode === 'demo' ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        Demo Mode
                      </h3>
                      <p className={`text-xs mt-1 ${
                        settings.messagingMode === 'demo' ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        Messages are simulated for testing. No real SMS sent, no charges apply.
                      </p>
                      {settings.messagingMode === 'demo' && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">✓ Currently Active</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Mode Card */}
                <div 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    settings.messagingMode === 'live' 
                      ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  } ${!settings.twilioConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => settings.twilioConfigured && handleModeChange('live')}
                >
                  <div className="flex items-start">
                    <div className={`w-6 h-6 rounded-full mr-4 mt-1 flex items-center justify-center ${
                      settings.messagingMode === 'live' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {settings.messagingMode === 'live' && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        settings.messagingMode === 'live' ? 'text-green-900' : 'text-gray-700'
                      }`}>
                        Live Mode
                      </h3>
                      <p className={`text-xs mt-1 ${
                        settings.messagingMode === 'live' ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        Real SMS messages sent via Twilio. Charges apply for each message.
                      </p>
                      {settings.messagingMode === 'live' && (
                        <div className="mt-2 text-xs text-green-600 font-medium">✓ Currently Active</div>
                      )}
                      {!settings.twilioConfigured && (
                        <div className="mt-2 text-xs text-amber-600 font-medium">⚠️ Requires Twilio Configuration</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Mode Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => handleModeChange('demo')}
                  disabled={isChangingMode || settings.messagingMode === 'demo'}
                  variant={settings.messagingMode === 'demo' ? 'secondary' : 'outline'}
                  size="sm"
                  className={settings.messagingMode === 'demo' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                >
                  {isChangingMode ? (
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Phone className="mr-2 h-4 w-4" />
                  )}
                  {settings.messagingMode === 'demo' ? 'Demo Mode Active' : 'Switch to Demo'}
                </Button>
                
                <Button
                  onClick={() => handleModeChange('live')}
                  disabled={isChangingMode || settings.messagingMode === 'live' || !settings.twilioConfigured}
                  variant={settings.messagingMode === 'live' ? 'secondary' : 'outline'}
                  size="sm"
                  className={settings.messagingMode === 'live' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                >
                  {isChangingMode ? (
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {settings.messagingMode === 'live' ? 'Live Mode Active' : 'Switch to Live'}
                </Button>
              </div>

              {/* Warning for Live Mode */}
              {!settings.twilioConfigured && (
                <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <strong>Live mode is disabled:</strong> Configure your Twilio credentials in the environment variables to enable live messaging.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-purple-100 rounded w-3/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-24 bg-purple-100 rounded"></div>
                <div className="h-24 bg-purple-100 rounded"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Twilio Configuration Card */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center text-purple-800">
            <Phone className="mr-2 h-5 w-5" />
            Twilio Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {settings ? (
            <div className="space-y-6">
              {/* Status Alert */}
              {settings.twilioConfigured ? (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <div>
                      <span className="text-sm font-semibold text-green-800">
                        Twilio is properly configured and ready for live messaging!
                      </span>
                      <p className="text-xs text-green-700 mt-1">All systems operational</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                    <div>
                      <span className="text-sm font-semibold text-yellow-800">
                        Twilio credentials not configured. Currently in demo mode.
                      </span>
                      <p className="text-xs text-yellow-700 mt-1">Configure credentials to enable live messaging</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Configuration Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-purple-800 mb-2">
                    Account SID
                  </label>
                  <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    settings.twilioConfigured 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                  }`}>
                    <code className={`text-sm font-mono ${
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
                  <label className="block text-sm font-semibold text-purple-800 mb-2">
                    Phone Number
                  </label>
                  <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    settings.twilioPhoneNumber 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                  }`}>
                    <code className={`text-sm font-mono ${
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
            </div>
          ) : (
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-5 bg-purple-100 rounded w-24 mb-2"></div>
                <div className="h-12 bg-purple-100 rounded"></div>
              </div>
              <div>
                <div className="h-5 bg-purple-100 rounded w-24 mb-2"></div>
                <div className="h-12 bg-purple-100 rounded"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      {settings && settings.twilioConfigured && settings.messagingMode === 'live' && (
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="flex items-center text-purple-800">
              <Send className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    🎉 Ready to send real messages!
                  </p>
                  <p className="text-sm text-green-700 mb-3">
                    Your Twilio configuration is complete. You can now send live SMS messages to patients.
                  </p>
                  <p className="text-sm text-green-600 mb-3 font-medium">
                    Test your setup by:
                  </p>
                  <ul className="text-sm text-green-700 list-disc list-inside space-y-1 mb-4">
                    <li>Adding a patient with your phone number</li>
                    <li>Sending yourself a test SMS message</li>
                    <li>Viewing delivery status in Communications History</li>
                    <li>Checking Analytics for message statistics</li>
                  </ul>
                  <Button
                    onClick={() => setActiveTabAction('send')}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-md"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Guide Card */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center text-purple-800">
            <Settings className="mr-2 h-5 w-5" />
            Configuration Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Setup Instructions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Enable Live Messaging</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="flex w-8 h-8 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 rounded-full text-sm font-semibold items-center justify-center mr-4 mt-0.5">1</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Sign up for Twilio</p>
                    <p className="text-gray-600 text-sm">
                      Create a free account at{' '}
                      <a 
                        href="https://www.twilio.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 underline font-medium"
                      >
                        twilio.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="flex w-8 h-8 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 rounded-full text-sm font-semibold items-center justify-center mr-4 mt-0.5">2</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Get your credentials</p>
                    <p className="text-gray-600 text-sm">
                      Copy your Account SID, Auth Token, and purchase a phone number from the Twilio Console
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="flex w-8 h-8 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 rounded-full text-sm font-semibold items-center justify-center mr-4 mt-0.5">3</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Update environment variables</p>
                    <p className="text-gray-600 text-sm mb-2">
                      Add your Twilio credentials to the <code className="bg-gray-100 px-2 py-1 rounded text-xs">.env</code> file:
                    </p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono">
                      <div>MESSAGING_MODE=live</div>
                      <div>TWILIO_ACCOUNT_SID=your_account_sid</div>
                      <div>TWILIO_AUTH_TOKEN=your_auth_token</div>
                      <div>TWILIO_PHONE_NUMBER=your_twilio_number</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="flex w-8 h-8 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 rounded-full text-sm font-semibold items-center justify-center mr-4 mt-0.5">4</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Restart the application</p>
                    <p className="text-gray-600 text-sm">
                      Restart the development server to apply the new configuration
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Considerations</h3>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-2">⚠️ Live Mode Considerations:</p>
                    <ul className="space-y-1">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Real messages will be sent to actual phone numbers
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Twilio charges apply for SMS and voice calls
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Ensure phone numbers are valid and properly formatted
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Test with your own phone number first
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Consider setting up webhooks for delivery status updates
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Mode Info */}
            {settings && settings.messagingMode === 'demo' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Mode Information</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <Phone className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-2">📱 Currently in Demo Mode</p>
                      <p className="mb-2">
                        All messages are simulated for testing purposes. No real SMS messages will be sent, 
                        and no charges will occur.
                      </p>
                      <p className="text-blue-700">
                        This is perfect for development and testing your application&apos;s functionality 
                        before configuring live messaging.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
