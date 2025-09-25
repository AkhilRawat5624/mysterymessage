import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";


export async function POST(req: Request) {
    await dbConnect();

    const { username, content } = await req.json()
    try {
        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json({
                success: false,
                message: "user not found"
            }, { status: 404 })
        }
        if (!user.isAcceptingMessages) {
            return Response.json({
                success: false,
                message: "user is not accepting messages"
            }, { status: 403 })
        }
        const newMessage = { content, createdAt: new Date() }
        console.log(newMessage,"message structure")
        user.messages.push(newMessage as Message);

        await user.save();
        return Response.json({
            success: true,
            message: "message sent sucessfully"
        }, { status: 200 })
    } catch (error) {
        console.error("unexpected error occured", error)
        return Response.json({
            success: false,
            message: "user does not exist"
        }, { status: 500 })

    }
}