import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET() {
    await dbConnect();

    try {
        // Use any to bypass the weird Query type error if it persists
        const notes = await (Note as any).find({}).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: notes }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const body = await request.json();

        if (!body.title || !body.content) {
            return NextResponse.json(
                { success: false, message: 'Title and content are required' },
                { status: 400 }
            );
        }

        const note = await Note.create(body);
        return NextResponse.json({ success: true, data: note }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
