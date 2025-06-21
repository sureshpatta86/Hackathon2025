'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/form';
import { MessageSquare, Phone, Users, CheckCircle, XCircle, BarChart3, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import type { Patient, Analytics } from '@/types';

interface AnalyticsTabProps {
  patients: Patient[];
  fetchAnalyticsAction: (days: string) => Promise<void>;
  analytics: Analytics | null;
}

export default function AnalyticsTab({ 
  patients, 
  fetchAnalyticsAction, 
  analytics 
}: AnalyticsTabProps) {
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30'); // days

  // Load analytics when component mounts or date range changes
  useEffect(() => {
    fetchAnalyticsAction(analyticsDateRange);
  }, [analyticsDateRange, fetchAnalyticsAction]);

  return (
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
  );
}
