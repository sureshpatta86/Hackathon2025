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
      await db.patientGroupMember.createMany({
        data: patientIds.map((patientId: string) => ({
          patientId,
          groupId: group.id,
        })),
        skipDuplicates: true,
      });
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
