import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;

    try {
        const bookmark = await (Bookmark as any).findById(id);
        if (!bookmark) {
            return NextResponse.json({ success: false, message: 'Bookmark not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: bookmark }, { status: 200 });
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

        if (body.url) {
            const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
            if (!urlPattern.test(body.url)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid bookmark URL' },
                    { status: 400 }
                );
            }
        }

        const bookmark = await (Bookmark as any).findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!bookmark) {
            return NextResponse.json({ success: false, message: 'Bookmark not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: bookmark }, { status: 200 });
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
        const deletedBookmark = await (Bookmark as any).deleteOne({ _id: id });
        if (!deletedBookmark.deletedCount) {
            return NextResponse.json({ success: false, message: 'Bookmark not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Bookmark deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }
}
