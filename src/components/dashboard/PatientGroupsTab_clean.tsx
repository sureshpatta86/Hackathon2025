'use client';

import { useState, useEffect } from 'react';
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
  _count: {
    patients: number;
  };
  patients: Array<{
    patient: Patient;
  }>;
}

interface PatientGroupsTabProps {
  patients: Patient[];
}

export default function PatientGroupsTab({ patients }: PatientGroupsTabProps) {
  const [patientGroups, setPatientGroups] = useState<PatientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PatientGroup | null>(null);

  const { addNotification } = useNotification();

  // Load patient groups
  const fetchPatientGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patient-groups');
      if (response.ok) {
        const groups = await response.json();
        setPatientGroups(groups);
      } else {
        console.error('Failed to fetch patient groups');
      }
    } catch (error) {
      console.error('Error fetching patient groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientGroups();
  }, []);

  // Filter groups based on local search query
  const filteredGroups = patientGroups.filter(group => {
    if (!localSearchQuery) return true;
    
    const searchLower = localSearchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    );
  });

  // Modal handlers
  const handleAddGroupAction = async (data: {
    name: string;
    description?: string;
    color: string;
    patientIds: string[];
  }) => {
    try {
      setAddingGroup(true);
      
      const response = await fetch('/api/patient-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        fetchPatientGroups();
        addNotification('success', 'Patient group created successfully');
      } else {
        addNotification('error', result.error || 'Failed to create patient group');
      }
    } catch (error) {
      console.error('Error creating patient group:', error);
      addNotification('error', 'Failed to create patient group');
    } finally {
      setAddingGroup(false);
    }
  };

  const handleUpdateGroupAction = async (data: {
    id: string;
    name: string;
    description: string;
    color: string;
    patientIds: string[];
  }) => {
    try {
      setUpdatingGroup(true);
      
      const response = await fetch('/api/patient-groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setEditingGroup(null);
        fetchPatientGroups();
        addNotification('success', 'Patient group updated successfully');
      } else {
        addNotification('error', result.error || 'Failed to update patient group');
      }
    } catch (error) {
      console.error('Error updating patient group:', error);
      addNotification('error', 'Failed to update patient group');
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleEditGroup = (group: PatientGroup) => {
    setEditingGroup(group);
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/patient-groups?id=${groupId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        addNotification('success', 'Patient group deleted successfully');
        await fetchPatientGroups();
      } else {
        addNotification('error', result.error || 'Failed to delete patient group');
      }
    } catch (error) {
      console.error('Error deleting patient group:', error);
      addNotification('error', 'Failed to delete patient group');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with local search and add button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Patient Groups</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Group</span>
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditGroup(group)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {group.description && (
                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {group._count.patients} patient{group._count.patients !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={() => {
                    // TODO: Implement quick message functionality
                    addNotification('info', 'Quick message feature coming soon');
                  }}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Message</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {localSearchQuery ? 'No groups found' : 'No patient groups yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {localSearchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first patient group to organize your patients'
              }
            </p>
            {!localSearchQuery && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddGroupModal
        isOpen={showAddModal}
        onCloseAction={() => setShowAddModal(false)}
        addGroupAction={handleAddGroupAction}
        addingGroup={addingGroup}
        patients={patients}
      />

      {editingGroup && (
        <EditGroupModal
          isOpen={!!editingGroup}
          onCloseAction={() => setEditingGroup(null)}
          onUpdateGroupAction={handleUpdateGroupAction}
          updatingGroup={updatingGroup}
          patients={patients}
          group={editingGroup}
        />
      )}
    </div>
  );
}
