const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.curatedItem.deleteMany();

  await prisma.curatedItem.createMany({
    data: [
      { title: "Women Jewellery", image: "/women.jpg", link: "/women" },
      { title: "Men Jewellery", image: "/men.jpg", link: "/men" },
      { title: "Kids Jewellery", image: "/kids.jpg", link: "/kids" },
    ],
  });

  console.log("✅ Seed data inserted");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());