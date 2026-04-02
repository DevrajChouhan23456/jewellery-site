import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { customerAuthOptions } from "@/lib/customer-auth";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name must not be empty"),
  phone: z.string().trim().min(6, "Phone must be valid"),
  address: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(customerAuthOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.errors.map((e) => e.message).join(", ") }), { status: 400 });
  }

  const { name, phone, address } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone,
      address: address || null,
    },
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
