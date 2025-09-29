import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";
import { ApiResponse } from "@/types/apiResponse";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
export async function POST(request: Request) {
    console.log('Received POST request to /api/reply-message');
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }
        await dbConnect();
        const { messageId, replyContent } = await request.json();
        console.log(`message id is ${messageId} and content is ${replyContent} from bakcend`)
        if (!messageId || !replyContent) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: 'Message ID and reply content are required', },
                { status: 400 }
            );
        }
        const userId = new mongoose.Types.ObjectId(session.user._id);
        const messageObjectId = new mongoose.Types.ObjectId(messageId);

        const updatedMessage = await UserModel.updateOne({
            _id: userId, "messages._id": messageObjectId
        },
            {
                $push: {
                    "messages.$.replies": {
                        content: replyContent,
                        createdAt: new Date()
                    }
                }
            }
        );
        if (updatedMessage.matchedCount == 0) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Message not found" },
                { status: 404 }
            )
        }
        return NextResponse.json<ApiResponse>({ success: true, message: "message sent successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: 'Message ID and reply content are required' },
            { status: 400 }
        );
    }
}