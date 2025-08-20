import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not set." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const body = await request.json();
    const prompt = body.prompt || "what is javascript";

    try {
        const result = await model.generateContent(prompt);
        return NextResponse.json({ message: result.response.text });
    } catch (error: any) {
         return Response.json({
            success: false,
            message: "idk what the fuck bro"
        }, { status: 500 })
    }
}