'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { useNotification } from '@/components/ui/notification';
import { Plus, Edit2, Trash2, Users, MessageSquare, Search } from 'lucide-react';
import AddGroupModal from './AddGroupModal';
import EditGroupModal from './EditGroupModal';
import type { Patient, PatientGroup } from '@/types';

interface PatientGroupsTabProps {
  patients: Patient[];
  patientGroups: PatientGroup[];
  setPatientGroupsAction: React.Dispatch<React.SetStateAction<PatientGroup[]>>;
}

export default function PatientGroupsTab({ 
  patients, 
  patientGroups, 
  setPatientGroupsAction 
}: PatientGroupsTabProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PatientGroup | null>(null);

  const { addNotification } = useNotification();

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
        const newGroup = result;
        setPatientGroupsAction(prevGroups => [newGroup, ...prevGroups]);
        setShowAddModal(false);
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
        const updatedGroup = result;
        setPatientGroupsAction(prevGroups => 
          prevGroups.map(group => 
            group.id === data.id ? updatedGroup : group
          )
        );
        setEditingGroup(null);
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
        setPatientGroupsAction(prevGroups => 
          prevGroups.filter(group => group.id !== groupId)
        );
        addNotification('success', 'Patient group deleted successfully');
      } else {
        addNotification('error', result.error || 'Failed to delete patient group');
      }
    } catch (error) {
      console.error('Error deleting patient group:', error);
      addNotification('error', 'Failed to delete patient group');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Groups</h2>
          <p className="text-gray-600">Organize patients into groups for targeted communication</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          variant="primary"
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Group
        </Button>
      </div>

      {/* Search */}
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

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>All Groups ({filteredGroups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {patientGroups.length === 0 
                  ? 'No patient groups found. Create your first group to get started.' 
                  : 'No groups match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: group.color }}
                      ></div>
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {group._count.patients} patient{group._count.patients !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement quick message functionality
                        addNotification('info', 'Quick message feature coming soon');
                      }}
                      className="flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditGroup(group);
                      }}
                    >
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
