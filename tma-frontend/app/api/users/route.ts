import { NextResponse } from 'next/server';
import { CreateUserRequestSchema } from '@/types/response';
// Mock user data
const mockUsers = [
    { id: 1, name: 'Sarah Chen', email: 'sarah.chen@company.com', profilePicture: 'https://avatars.githubusercontent.com/u/105874019?s=400&v=4' },
    { id: 2, name: 'Michael Rodriguez', email: 'michael.r@company.com', profilePicture: 'https://avatars.githubusercontent.com/u/181493963?v=4' },
    { id: 3, name: 'Emma Thompson', email: 'emma.t@company.com', profilePicture: 'https://avatars.githubusercontent.com/t/12936275?s=116&v=4' },
    { id: 4, name: 'John Doe', email: 'john.doe@company.com' },
    { id: 5, name: 'Will Smith', email: 'will@example.com' },
    { id: 6, name: 'John Doe', email: 'john@example.com' },
    { id: 7, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 8, name: 'Bob Johnson', email: 'bob@example.com' },
    { id: 9, name: 'Alice Brown', email: 'alice@example.com' },
    { id: 10, name: 'Charlie Wilson', email: 'charlie@example.com' },
];

export async function GET() {
    return NextResponse.json({ users: mockUsers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Validate the request body
        CreateUserRequestSchema.parse(body);
        
        // Mock successful user creation
        return NextResponse.json({
            id: mockUsers.length + 1,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );
    }
} 