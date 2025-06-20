'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { ValidatedForm, ValidatedInput } from '@/components/ui/validation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createPatientSchema } from '@/lib/validation';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

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

interface NewPatientData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
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

interface PatientsTabProps {
  patients: Patient[];
  addPatientAction: (data: NewPatientData) => Promise<void>;
  updatePatientAction: (data: UpdatePatientData) => Promise<void>;
  deletePatientAction: (patientId: string, patientName: string) => Promise<void>;
  addingPatient: boolean;
}

export default function PatientsTab({ 
  patients, 
  addPatientAction, 
  updatePatientAction, 
  deletePatientAction,
  addingPatient 
}: PatientsTabProps) {
  // Validation hooks
  const newPatientValidation = useFormValidation(createPatientSchema);

  // New patient form
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    smsEnabled: true,
    voiceEnabled: false,
  });

  // Edit patient form
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editPatientData, setEditPatientData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    smsEnabled: true,
    voiceEnabled: false,
  });

  const handleAddPatient = async () => {
    const validation = newPatientValidation.validate(newPatient);
    
    if (!validation.isValid) {
      return;
    }

    if (validation.isValid && validation.data) {
      await addPatientAction(validation.data as NewPatientData);
    }
    
    // Clear form after successful add
    setNewPatient({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      smsEnabled: true,
      voiceEnabled: false,
    });
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setEditPatientData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      phoneNumber: patient.phoneNumber,
      email: patient.email || '',
      smsEnabled: patient.smsEnabled,
      voiceEnabled: patient.voiceEnabled,
    });
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient || !editPatientData.firstName || !editPatientData.lastName || !editPatientData.phoneNumber) {
      return;
    }

    await updatePatientAction({
      id: editingPatient.id,
      ...editPatientData,
    });
    
    setEditingPatient(null);
  };

  return (
    <div className="space-y-8">
      {/* Add New Patient */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ValidatedForm 
            errors={newPatientValidation.errors}
            onSubmit={(e) => {
              e.preventDefault();
              handleAddPatient();
            }}
            isLoading={addingPatient}
          >
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

            <Button
              type="submit"
              disabled={addingPatient}
              variant="primary"
            >
              {addingPatient ? 'Adding...' : 'Add Patient'}
            </Button>
          </ValidatedForm>
        </CardContent>
      </Card>

      {/* Edit Patient Modal */}
      {editingPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Edit2 className="mr-2 h-5 w-5" />
                Edit Patient: {editingPatient.firstName} {editingPatient.lastName}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingPatient(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={editPatientData.firstName}
                  onChange={(e) => setEditPatientData({ ...editPatientData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={editPatientData.lastName}
                  onChange={(e) => setEditPatientData({ ...editPatientData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input
                  value={editPatientData.phoneNumber}
                  onChange={(e) => setEditPatientData({ ...editPatientData, phoneNumber: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email (Optional)</label>
                <Input
                  value={editPatientData.email}
                  onChange={(e) => setEditPatientData({ ...editPatientData, email: e.target.value })}
                  placeholder="patient@example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-sms-enabled"
                  checked={editPatientData.smsEnabled}
                  onChange={(e) => setEditPatientData({ ...editPatientData, smsEnabled: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit-sms-enabled" className="text-sm font-medium text-gray-700">
                  SMS Enabled
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-voice-enabled"
                  checked={editPatientData.voiceEnabled}
                  onChange={(e) => setEditPatientData({ ...editPatientData, voiceEnabled: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit-voice-enabled" className="text-sm font-medium text-gray-700">
                  Voice Enabled
                </label>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleUpdatePatient}
                variant="primary"
              >
                <Save className="mr-2 h-4 w-4" />
                Update Patient
              </Button>
              <Button
                onClick={() => setEditingPatient(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>All Patients ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{patient.phoneNumber}</p>
                  {patient.email && (
                    <p className="text-sm text-gray-600">{patient.email}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {patient.smsEnabled && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">SMS</span>
                  )}
                  {patient.voiceEnabled && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Voice</span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPatient(patient)}
                    className="ml-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePatientAction(patient.id, `${patient.firstName} ${patient.lastName}`)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {patients.length === 0 && (
              <p className="text-gray-500 text-center py-8">No patients added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
