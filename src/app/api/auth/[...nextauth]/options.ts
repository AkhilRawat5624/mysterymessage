import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: Record<string, string> | undefined) {
                await dbConnect();
                try {
                    if (!credentials?.email && !credentials?.identifier) {
                        return null;
                    }
                    if (!credentials?.password) {
                        return null;
                    }

                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.email || credentials.identifier },
                            { username: credentials.email || credentials.identifier },
                        ]
                    })
                    // console.log(user);

                    if (!user) {
                        return null;
                    }
                    if (!user.isverifed) {
                        return null;
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    // credentials.password returns plain passwrod text which the user enters during login and  user.password returns hashed password from database
                    if (isPasswordCorrect) {
                        return {
                            id: user._id?.toString() || '',
                            _id: user._id?.toString(),
                            email: user.email,
                            username: user.username,
                            isVerified: user.isverifed,
                            isAcceptingMessages: user.isAcceptingMessages
                        }
                    }
                    else {
                        return null;
                    }
                } catch (error) {
                    console.error('Authentication error:', error);
                    return null;
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
            if (token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET
}