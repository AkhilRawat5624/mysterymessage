import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { success } from "zod";
import UserModel from "@/model/user.model";

export async function POST(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as User
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not Authneticated"
        }, { status: 401 })
    }
    const userId = user._id;
    const { acceptMessages } = await req.json();
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessages: acceptMessages }, { new: true })

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "User inot found with this id"
            }, { status: 401 })
        }
        return Response.json({
            success: true,
            message: "message status updated sucessfully",
            updatedUser
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: "User is not accepting messages"
        }, { status: 500 })
    }
}

export async function GET(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as User
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not Authneticated"
        }, { status: 401 })
    }
    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "user not found"
            }, { status: 404 })
        }
        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessages
        }, { status: 200 })
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error in getting message acceptance status"
        }, { status: 500 })
    }
}