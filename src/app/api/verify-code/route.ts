import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { date, success } from "zod";

export async function POST(req: Request) {
    await dbConnect()
    try {
        const { username, code } = await req.json();
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({
            username: decodedUsername
        })

        if (!user) {
            return Response.json({
                success: false,
                message: " user not found "
            }, {
                status: 500
            })
        }
        const isCodeValid = code === user.verifyCode
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        if (isCodeValid && isCodeNotExpired) {
            user.isverifed = true;
            await user.save();
            return Response.json({
                success: true,
                message: " user verified "
            }, {
                status: 200
            })
        }
        else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code is expired"
            }, {
                status: 400
            })
        } else {
            return Response.json({
                success: false,
                message: "incorrect Verification code"
            }, {
                status: 400
            })
        }
    } catch (error) {
        console.error("error verifying user, error");

        return Response.json({
            success: false,
            message: "error verifying user"
        }, {
            status: 500
        })
    }
}
