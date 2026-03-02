import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const main = async () => {
  const hashedPassword = await bcrypt.hash("password", 10);
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    },
  });

  console.log("Database has been seeded. 🌱");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
