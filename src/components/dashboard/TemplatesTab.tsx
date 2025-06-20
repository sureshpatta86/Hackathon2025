'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { getAvailableTemplateVariables } from '@/lib/templateVariables';
import { Plus, Edit2, Trash2, Save, X, Info } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'SMS' | 'VOICE';
  content: string;
}

interface NewTemplateData {
  name: string;
  type: 'SMS' | 'VOICE';
  content: string;
}

interface UpdateTemplateData {
  id: string;
  name: string;
  type: 'SMS' | 'VOICE';
  content: string;
}

interface TemplatesTabProps {
  templates: Template[];
  addTemplateAction: (data: NewTemplateData) => Promise<void>;
  updateTemplateAction: (data: UpdateTemplateData) => Promise<void>;
  deleteTemplateAction: (templateId: string, templateName: string) => Promise<void>;
  addingTemplate: boolean;
}

export default function TemplatesTab({ 
  templates, 
  addTemplateAction, 
  updateTemplateAction, 
  deleteTemplateAction,
  addingTemplate 
}: TemplatesTabProps) {
  // New template form
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'SMS' as 'SMS' | 'VOICE',
    content: '',
  });

  // Edit template form
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editTemplateData, setEditTemplateData] = useState({
    name: '',
    type: 'SMS' as 'SMS' | 'VOICE',
    content: '',
  });

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      return;
    }

    await addTemplateAction(newTemplate);
    
    // Clear form after successful add
    setNewTemplate({
      name: '',
      type: 'SMS',
      content: '',
    });
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setEditTemplateData({
      name: template.name,
      type: template.type as 'SMS' | 'VOICE',
      content: template.content,
    });
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !editTemplateData.name || !editTemplateData.content) {
      return;
    }

    await updateTemplateAction({
      id: editingTemplate.id,
      ...editTemplateData,
    });
    
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-8">
      {/* Add New Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Template Name</label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="e.g., Appointment Reminder"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as 'SMS' | 'VOICE' })}
              >
                <option value="SMS">SMS</option>
                <option value="VOICE">Voice Call</option>
              </Select>
            </div>
          </div>
          
          {/* Template Variables Helper */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Available Template Variables ({Object.keys(getAvailableTemplateVariables()).length} total)</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Use these variables in your template content. They will be automatically replaced with actual patient data:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {Object.entries(getAvailableTemplateVariables()).map(([variable, description]) => (
                    <div key={variable} className="flex items-center">
                      <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono mr-2">
                        {variable}
                      </code>
                      <span className="text-blue-600">{description}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded">
                  <p className="text-xs text-blue-800">
                    <strong>Example:</strong> Hi {`{firstName}`}, your appointment is on {`{appointmentDate}`} at {`{appointmentTime}`}. Please call {`{clinicPhone}`} if you need to reschedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Template Content</label>
            <Textarea
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              placeholder="Enter your message template..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleAddTemplate}
            disabled={addingTemplate}
            variant="primary"
          >
            {addingTemplate ? 'Adding...' : 'Add Template'}
          </Button>
        </CardContent>
      </Card>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Edit2 className="mr-2 h-5 w-5" />
                Edit Template: {editingTemplate.name}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingTemplate(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Template Name</label>
                <Input
                  value={editTemplateData.name}
                  onChange={(e) => setEditTemplateData({ ...editTemplateData, name: e.target.value })}
                  placeholder="e.g., Appointment Reminder"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select
                  value={editTemplateData.type}
                  onChange={(e) => setEditTemplateData({ ...editTemplateData, type: e.target.value as 'SMS' | 'VOICE' })}
                >
                  <option value="SMS">SMS</option>
                  <option value="VOICE">Voice Call</option>
                </Select>
              </div>
            </div>
            
            {/* Template Variables Helper */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Available Template Variables ({Object.keys(getAvailableTemplateVariables()).length} total)</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Use these variables in your template content. They will be automatically replaced with actual patient data:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {Object.entries(getAvailableTemplateVariables()).map(([variable, description]) => (
                      <div key={variable} className="flex items-center">
                        <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono mr-2">
                          {variable}
                        </code>
                        <span className="text-blue-600">{description}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="text-xs text-blue-800">
                      <strong>Example:</strong> Hi {`{firstName}`}, your appointment is on {`{appointmentDate}`} at {`{appointmentTime}`}. Please call {`{clinicPhone}`} if you need to reschedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Template Content</label>
              <Textarea
                value={editTemplateData.content}
                onChange={(e) => setEditTemplateData({ ...editTemplateData, content: e.target.value })}
                placeholder="Enter your template content here. Use {firstName}, {appointmentDate}, etc. for dynamic variables."
                rows={4}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleUpdateTemplate}
                variant="primary"
              >
                <Save className="mr-2 h-4 w-4" />
                Update Template
              </Button>
              <Button
                onClick={() => setEditingTemplate(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Message Templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      template.type === 'SMS' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {template.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTemplateAction(template.id, template.name)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{template.content}</p>
              </div>
            ))}
            
            {templates.length === 0 && (
              <p className="text-gray-500 text-center py-8">No templates created yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
