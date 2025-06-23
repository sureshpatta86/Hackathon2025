'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { Plus, Edit2, Trash2, Search, MessageSquare, Phone } from 'lucide-react';
import AddTemplateModal from './AddTemplateModal';
import EditTemplateModal from './EditTemplateModal';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [updatingTemplate, setUpdatingTemplate] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'SMS' | 'VOICE'>('ALL');

  // Filter templates based on local search query and type filter using useMemo for performance
  const { filteredTemplates, smsCount, voiceCount } = useMemo(() => {
    // First, remove duplicates by ID
    const uniqueTemplates = templates.reduce((acc, template) => {
      const existingIndex = acc.findIndex(t => t.id === template.id);
      if (existingIndex === -1) {
        acc.push(template);
      }
      return acc;
    }, [] as Template[]);

    const filtered = uniqueTemplates.filter(template => {
      const query = localSearchQuery;
      const matchesSearch = !query || 
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.content.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = filterType === 'ALL' || template.type === filterType;
      
      return matchesSearch && matchesType;
    });

    const smsTemplates = uniqueTemplates.filter(t => t.type === 'SMS');
    const voiceTemplates = uniqueTemplates.filter(t => t.type === 'VOICE');

    return {
      filteredTemplates: filtered,
      smsCount: smsTemplates.length,
      voiceCount: voiceTemplates.length
    };
  }, [templates, localSearchQuery, filterType]);

  const handleAddTemplate = async (data: NewTemplateData) => {
    await addTemplateAction(data);
    setShowAddModal(false);
  };

  const handleEditTemplate = (template: Template) => {
    console.log('Edit template clicked:', template.name);
    setEditingTemplate(template);
  };

  const handleUpdateTemplate = async (data: UpdateTemplateData) => {
    setUpdatingTemplate(true);
    try {
      await updateTemplateAction(data);
      setEditingTemplate(null); // Close modal on success
    } finally {
      setUpdatingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (template: Template) => {
    await deleteTemplateAction(template.id, template.name);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button and Search */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Message Templates</h2>
          <p className="text-gray-600">Create and manage reusable message templates</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search templates by name or content..."
                value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterType === 'ALL' ? 'primary' : 'outline'}
                  onClick={() => setFilterType('ALL')}
                >
                  All ({smsCount + voiceCount})
                </Button>
                <Button
                  size="sm"
                  variant={filterType === 'SMS' ? 'primary' : 'outline'}
                  onClick={() => setFilterType('SMS')}
                >
                  <MessageSquare className="mr-1 h-3 w-3" />
                  SMS ({smsCount})
                </Button>
                <Button
                  size="sm"
                  variant={filterType === 'VOICE' ? 'primary' : 'outline'}
                  onClick={() => setFilterType('VOICE')}
                >
                  <Phone className="mr-1 h-3 w-3" />
                  Voice ({voiceCount})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates ({filteredTemplates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {templates.length === 0 
                  ? 'No templates found. Create your first template to get started.' 
                  : 'No templates match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          template.type === 'SMS' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {template.type === 'SMS' ? (
                            <>
                              <MessageSquare className="inline h-3 w-3 mr-1" />
                              SMS
                            </>
                          ) : (
                            <>
                              <Phone className="inline h-3 w-3 mr-1" />
                              Voice
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('Edit button clicked - calling handleEditTemplate');
                          handleEditTemplate(template);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteTemplate(template);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Template Modal */}
      <AddTemplateModal
        isOpen={showAddModal}
        onCloseAction={() => setShowAddModal(false)}
        addTemplateAction={handleAddTemplate}
        addingTemplate={addingTemplate}
      />

      {/* Edit Template Modal */}
      <EditTemplateModal
        isOpen={!!editingTemplate}
        onCloseAction={() => setEditingTemplate(null)}
        template={editingTemplate}
        updateTemplateAction={handleUpdateTemplate}
        updatingTemplate={updatingTemplate}
      />
    </div>
  );
}
