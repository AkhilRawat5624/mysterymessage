import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { ApiResponse } from "@/types/apiResponse";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    console.log("DELETE request received with params:", params);
    const replyId = params.messageid;
    console.log("Received DELETE request for replyId:", replyId);

    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        console.log("No session or user found");
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Not authenticated" },
            { status: 401 }
        );
    }

    try {
        const userId = new mongoose.Types.ObjectId(session.user._id);
        const replyObjectId = new mongoose.Types.ObjectId(replyId);
        console.log("User ID:", userId.toString());
        console.log("Reply ObjectId:", replyObjectId.toString());

        // Debug: Check if the user and reply exist
        // const matchingUser = await UserModel.findOne(
        //     { _id: userId, "messages.replies._id": replyObjectId },
        //     { "messages.$": 1 }
        // );
        // console.log("Matching user and message:", matchingUser ? JSON.stringify(matchingUser, null, 2) : "null");

        const updateResult = await UserModel.updateOne(
            { _id: userId, "messages.replies._id": replyObjectId },
            { $pull: { "messages.$.replies": { _id: replyObjectId } } }
        );

        // console.log("Update result:", JSON.stringify(updateResult, null, 2));

        if (updateResult.matchedCount === 0) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Reply not found or already deleted" },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: "Reply deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in delete reply route:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Error deleting reply" },
            { status: 500 }
        );
    }
}