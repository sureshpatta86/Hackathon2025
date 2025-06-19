import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/twilio';
import { createPatientSchema, updatePatientSchema, validateRequestBody } from '@/lib/validation';

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
    // Validate request body
    const validation = await validateRequestBody(request, createPatientSchema);
    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const { firstName, lastName, phoneNumber, email, dateOfBirth, smsEnabled, voiceEnabled, medicalNotes } = validation.data;

    // Additional phone number validation using Twilio helper
    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: { phoneNumber: 'Invalid phone number format for your region' }
        },
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
        { 
          message: 'Validation failed',
          errors: { phoneNumber: 'Patient with this phone number already exists' }
        },
        { status: 409 }
      );
    }

    const patient = await db.patient.create({
      data: {
        firstName,
        lastName,
        phoneNumber: formattedPhone,
        email: email || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        smsEnabled: smsEnabled ?? true,
        voiceEnabled: voiceEnabled ?? true,
        medicalNotes: medicalNotes || null,
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
    // Validate request body
    const validation = await validateRequestBody(request, updatePatientSchema);
    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const { id, firstName, lastName, phoneNumber, email, dateOfBirth, smsEnabled, voiceEnabled, medicalNotes } = validation.data;

    // Additional phone number validation using Twilio helper
    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: { phoneNumber: 'Invalid phone number format for your region' }
        },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

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

    // Check if another patient already has this phone number (if changing)
    if (formattedPhone !== existingPatient.phoneNumber) {
      const phoneConflict = await db.patient.findUnique({
        where: { phoneNumber: formattedPhone },
      });

      if (phoneConflict) {
        return NextResponse.json(
          { 
            message: 'Validation failed',
            errors: { phoneNumber: 'Another patient already has this phone number' }
          },
          { status: 409 }
        );
      }
    }

    const updatedPatient = await db.patient.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phoneNumber: formattedPhone,
        email: email || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        smsEnabled: smsEnabled ?? true,
        voiceEnabled: voiceEnabled ?? true,
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
