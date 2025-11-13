import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/apiResponse";


export async function sendVerficationEmail(username: string,
    email: string, verifyCode: string): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Anonymous Messenger - Verification Code",
            react: VerificationEmail({ username: username, otp: verifyCode }),
        });
        return { success: true, message: "Verification Code sent Successfully" }
    } catch (error) {
        console.log("Failed to send verify code", error);

        return { success: false, message: "failed to send verification code" }
    }

}