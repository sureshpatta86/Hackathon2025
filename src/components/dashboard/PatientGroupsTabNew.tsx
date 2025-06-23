'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { useNotification } from '@/components/ui/notification';
import { Plus, Edit2, Trash2, Users, MessageSquare, Search } from 'lucide-react';
import AddGroupModal from './AddGroupModal';
import EditGroupModal from './EditGroupModal';

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

interface PatientGroupsTabProps {
  patients: Patient[];
}

export default function PatientGroupsTab({ patients }: PatientGroupsTabProps) {
  const [patientGroups, setPatientGroups] = useState<PatientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingGroup, setAddingGroup] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PatientGroup | null>(null);

  const { addNotification } = useNotification();

  // Load patient groups
  const fetchPatientGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patient-groups');
      if (response.ok) {
        const data = await response.json();
        setPatientGroups(data);
      }
    } catch (error) {
      console.error('Error fetching patient groups:', error);
      addNotification('error', 'Failed to load patient groups');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchPatientGroups();
  }, [fetchPatientGroups]);

  // Filter groups based on local search query
  const filteredGroups = patientGroups.filter(group => {
    if (!localSearchQuery) return true;
    
    const searchLower = localSearchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddGroup = async (data: {
    name: string;
    description?: string;
    color: string;
    patientIds: string[];
  }) => {
    setAddingGroup(true);
    try {
      const response = await fetch('/api/patient-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addNotification('success', 'Patient group created successfully!');
        fetchPatientGroups();
        setShowAddModal(false);
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating patient group:', error);
      addNotification('error', 'Failed to create patient group');
    } finally {
      setAddingGroup(false);
    }
  };

  const handleEditGroup = (group: PatientGroup) => {
    setEditingGroup(group);
  };

  const handleUpdateGroup = async (data: {
    id: string;
    name: string;
    description: string;
    color: string;
    patientIds: string[];
  }) => {
    setUpdatingGroup(true);
    try {
      const response = await fetch('/api/patient-groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addNotification('success', 'Patient group updated successfully!');
        fetchPatientGroups();
        setEditingGroup(null);
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating patient group:', error);
      addNotification('error', 'Failed to update patient group');
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete group "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/patient-groups?id=${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addNotification('success', 'Patient group deleted successfully!');
        fetchPatientGroups();
      } else {
        const error = await response.json();
        addNotification('error', `Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting patient group:', error);
      addNotification('error', 'Failed to delete patient group');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading patient groups...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Groups */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search groups by name or description..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add New Patient Group Button */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              className="mb-2"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Patient Group
            </Button>
            <p className="text-sm text-gray-500">
              Create groups to organize patients for bulk messaging
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Patient Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Groups ({filteredGroups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{group._count.patients} patient{group._count.patients === 1 ? '' : 's'}</span>
                        </div>
                        {group._count.patients > 0 && (
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>Ready for bulk messaging</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Group Members Preview */}
                      {group.patients.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {group.patients.slice(0, 5).map(({ patient }) => (
                            <span key={patient.id} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {patient.firstName} {patient.lastName}
                            </span>
                          ))}
                          {group.patients.length > 5 && (
                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                              +{group.patients.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditGroup(group)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredGroups.length === 0 && localSearchQuery && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No groups found matching &quot;{localSearchQuery}&quot;</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search term.</p>
              </div>
            )}

            {patientGroups.length === 0 && !localSearchQuery && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No patient groups created yet.</p>
                <p className="text-sm text-gray-400 mt-1">Create groups to organize patients for bulk messaging.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Group Modal */}
      <AddGroupModal
        isOpen={showAddModal}
        onCloseAction={() => setShowAddModal(false)}
        addGroupAction={handleAddGroup}
        addingGroup={addingGroup}
        patients={patients}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        isOpen={!!editingGroup}
        onCloseAction={() => setEditingGroup(null)}
        group={editingGroup}
        patients={patients}
        onUpdateGroupAction={handleUpdateGroup}
        updatingGroup={updatingGroup}
      />
    </div>
  );
}
