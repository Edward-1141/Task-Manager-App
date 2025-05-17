import { NextResponse } from 'next/server';
import { CreateStatusRequestSchema, UpdateStatusRequestSchema } from '@/types/response';

// Create status
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        CreateStatusRequestSchema.parse(body);

        // Mock successful status creation
        return NextResponse.json({
            id: 1234,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create status', details: error },
            { status: 500 }
        );
    }
}

// Update status    
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        UpdateStatusRequestSchema.parse(body);

        // Mock successful status update
        return NextResponse.json({
            id: body.id,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update status', details: error },
            { status: 500 }
        );
    }
}

// Delete status
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const statusId = url.searchParams.get('sId');

        if (!statusId) {
            return NextResponse.json(
                { error: 'sId is required for deleting a status in /api/projects/status' },
                { status: 400 }
            );
        }

        // Mock successful status deletion
        return NextResponse.json({
            id: parseInt(statusId),
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete status', details: error },
            { status: 500 }
        );
    }
}


