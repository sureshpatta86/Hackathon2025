import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/appointments - Get all appointments
export async function GET() {
  try {
    const appointments = await db.appointment.findMany({
      include: {
        patient: true,
        communications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, title, description, appointmentDate, duration } = body;

    // Validation
    if (!patientId || !title || !appointmentDate) {
      return NextResponse.json(
        { error: 'patientId, title, and appointmentDate are required' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        patientId,
        title,
        description,
        appointmentDate: new Date(appointmentDate),
        duration: duration || 30,
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
