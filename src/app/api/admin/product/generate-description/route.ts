import { NextResponse } from "next/server";
import OpenAI from "openai";

import { requireAdminApiAccess } from "@/server/auth/admin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await req.json();
    const { name, material, type, category } = body;

    if (!name || !material || !type || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, material, type, category" },
        { status: 400 }
      );
    }

    const prompt = `Generate a compelling product description for a ${material} ${type} in the ${category} category named "${name}". 

The description should:
- Highlight the material quality and craftsmanship
- Mention the product's appeal and suitability
- Be engaging and suitable for an e-commerce storefront
- Keep it under 150 words
- Use elegant, luxurious language appropriate for jewelry

Product details:
- Name: ${name}
- Material: ${material}
- Type: ${type}
- Category: ${category}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional jewelry product description writer. Create elegant, compelling descriptions that highlight quality and appeal.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const description = completion.choices[0]?.message?.content?.trim();

    if (!description) {
      return NextResponse.json(
        { error: "Failed to generate description" },
        { status: 500 }
      );
    }

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error generating product description:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}