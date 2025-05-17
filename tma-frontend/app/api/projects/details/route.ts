import { NextResponse } from 'next/server';
import projectDetails from '@/sample_data/project_details.json';


export async function GET(
    request: Request,
) {
    // Get the project id from the request query
    const url = new URL(request.url);
    const projectId = url.searchParams.get('pId');

    if (!projectId) {
        return NextResponse.json(
            { error: 'pId is required for retrieving project details in /api/projects/details' },
            { status: 400 }
        );
    }

    // Return mock data if the backend is not ready
    return NextResponse.json(projectDetails);
} 