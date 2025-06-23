'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ValidatedForm, ValidatedInput } from '@/components/ui/validation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { updatePatientGroupSchema } from '@/lib/validation';
import { Users } from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
}

interface PatientGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  patients: { patient: Patient }[];
  _count: { patients: number };
}

interface EditGroupModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  group: PatientGroup | null;
  patients: Patient[];
  onUpdateGroupAction: (data: {
    id: string;
    name: string;
    description: string;
    color: string;
    patientIds: string[];
  }) => Promise<void>;
  updatingGroup: boolean;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export default function EditGroupModal({
  isOpen,
  onCloseAction,
  group,
  patients,
  onUpdateGroupAction,
  updatingGroup
}: EditGroupModalProps) {
  const [editGroupData, setEditGroupData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    patientIds: [] as string[],
  });

  const editGroupValidation = useFormValidation(updatePatientGroupSchema);

  // Initialize form data when group changes
  useEffect(() => {
    if (group) {
      setEditGroupData({
        name: group.name,
        description: group.description || '',
        color: group.color,
        patientIds: group.patients.map(p => p.patient.id),
      });
      editGroupValidation.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  const handlePatientSelection = (patientId: string) => {
    setEditGroupData(prev => ({
      ...prev,
      patientIds: prev.patientIds.includes(patientId)
        ? prev.patientIds.filter(id => id !== patientId)
        : [...prev.patientIds, patientId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    const dataToValidate = {
      id: group.id,
      ...editGroupData
    };
    
    const validation = editGroupValidation.validate(dataToValidate);
    
    if (!validation.isValid) {
      return;
    }

    await onUpdateGroupAction(dataToValidate);
  };

  const handleClose = () => {
    if (!updatingGroup) {
      editGroupValidation.clearErrors();
      onCloseAction();
    }
  };

  if (!group) return null;

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={handleClose}
      title={`Edit Group: ${group.name}`}
      size="lg"
    >
      <ValidatedForm 
        errors={editGroupValidation.errors}
        onSubmit={handleSubmit}
        isLoading={updatingGroup}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Group Name"
              name="name"
              value={editGroupData.name}
              onChange={(value) => {
                setEditGroupData({ ...editGroupData, name: value });
                editGroupValidation.clearFieldError('name');
              }}
              placeholder="Enter group name"
              required
              error={editGroupValidation.errors.name}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Group Color</label>
              <div className="flex space-x-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditGroupData({ ...editGroupData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      editGroupData.color === color ? 'border-gray-600 ring-2 ring-gray-300' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <ValidatedInput
            label="Description (Optional)"
            name="description"
            value={editGroupData.description}
            onChange={(value) => {
              setEditGroupData({ ...editGroupData, description: value });
              editGroupValidation.clearFieldError('description');
            }}
            placeholder="Enter group description"
            error={editGroupValidation.errors.description}
          />

          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Group Members</label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-4 space-y-2">
              {patients.map((patient) => (
                <label key={patient.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editGroupData.patientIds.includes(patient.id)}
                    onChange={() => handlePatientSelection(patient.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </span>
                      <span className="text-sm text-gray-600">({patient.phoneNumber})</span>
                      {patient.smsEnabled && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">SMS</span>
                      )}
                      {patient.voiceEnabled && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Voice</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
              
              {patients.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No patients available</p>
                </div>
              )}
            </div>
            
            {editGroupData.patientIds.length > 0 && (
              <p className="text-sm text-blue-600">
                {editGroupData.patientIds.length} patient{editGroupData.patientIds.length === 1 ? '' : 's'} selected
              </p>
            )}
          </div>

          {/* Buttons inside the form */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updatingGroup}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatingGroup}
              variant="primary"
            >
              {updatingGroup ? 'Updating...' : 'Update Group'}
            </Button>
          </div>
        </div>
      </ValidatedForm>
    </Modal>
  );
}
