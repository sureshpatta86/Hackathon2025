'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { FilterConfig, AdvancedFiltersProps } from '@/types/search';
import { Filter, Save, Trash2, Star } from 'lucide-react';

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  savedPresets,
  isOpen,
  onClose
}: AdvancedFiltersProps) {
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  if (!isOpen) return null;

  const handleFilterChange = (key: keyof FilterConfig, value: string | string[] | { start?: string; end?: string } | { sms?: boolean; voice?: boolean }) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName, presetDescription);
      setPresetName('');
      setPresetDescription('');
      setShowSaveForm(false);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
          </CardTitle>
          <Button variant="outline" onClick={onClose} size="sm">
            Close
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Saved Presets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm text-gray-900">{preset.name}</h4>
                          {preset.isDefault && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        {preset.description && (
                          <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLoadPreset(preset)}
                          className="h-6 px-2"
                        >
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeletePreset(preset.id)}
                          className="h-6 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value
                })}
              />
              <Input
                type="date"
                label="End Date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value
                })}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Communication Status</h3>
            <div className="flex flex-wrap gap-2">
              {['PENDING', 'DELIVERED', 'FAILED', 'SENT'].map((status) => (
                <label key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status) || false}
                    onChange={(e) => {
                      const currentStatus = filters.status || [];
                      if (e.target.checked) {
                        handleFilterChange('status', [...currentStatus, status]);
                      } else {
                        handleFilterChange('status', currentStatus.filter(s => s !== status));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Communication Type Filter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Communication Type</h3>
            <div className="flex flex-wrap gap-2">
              {['SMS', 'VOICE'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.communicationType?.includes(type) || false}
                    onChange={(e) => {
                      const currentTypes = filters.communicationType || [];
                      if (e.target.checked) {
                        handleFilterChange('communicationType', [...currentTypes, type]);
                      } else {
                        handleFilterChange('communicationType', currentTypes.filter(t => t !== type));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Patient Preferences */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Patient Preferences</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.patientEnabled?.sms || false}
                  onChange={(e) => handleFilterChange('patientEnabled', {
                    ...filters.patientEnabled,
                    sms: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">SMS Enabled</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.patientEnabled?.voice || false}
                  onChange={(e) => handleFilterChange('patientEnabled', {
                    ...filters.patientEnabled,
                    voice: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Voice Enabled</span>
              </label>
            </div>
          </div>

          {/* Save Preset */}
          <div className="border-t pt-4">
            {!showSaveForm ? (
              <Button
                variant="outline"
                onClick={() => setShowSaveForm(true)}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Current Filters as Preset</span>
              </Button>
            ) : (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Save Filter Preset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Preset name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSavePreset} size="sm">
                    Save Preset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveForm(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
            <Button onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
