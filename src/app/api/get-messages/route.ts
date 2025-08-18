import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";


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
    const userId = new mongoose.Types.ObjectId(user._id)
    try {
        const user = await UserModel.aggregate([
            {
                $match: {
                    _id: userId
                },

            },
            {
                $unwind: "$messages"
            },
            {
                $sort: { 'messages.createdAt': -1 }
            },
            { $group: { _id: '$_id', messages: { $push: "messages" } } }
        ])
        if (!user || user.length == 0) {
            return Response.json({
                success: false,
                message: "user does not exist"
            }, { status: 401 })
        }
        return Response.json({
            success: true,
            messages: user[0].messages
        }, { status: 200 })
    } catch (error) {
        console.error("error getting messaging", error)
        return Response.json({
            success: false,
            message: "user does not exist"
        }, { status: 500 })
    }
}