import { NextResponse } from 'next/server';
import { CreateProjectRequestSchema, UpdateProjectRequestSchema } from '@/types/response';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        CreateProjectRequestSchema.parse(body);

        // Mock successful project creation
        return NextResponse.json({
            id: 1,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create project', details: error },
            { status: 500 }
        );
    }
}

// Delete project
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const projectId = url.searchParams.get('pId');

        if (!projectId) {
            return NextResponse.json(
                { error: 'pId is required for deleting a project in /api/projects' },
                { status: 400 });
        }

        // Mock successful project deletion
        return NextResponse.json({
            id: parseInt(projectId),
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete project', details: error },
            { status: 500 }
        );
    }
}

// Update project
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        UpdateProjectRequestSchema.parse(body);

        // Mock successful project update
        return NextResponse.json({
            id: body.id,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update project' + error, details: error },
            { status: 500 }
        );
    }
}

