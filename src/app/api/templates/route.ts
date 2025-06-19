import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const templates = await db.template.findMany({
      where: type ? { type: type as 'SMS' | 'VOICE' } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, content, variables, voiceSpeed, voicePitch } = body;

    // Validation
    if (!name || !type || !content) {
      return NextResponse.json(
        { error: 'name, type, and content are required' },
        { status: 400 }
      );
    }

    if (!['SMS', 'VOICE'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be either SMS or VOICE' },
        { status: 400 }
      );
    }

    const template = await db.template.create({
      data: {
        name,
        type,
        content,
        variables: variables ? JSON.stringify(variables) : null,
        voiceSpeed: type === 'VOICE' ? voiceSpeed || 1.0 : null,
        voicePitch: type === 'VOICE' ? voicePitch || 0.0 : null,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates - Update an existing template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, content, variables, voiceSpeed, voicePitch } = body;

    // Validation
    if (!id || !name || !type || !content) {
      return NextResponse.json(
        { error: 'id, name, type, and content are required' },
        { status: 400 }
      );
    }

    if (!['SMS', 'VOICE'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be either SMS or VOICE' },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await db.template.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const updatedTemplate = await db.template.update({
      where: { id },
      data: {
        name,
        type,
        content,
        variables: variables ? JSON.stringify(variables) : null,
        voiceSpeed: type === 'VOICE' ? voiceSpeed || 1.0 : null,
        voicePitch: type === 'VOICE' ? voicePitch || 0.0 : null,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await db.template.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete template
    await db.template.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
