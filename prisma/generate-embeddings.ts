import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbeddings() {
  console.log("Starting embedding generation...");

  // Get all products without embeddings
  const products = await prisma.product.findMany({
    where: {
      embeddings: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      material: true,
      type: true,
    },
  });

  console.log(`Found ${products.length} products without embeddings`);

  for (const product of products) {
    try {
      // Create a rich text representation for embedding
      const textToEmbed = [
        product.name,
        product.description,
        `Category: ${product.category}`,
        `Material: ${product.material}`,
        `Type: ${product.type}`,
      ]
        .filter(Boolean)
        .join(". ");

      console.log(`Generating embedding for: ${product.name}`);

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textToEmbed,
        encoding_format: "float",
      });

      const embedding = response.data[0].embedding;

      // Update product with embedding
      await prisma.product.update({
        where: { id: product.id },
        data: { embeddings: embedding },
      });

      console.log(`✓ Updated ${product.name}`);
    } catch (error) {
      console.error(`✗ Failed to generate embedding for ${product.name}:`, error);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("Embedding generation complete!");
}

generateEmbeddings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });