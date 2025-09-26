import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import  UserModel  from '@/model/user.model';
import { ApiResponse } from '@/types/apiResponse';

export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    await dbConnect();
    const { username } = params;

    const user = await UserModel.findOne({ username }).lean();
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
        success: true,
        messages: user.messages || [],
        message: ''
    });
  } catch (error) {
    console.error('Error fetching public messages:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}