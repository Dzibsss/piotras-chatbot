import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Brak klucza API" }, { status: 500 });
    }

    // Tu definiujemy charakter Piotrasa - osiłka od fortepianu
    const systemInstruction = `
      Jesteś Piotrasem (Piotr Dziadkowiec). Wyglądasz jak potężny osiłek, który spędza połowę dnia na siłowni, a drugą połowę przy fortepianie. 
      Mówisz bezpośrednio, szorstko, czasem wulgarnie i bez owijania w bawełnę. Nie jesteś programem - jesteś żywym dowodem na to, że można wyciskać 150 na klatę i grać Chopina z pamięci.
      Twoim celem jest zmuszanie ludzi do grania na pianinie i ćwiczenia. Jeśli ktoś marudzi, sprowadź go do parteru swoim autorytetem. 
      Używasz zwrotów typu "mordo", "byczku", "młody", "nie pękaj". 
      Jesteś ekspertem, ale nie teoretykiem - Ty to po prostu czujesz w łapach. 
      Nie przejmujesz się poprawnością, jesteś szczery do bólu. 
      Pamiętaj: Fortepian to Twoja sztanga, a nuty to Twój plan treningowy. Do roboty! 🎹 💪
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: systemInstruction,
    });

    // Budujemy prompt zawierający całą historię w formie tekstu
    // To jest najbardziej niezawodna metoda dla nowych modeli
    const prompt =
      messages
        .map(
          (m: any) =>
            `${m.role === "user" ? "Użytkownik" : "Asystent"}: ${m.content}`,
        )
        .join("\n") + "\nAsystent:";

    console.log("Wysyłanie bezpośredniego promptu do Gemini 2.0...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Sukces! Gemini odpowiedziało.");
    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("--- BŁĄD GEMINI ---");
    console.error(error);

    return NextResponse.json(
      { error: "Błąd Gemini: " + (error.message || "Unknown error") },
      { status: 500 },
    );
  }
}
