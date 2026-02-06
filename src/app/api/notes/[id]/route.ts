import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;

    try {
        const note = await (Note as any).findById(id);
        if (!note) {
            return NextResponse.json({ success: false, message: 'Note not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: note }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;

    try {
        const body = await request.json();
        const note = await (Note as any).findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!note) {
            return NextResponse.json({ success: false, message: 'Note not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: note }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;

    try {
        const deletedNote = await (Note as any).deleteOne({ _id: id });
        if (!deletedNote.deletedCount) {
            return NextResponse.json({ success: false, message: 'Note not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Note deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }
}
