import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/patient-groups - Get all patient groups
export async function GET() {
  try {
    const groups = await db.patientGroup.findMany({
      include: {
        patients: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
        _count: {
          select: {
            patients: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching patient groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient groups' },
      { status: 500 }
    );
  }
}

// POST /api/patient-groups - Create a new patient group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, patientIds } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Create the group
    const group = await db.patientGroup.create({
      data: {
        name,
        description,
        color: color || '#3B82F6',
      },
    });

    // Add patients to the group if provided
    if (patientIds && Array.isArray(patientIds) && patientIds.length > 0) {
      try {
        await db.patientGroupMember.createMany({
          data: patientIds.map((patientId: string) => ({
            patientId,
            groupId: group.id,
          })),
        });
      } catch (memberError) {
        // If there are duplicate key errors, try adding them one by one
        console.warn('Bulk insert failed, trying individual inserts:', memberError);
        for (const patientId of patientIds) {
          try {
            await db.patientGroupMember.create({
              data: {
                patientId,
                groupId: group.id,
              },
            });
          } catch (individualError) {
            // Skip if already exists, log other errors
            const errorMessage = individualError instanceof Error ? individualError.message : String(individualError);
            if (!errorMessage.includes('Unique constraint')) {
              console.error('Error adding patient to group:', individualError);
            }
          }
        }
      }
    }

    // Fetch the complete group with members
    const completeGroup = await db.patientGroup.findUnique({
      where: { id: group.id },
      include: {
        patients: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
        _count: {
          select: {
            patients: true,
          },
        },
      },
    });

    return NextResponse.json(completeGroup, { status: 201 });
  } catch (error) {
    console.error('Error creating patient group:', error);
    return NextResponse.json(
      { error: 'Failed to create patient group' },
      { status: 500 }
    );
  }
}

// PUT /api/patient-groups - Update an existing patient group
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, color, patientIds } = body;

    // Validation
    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    // Update the group
    const group = await db.patientGroup.update({
      where: { id },
      data: {
        name,
        description,
        color: color || '#3B82F6',
      },
    });

    // Update group members if provided
    if (patientIds && Array.isArray(patientIds)) {
      // Remove all existing members
      await db.patientGroupMember.deleteMany({
        where: { groupId: group.id },
      });

      // Add new members
      if (patientIds.length > 0) {
        await db.patientGroupMember.createMany({
          data: patientIds.map((patientId: string) => ({
            patientId,
            groupId: group.id,
          })),
        });
      }
    }

    // Fetch the complete group with members
    const completeGroup = await db.patientGroup.findUnique({
      where: { id: group.id },
      include: {
        patients: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
        _count: {
          select: {
            patients: true,
          },
        },
      },
    });

    return NextResponse.json(completeGroup);
  } catch (error) {
    console.error('Error updating patient group:', error);
    return NextResponse.json(
      { error: 'Failed to update patient group' },
      { status: 500 }
    );
  }
}

// DELETE /api/patient-groups - Delete a patient group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Check if group exists
    const existingGroup = await db.patientGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Patient group not found' },
        { status: 404 }
      );
    }

    // Delete group (will cascade delete related records due to schema)
    await db.patientGroup.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Patient group deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient group:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient group' },
      { status: 500 }
    );
  }
}
