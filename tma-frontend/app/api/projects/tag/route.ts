import { NextResponse } from 'next/server';
import { CreateTagRequestSchema, UpdateTagRequestSchema } from '@/types/response';

// Create tag
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        CreateTagRequestSchema.parse(body);

        // Mock successful tag creation
        return NextResponse.json({
            id: 1234,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create tag', details: error },
            { status: 500 }
        );
    }
}

// Update tag
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        UpdateTagRequestSchema.parse(body);

        // Mock successful tag update
        return NextResponse.json({
            id: body.id,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update tag', details: error },
            { status: 500 }
        );
    }
}

// Delete tag
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const tagId = url.searchParams.get('tId');

        if (!tagId) {
            return NextResponse.json(
                { error: 'tId is required for deleting a tag in /api/projects/tag' },
                { status: 400 }
            );
        }

        // Mock successful tag deletion
        return NextResponse.json({
            id: parseInt(tagId),
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete tag', details: error },
            { status: 500 }
        );
    }
}




