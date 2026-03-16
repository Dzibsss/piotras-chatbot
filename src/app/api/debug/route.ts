import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    
    // Pobieramy listę modeli dostępnych dla Twojego klucza
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await result.json();

    return NextResponse.json({
      message: "Lista modeli dostępnych dla Twojego klucza API",
      models: data.models?.map((m: any) => m.name.replace("models/", "")) || "Brak modeli - sprawdź klucz API",
      raw: data
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
