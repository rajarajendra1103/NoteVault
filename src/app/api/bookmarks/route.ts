import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';

export async function GET() {
    await dbConnect();

    try {
        const bookmarks = await (Bookmark as any).find({}).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: bookmarks }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const body = await request.json();

        if (!body.title || !body.url) {
            return NextResponse.json(
                { success: false, message: 'Title and URL are required' },
                { status: 400 }
            );
        }

        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
        if (!urlPattern.test(body.url)) {
            return NextResponse.json(
                { success: false, message: 'Invalid bookmark URL' },
                { status: 400 }
            );
        }

        const bookmark = await Bookmark.create(body);
        return NextResponse.json({ success: true, data: bookmark }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
