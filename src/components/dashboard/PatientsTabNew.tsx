'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import AddPatientModal from './AddPatientModal';
import EditPatientModal from './EditPatientModal';

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
  searchQuery?: string;
}

export default function PatientsTab({ 
  patients, 
  addPatientAction, 
  updatePatientAction, 
  deletePatientAction,
  addingPatient,
  searchQuery = '' 
}: PatientsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [updatingPatient, setUpdatingPatient] = useState(false);

  // Filter patients based on search query (both global and local)
  const filteredPatients = patients.filter(patient => {
    const query = searchQuery || localSearchQuery;
    if (!query) return true;
    
    const searchLower = query.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.phoneNumber.includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddPatient = async (data: NewPatientData) => {
    await addPatientAction(data);
    setShowAddModal(false);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
  };

  const handleUpdatePatient = async (data: UpdatePatientData) => {
    setUpdatingPatient(true);
    try {
      await updatePatientAction(data);
      setEditingPatient(null);
    } finally {
      setUpdatingPatient(false);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
      await deletePatientAction(patient.id, `${patient.firstName} ${patient.lastName}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button and Search */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600">Manage your patient database and contact information</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Local Search (if no global search is active) */}
      {!searchQuery && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search patients by name, phone, or email..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {patients.length === 0 ? 'No patients found. Add your first patient to get started.' : 'No patients match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{patient.phoneNumber}</span>
                      {patient.email && <span>{patient.email}</span>}
                      <div className="flex space-x-1">
                        {patient.smsEnabled && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">SMS</span>
                        )}
                        {patient.voiceEnabled && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Voice</span>
                        )}
                      </div>
                    </div>
                    {patient._count && (
                      <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                        <span>{patient._count.appointments} appointments</span>
                        <span>{patient._count.communications} messages</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPatient(patient)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeletePatient(patient)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        onCloseAction={() => setShowAddModal(false)}
        addPatientAction={handleAddPatient}
        addingPatient={addingPatient}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={!!editingPatient}
        onCloseAction={() => setEditingPatient(null)}
        patient={editingPatient}
        updatePatientAction={handleUpdatePatient}
        updatingPatient={updatingPatient}
      />
    </div>
  );
}
