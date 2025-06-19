import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/twilio';

// POST /api/patients/import - Import patients from CSV data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvData, skipHeader = true } = body;

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json(
        { error: 'csvData array is required' },
        { status: 400 }
      );
    }

    const results = {
      total: csvData.length - (skipHeader ? 1 : 0),
      successful: 0,
      failed: 0,
      errors: [] as string[],
      imported: [] as { id: string; name: string; phoneNumber: string; email: string | null }[],
    };

    const dataToProcess = skipHeader ? csvData.slice(1) : csvData;

    for (let i = 0; i < dataToProcess.length; i++) {
      const row = dataToProcess[i];
      const rowNumber = i + (skipHeader ? 2 : 1); // Account for header and 1-based indexing

      try {
        // Expected CSV format: firstName, lastName, phoneNumber, email, smsEnabled, voiceEnabled, medicalNotes
        const [
          firstName,
          lastName, 
          phoneNumber,
          email = '',
          smsEnabled = 'true',
          voiceEnabled = 'true',
          medicalNotes = ''
        ] = row;

        // Validation
        if (!firstName || !lastName || !phoneNumber) {
          results.errors.push(`Row ${rowNumber}: firstName, lastName, and phoneNumber are required`);
          results.failed++;
          continue;
        }

        if (!isValidPhoneNumber(phoneNumber)) {
          results.errors.push(`Row ${rowNumber}: Invalid phone number format: ${phoneNumber}`);
          results.failed++;
          continue;
        }

        const formattedPhone = formatPhoneNumber(phoneNumber);

        // Check if patient already exists
        const existingPatient = await db.patient.findUnique({
          where: { phoneNumber: formattedPhone },
        });

        if (existingPatient) {
          results.errors.push(`Row ${rowNumber}: Patient with phone number ${formattedPhone} already exists`);
          results.failed++;
          continue;
        }

        // Create patient
        const patient = await db.patient.create({
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: formattedPhone,
            email: email.trim() || null,
            smsEnabled: smsEnabled.toLowerCase() === 'true' || smsEnabled === '1',
            voiceEnabled: voiceEnabled.toLowerCase() === 'true' || voiceEnabled === '1',
            medicalNotes: medicalNotes.trim() || null,
          },
        });

        results.imported.push({
          id: patient.id,
          name: `${patient.firstName} ${patient.lastName}`,
          phoneNumber: patient.phoneNumber,
          email: patient.email,
        });

        results.successful++;
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.failed++;
      }
    }

    return NextResponse.json({
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    console.error('Error importing patients:', error);
    return NextResponse.json(
      { error: 'Failed to import patients' },
      { status: 500 }
    );
  }
}

// GET /api/patients/import/template - Get CSV template
export async function GET() {
  const template = [
    ['firstName', 'lastName', 'phoneNumber', 'email', 'smsEnabled', 'voiceEnabled', 'medicalNotes'],
    ['John', 'Doe', '+1234567890', 'john.doe@example.com', 'true', 'true', 'Regular checkup patient'],
    ['Jane', 'Smith', '+1987654321', 'jane.smith@example.com', 'true', 'false', 'Prefers SMS only'],
    ['Robert', 'Johnson', '+1555123456', '', 'false', 'true', 'Elderly patient, prefers voice calls'],
  ];

  return NextResponse.json({
    template,
    headers: template[0],
    description: {
      firstName: 'Patient first name (required)',
      lastName: 'Patient last name (required)', 
      phoneNumber: 'Phone number in international format, e.g., +1234567890 (required)',
      email: 'Email address (optional)',
      smsEnabled: 'true/false - whether SMS is enabled for this patient (default: true)',
      voiceEnabled: 'true/false - whether voice calls are enabled for this patient (default: true)',
      medicalNotes: 'Any additional notes about the patient (optional)',
    },
  });
}
