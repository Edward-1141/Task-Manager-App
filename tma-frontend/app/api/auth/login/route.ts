import { NextResponse } from 'next/server';
import { LoginRequestSchema } from '@/types/response';

// Mock JWT token - in a real app, this would be generated securely
const MOCK_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log(body);
        
        // Validate the request body
        const validatedData = LoginRequestSchema.parse(body);
        
        // Mock successful login response
        return NextResponse.json({
            token: MOCK_JWT_TOKEN,
            user: {
                id: 1,
                name: 'John Doe',
                email: validatedData.email,
                profilePicture: 'https://avatars.githubusercontent.com/t/12936275?s=116&v=4' // optional
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );
    }
} 