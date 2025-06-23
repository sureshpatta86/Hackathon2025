'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { ValidatedForm } from '@/components/ui/validation';
import { getAvailableTemplateVariables } from '@/lib/templateVariables';
import { Info } from 'lucide-react';

interface Template {
  id: string;
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

interface EditTemplateModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  template: Template | null;
  updateTemplateAction: (data: UpdateTemplateData) => Promise<void>;
  updatingTemplate: boolean;
}

export default function EditTemplateModal({
  isOpen,
  onCloseAction,
  template,
  updateTemplateAction,
  updatingTemplate
}: EditTemplateModalProps) {
  console.log('EditTemplateModal render - isOpen:', isOpen, 'template:', template?.name);
  
  const [editTemplate, setEditTemplate] = useState({
    name: '',
    type: 'SMS' as 'SMS' | 'VOICE',
    content: '',
  });

  // Update form when template changes
  useEffect(() => {
    console.log('EditTemplateModal useEffect - template:', template);
    if (template) {
      setEditTemplate({
        name: template.name,
        type: template.type,
        content: template.content,
      });
    }
  }, [template]);

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template || !editTemplate.name.trim() || !editTemplate.content.trim()) {
      return;
    }

    await updateTemplateAction({
      id: template.id,
      ...editTemplate,
    });
    
    // Don't close modal here - let parent component handle it
    // onCloseAction();
  };

  const handleClose = () => {
    // Reset form when closing
    if (template) {
      setEditTemplate({
        name: template.name,
        type: template.type,
        content: template.content,
      });
    }
    onCloseAction();
  };

  const availableVariables = getAvailableTemplateVariables();

  if (!template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={handleClose}
      title={`Edit Template: ${template.name}`}
      size="lg"
    >
      <ValidatedForm onSubmit={handleUpdateTemplate}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Template Name</label>
              <Input
                type="text"
                value={editTemplate.name}
                onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                placeholder="Enter template name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <Select
                value={editTemplate.type}
                onChange={(e) => setEditTemplate({ ...editTemplate, type: e.target.value as 'SMS' | 'VOICE' })}
              >
                <option value="SMS">SMS</option>
                <option value="VOICE">Voice Call</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Template Content</label>
            <Textarea
              value={editTemplate.content}
              onChange={(e) => setEditTemplate({ ...editTemplate, content: e.target.value })}
              placeholder="Enter template content..."
              rows={6}
              required
            />
          </div>

          {/* Template Variables Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">Available Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(availableVariables).map(([variable, description]) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => {
                        setEditTemplate({
                          ...editTemplate,
                          content: editTemplate.content + variable
                        });
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                      title={description}
                    >
                      {variable}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Click any variable to add it to your template content.
                </p>
                </div>
              </div>
            </div>

          {/* Buttons inside the form */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updatingTemplate}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatingTemplate || !editTemplate.name.trim() || !editTemplate.content.trim()}
              variant="primary"
            >
              {updatingTemplate ? 'Updating...' : 'Update Template'}
            </Button>
          </div>
        </div>
      </ValidatedForm>
    </Modal>
  );
}
