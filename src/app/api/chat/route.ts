import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Simple mock response for MVP
    let responseText = "Je suis Insight, votre assistant académique GSI. ";

    if (message.toLowerCase().includes("cours")) {
      responseText += "Votre prochain cours est la Physique à 09h30 en salle 102.";
    } else if (message.toLowerCase().includes("devoir")) {
      responseText += "Vous avez un devoir de Géographie à rendre pour demain.";
    } else {
      responseText += "Comment puis-je vous aider davantage dans votre parcours à GSI Internationale ?";
    }

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
