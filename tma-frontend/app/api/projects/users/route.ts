import { NextResponse } from 'next/server';
import userProjects from '@/sample_data/user_projects.json';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('uId');

    // If no user_id provided, return error
    if (!userId) {
        return NextResponse.json(
            { error: 'uId is required for retrieving user projects in /api/projects/users' },
            { status: 400 }
        );
    }

    // Return mock data if the backend is not ready
    return NextResponse.json(userProjects);
}