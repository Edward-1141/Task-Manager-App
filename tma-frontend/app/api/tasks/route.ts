import { NextResponse } from 'next/server';
import { CreateTaskRequestSchema, UpdateTaskRequestSchema } from '@/types/response';

// Create task
export async function POST(request: Request) {
    const requestBody = await request.json();
    try {
        CreateTaskRequestSchema.parse(requestBody);
        return NextResponse.json({
            id: 1,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        );
    }
}

// Update task
export async function PUT(request: Request) {
    const requestBody = await request.json();

    try {
        const validatedData = UpdateTaskRequestSchema.parse(requestBody);

        return NextResponse.json({
            id: validatedData.id,
        });
    } catch (error) {
        return NextResponse.json({
            message: 'Task update failed',
            error: error,
        });
    }
}

// Delete task
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const taskId = url.searchParams.get('id');

        if (!taskId) {
            return NextResponse.json(
                { error: 'id is required for deleting a task in /api/tasks' },
                { status: 400 });
        }

        // Mock successful task deletion
        return NextResponse.json({
            id: parseInt(taskId),
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete task', details: error },
            { status: 500 }
        );
    }
}