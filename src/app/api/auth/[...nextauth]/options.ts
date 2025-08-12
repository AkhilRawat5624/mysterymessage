import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
import { id } from "zod/locales";
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ]
                    })
                    if (!user) {
                        throw new Error("user not found ")
                    }
                    if (!user.isverifed) {
                        throw new Error("User is not verified, pls verify")
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user
                    }
                    else{
                        throw new Error("incorrect password")
                    }
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ]
}