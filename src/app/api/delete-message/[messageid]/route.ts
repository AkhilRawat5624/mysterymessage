import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";


export async function DELETE(req: Request, { params }: { params: { messageid: string } }) {
    const messageId = params.messageid;

    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as User
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not Authneticated"
        }, { status: 401 })
    }
    try {

        const updatedResult = await UserModel.updateOne({
            _id: user._id
        },
            {
                $pull: { messages: { _id: messageId } }
            }
        )
        if (updatedResult.modifiedCount == 0) {
            return Response.json({
                success: false,
                message: "Message not found or already deleted"
            }, { status: 401 })
        }
        return Response.json({
            success: true,
            message: "Message Deleted successfully"
        }, { status: 200 })
    } catch (error) {
        console.log("error in delete message route")
        return Response.json({
            success: false,
            message: "Error Deleting Message"
        }, { status: 500 })
    }


}