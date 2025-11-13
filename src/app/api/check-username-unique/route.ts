import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { usernameValidation } from "@/schemas/signupSchema";
import z from "zod";

const usernamequerySchema = z.object({
    username: usernameValidation
})
export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url)
        const queryParams = {
            username: searchParams.get('username')
        };
        const result = usernamequerySchema.safeParse(queryParams)  //validating with zod
        //    console.log(result)
        if (!result.success) {
            const usernmaeError = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernmaeError?.length > 1 ? usernmaeError.join(', ') : "invalid query paramaters"
            }, { status: 400 })
        }

        const { username } = result.data;
        const existingVerifiedUser = await UserModel.findOne({
            username, isverifed: true
        })

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "user already exists"
            }, { status: 400 })
        } else {
            return Response.json({
                success: true,
                message: "user is available"
            }, { status: 200 })
        }
    } catch (error) {
        console.error("error checking username", error)
        return Response.json({
            success: false,
            message: "error checking username"
        }, { status: 500 })
    }
}