import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/patients/[id] - Get a specific patient
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const patient = await db.patient.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
        },
        communications: {
          orderBy: { createdAt: 'desc' },
          include: {
            template: true,
            appointment: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[id] - Update a patient
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { firstName, lastName, phoneNumber, email, dateOfBirth, smsEnabled, voiceEnabled, medicalNotes } = body;

    const patient = await db.patient.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        phoneNumber,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        smsEnabled,
        voiceEnabled,
        medicalNotes,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Delete a patient
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await db.patient.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
