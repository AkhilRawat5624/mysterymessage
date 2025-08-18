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
                    // console.log(user);
                    
                    if (!user) {
                        throw new Error("user not found ")
                    }
                    if (!user.isverifed) {
                        throw new Error("User is not verified, pls verify")
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    // credentials.password returns plain passwrod text which the user enters during login and  user.password returns hashed password from database
                    if (isPasswordCorrect) {
                        return user
                    }
                    else {
                        throw new Error("incorrect password")
                    }
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ],
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user, }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                session.user.isVerified =token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET
}