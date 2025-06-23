'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ValidatedForm, ValidatedInput } from '@/components/ui/validation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createPatientSchema } from '@/lib/validation';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
  _count?: {
    appointments: number;
    communications: number;
  };
}

interface UpdatePatientData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
}

interface EditPatientModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  patient: Patient | null;
  updatePatientAction: (data: UpdatePatientData) => Promise<void>;
  updatingPatient: boolean;
}

export default function EditPatientModal({
  isOpen,
  onCloseAction,
  patient,
  updatePatientAction,
  updatingPatient
}: EditPatientModalProps) {
  const editPatientValidation = useFormValidation(createPatientSchema);
  
  const [editPatientData, setEditPatientData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    smsEnabled: true,
    voiceEnabled: false,
  });

  // Update form data when patient changes
  useEffect(() => {
    if (patient) {
      setEditPatientData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        phoneNumber: patient.phoneNumber,
        email: patient.email || '',
        smsEnabled: patient.smsEnabled,
        voiceEnabled: patient.voiceEnabled,
      });
    }
  }, [patient]);

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const validation = editPatientValidation.validate(editPatientData);
    
    if (!validation.isValid) {
      return;
    }

    if (validation.isValid && validation.data) {
      await updatePatientAction({
        id: patient.id,
        ...validation.data
      } as UpdatePatientData);
      onCloseAction();
    }
  };

  const handleClose = () => {
    editPatientValidation.clearErrors();
    onCloseAction();
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={handleClose}
      title={patient ? `Edit Patient: ${patient.firstName} ${patient.lastName}` : 'Edit Patient'}
      size="md"
    >
      <ValidatedForm 
        onSubmit={handleUpdatePatient}
        errors={editPatientValidation.errors}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="First Name"
              name="firstName"
              value={editPatientData.firstName}
              onChange={(value) => {
                setEditPatientData({ ...editPatientData, firstName: value });
                editPatientValidation.clearFieldError('firstName');
              }}
              placeholder="Enter first name"
              required
              error={editPatientValidation.errors.firstName}
            />
            <ValidatedInput
              label="Last Name"
              name="lastName"
              value={editPatientData.lastName}
              onChange={(value) => {
                setEditPatientData({ ...editPatientData, lastName: value });
                editPatientValidation.clearFieldError('lastName');
              }}
              placeholder="Enter last name"
              required
              error={editPatientValidation.errors.lastName}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Phone Number"
              name="phoneNumber"
              value={editPatientData.phoneNumber}
              onChange={(value) => {
                setEditPatientData({ ...editPatientData, phoneNumber: value });
                editPatientValidation.clearFieldError('phoneNumber');
              }}
              placeholder="+1234567890"
              required
              error={editPatientValidation.errors.phoneNumber}
            />
            <ValidatedInput
              label="Email"
              name="email"
              type="email"
              value={editPatientData.email}
              onChange={(value) => {
                setEditPatientData({ ...editPatientData, email: value });
                editPatientValidation.clearFieldError('email');
              }}
              placeholder="email@example.com"
              error={editPatientValidation.errors.email}
            />
          </div>

          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editPatientData.smsEnabled}
                onChange={(e) => setEditPatientData({ ...editPatientData, smsEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Enable SMS</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editPatientData.voiceEnabled}
                onChange={(e) => setEditPatientData({ ...editPatientData, voiceEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Enable Voice Calls</span>
            </label>
          </div>

          {/* Buttons inside the form */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updatingPatient}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatingPatient}
              variant="primary"
            >
              {updatingPatient ? 'Updating...' : 'Update Patient'}
            </Button>
          </div>
        </div>
      </ValidatedForm>
    </Modal>
  );
}
