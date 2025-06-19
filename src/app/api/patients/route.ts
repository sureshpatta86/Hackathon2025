import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/twilio';

// GET /api/patients - Get all patients
export async function GET() {
  try {
    const patients = await db.patient.findMany({
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 5,
        },
        communications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            appointments: true,
            communications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phoneNumber, email, dateOfBirth, smsEnabled, voiceEnabled, medicalNotes } = body;

    // Validation
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: 'firstName, lastName, and phoneNumber are required' },
        { status: 400 }
      );
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Check if patient with this phone number already exists
    const existingPatient = await db.patient.findUnique({
      where: { phoneNumber: formattedPhone },
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Patient with this phone number already exists' },
        { status: 409 }
      );
    }

    const patient = await db.patient.create({
      data: {
        firstName,
        lastName,
        phoneNumber: formattedPhone,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        smsEnabled: smsEnabled ?? true,
        voiceEnabled: voiceEnabled ?? true,
        medicalNotes,
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}

// PUT /api/patients - Update an existing patient
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, firstName, lastName, phoneNumber, email, dateOfBirth, smsEnabled, voiceEnabled, medicalNotes } = body;

    // Validation
    if (!id || !firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: 'id, firstName, lastName, and phoneNumber are required' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const existingPatient = await db.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const updatedPatient = await db.patient.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phoneNumber,
        email: email || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        smsEnabled: smsEnabled !== undefined ? smsEnabled : true,
        voiceEnabled: voiceEnabled !== undefined ? voiceEnabled : true,
        medicalNotes: medicalNotes || null,
      },
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// DELETE /api/patients - Delete a patient
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const existingPatient = await db.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Delete patient (will cascade delete related records due to schema)
    await db.patient.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
