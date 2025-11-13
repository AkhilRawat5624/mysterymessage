import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { ApiResponse } from "@/types/apiResponse";
import { NextResponse } from "next/server";


export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!session || !user) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await UserModel.findOne({ _id: userId })
      .select('messages')
      .lean(); // Convert to plain JavaScript object
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'User does not exist' },
        { status: 404 }
      );
    }

    // Sort messages by createdAt in descending order
    const sortedMessages = (user.messages || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      messages: sortedMessages,
      
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}