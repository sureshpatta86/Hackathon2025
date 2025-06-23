'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ValidatedForm, ValidatedInput } from '@/components/ui/validation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createPatientSchema } from '@/lib/validation';

interface NewPatientData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
}

interface AddPatientModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  addPatientAction: (data: NewPatientData) => Promise<void>;
  addingPatient: boolean;
}

export default function AddPatientModal({
  isOpen,
  onCloseAction,
  addPatientAction,
  addingPatient
}: AddPatientModalProps) {
  const newPatientValidation = useFormValidation(createPatientSchema);
  
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    smsEnabled: true,
    voiceEnabled: false,
  });

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 Add Patient form submitted!');
    console.log('Patient data:', newPatient);
    
    const validation = newPatientValidation.validate(newPatient);
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      return;
    }

    if (validation.isValid && validation.data) {
      console.log('✅ Validation passed, calling API...');
      // Add missing optional fields that the API expects
      const patientData = {
        ...validation.data,
        dateOfBirth: undefined, // Optional field
        medicalNotes: undefined, // Optional field
      };
      
      console.log('📤 Sending patient data:', patientData);
      await addPatientAction(patientData as NewPatientData);
      // Clear form after successful add
      setNewPatient({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        smsEnabled: true,
        voiceEnabled: false,
      });
      // Don't close modal here - let parent handle it
      // onCloseAction();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setNewPatient({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      smsEnabled: true,
      voiceEnabled: false,
    });
    newPatientValidation.clearErrors();
    onCloseAction();
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={handleClose}
      title="Add New Patient"
      size="md"
    >
      <ValidatedForm 
        onSubmit={handleAddPatient}
        errors={newPatientValidation.errors}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="First Name"
              name="firstName"
              value={newPatient.firstName}
              onChange={(value) => {
                setNewPatient({ ...newPatient, firstName: value });
                newPatientValidation.clearFieldError('firstName');
              }}
              placeholder="Enter first name"
              required
              error={newPatientValidation.errors.firstName}
            />
            <ValidatedInput
              label="Last Name"
              name="lastName"
              value={newPatient.lastName}
              onChange={(value) => {
                setNewPatient({ ...newPatient, lastName: value });
                newPatientValidation.clearFieldError('lastName');
              }}
              placeholder="Enter last name"
              required
              error={newPatientValidation.errors.lastName}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Phone Number"
              name="phoneNumber"
              value={newPatient.phoneNumber}
              onChange={(value) => {
                setNewPatient({ ...newPatient, phoneNumber: value });
                newPatientValidation.clearFieldError('phoneNumber');
              }}
              placeholder="+1234567890"
              required
              error={newPatientValidation.errors.phoneNumber}
            />
            <ValidatedInput
              label="Email"
              name="email"
              type="email"
              value={newPatient.email}
              onChange={(value) => {
                setNewPatient({ ...newPatient, email: value });
                newPatientValidation.clearFieldError('email');
              }}
              placeholder="email@example.com"
              error={newPatientValidation.errors.email}
            />
          </div>

          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newPatient.smsEnabled}
                onChange={(e) => setNewPatient({ ...newPatient, smsEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Enable SMS</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newPatient.voiceEnabled}
                onChange={(e) => setNewPatient({ ...newPatient, voiceEnabled: e.target.checked })}
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
              disabled={addingPatient}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addingPatient}
              variant="primary"
            >
              {addingPatient ? 'Adding...' : 'Add Patient'}
            </Button>
          </div>
        </div>
      </ValidatedForm>
    </Modal>
  );
}
