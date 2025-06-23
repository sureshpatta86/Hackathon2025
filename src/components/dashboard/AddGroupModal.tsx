'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form';
import { ValidatedForm, ValidatedInput } from '@/components/ui/validation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createPatientGroupSchema } from '@/lib/validation';

interface NewPatientGroupData {
  name: string;
  description?: string;
  color: string;
  patientIds: string[];
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
}

interface AddGroupModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  addGroupAction: (data: NewPatientGroupData) => Promise<void>;
  addingGroup: boolean;
  patients: Patient[];
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#06B6D4', // Cyan
];

export default function AddGroupModal({
  isOpen,
  onCloseAction,
  addGroupAction,
  addingGroup,
  patients
}: AddGroupModalProps) {
  const groupValidation = useFormValidation(createPatientGroupSchema);
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    patientIds: [] as string[],
  });

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = groupValidation.validate({
      name: newGroup.name,
      description: newGroup.description,
      color: newGroup.color,
    });
    
    if (!validation.isValid) {
      return;
    }

    await addGroupAction({
      ...newGroup,
      patientIds: newGroup.patientIds,
    });
    
    // Clear form and close modal after successful add
    setNewGroup({
      name: '',
      description: '',
      color: PRESET_COLORS[0],
      patientIds: [],
    });
    onCloseAction();
  };

  const handleClose = () => {
    // Reset form when closing
    setNewGroup({
      name: '',
      description: '',
      color: PRESET_COLORS[0],
      patientIds: [],
    });
    groupValidation.clearErrors();
    onCloseAction();
  };

  const handlePatientToggle = (patientId: string) => {
    setNewGroup(prev => ({
      ...prev,
      patientIds: prev.patientIds.includes(patientId)
        ? prev.patientIds.filter(id => id !== patientId)
        : [...prev.patientIds, patientId]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={handleClose}
      title="Create New Patient Group"
      size="lg"
    >
      <ValidatedForm 
        onSubmit={handleAddGroup}
        errors={groupValidation.errors}
      >
        <div className="space-y-4">
          <ValidatedInput
            label="Group Name"
            name="name"
            value={newGroup.name}
            onChange={(value) => {
              setNewGroup({ ...newGroup, name: value });
              groupValidation.clearFieldError('name');
            }}
            placeholder="Enter group name"
            required
            error={groupValidation.errors.name}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <Textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              placeholder="Enter group description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewGroup({ ...newGroup, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newGroup.color === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Patients ({newGroup.patientIds.length} selected)
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {patients.map((patient) => (
                <label key={patient.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newGroup.patientIds.includes(patient.id)}
                    onChange={() => handlePatientToggle(patient.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </span>
                    <div className="text-sm text-gray-500">
                      {patient.phoneNumber} {patient.email && `• ${patient.email}`}
                    </div>
                  </div>
                </label>
              ))}
              
              {patients.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No patients available
                </p>
              )}
            </div>
          </div>

          {/* Buttons inside the form */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addingGroup}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addingGroup || !newGroup.name.trim()}
              variant="primary"
            >
              {addingGroup ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </div>
      </ValidatedForm>
    </Modal>
  );
}
