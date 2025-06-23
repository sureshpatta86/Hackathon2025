'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { ValidatedForm } from '@/components/ui/validation';
import { getAvailableTemplateVariables } from '@/lib/templateVariables';
import { Info } from 'lucide-react';

interface NewTemplateData {
  name: string;
  type: 'SMS' | 'VOICE';
  content: string;
}

interface AddTemplateModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  addTemplateAction: (data: NewTemplateData) => Promise<void>;
  addingTemplate: boolean;
}

export default function AddTemplateModal({
  isOpen,
  onCloseAction,
  addTemplateAction,
  addingTemplate
}: AddTemplateModalProps) {
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'SMS' as 'SMS' | 'VOICE',
    content: '',
  });

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      return;
    }

    await addTemplateAction(newTemplate);
    
    // Clear form and close modal after successful add
    setNewTemplate({
      name: '',
      type: 'SMS',
      content: '',
    });
    onCloseAction();
  };

  const handleClose = () => {
    // Reset form when closing
    setNewTemplate({
      name: '',
      type: 'SMS',
      content: '',
    });
    onCloseAction();
  };

  const availableVariables = getAvailableTemplateVariables();

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={handleClose}
      title="Add New Template"
      size="lg"
      footer={undefined}
    >
      <ValidatedForm onSubmit={handleAddTemplate}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Template Name</label>
              <Input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Enter template name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <Select
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as 'SMS' | 'VOICE' })}
              >
                <option value="SMS">SMS</option>
                <option value="VOICE">Voice Call</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Template Content</label>
            <Textarea
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
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
                        setNewTemplate({
                          ...newTemplate,
                          content: newTemplate.content + variable
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
              disabled={addingTemplate}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addingTemplate || !newTemplate.name.trim() || !newTemplate.content.trim()}
              variant="primary"
            >
              {addingTemplate ? 'Adding...' : 'Add Template'}
            </Button>
          </div>
        </div>
      </ValidatedForm>
    </Modal>
  );
}
