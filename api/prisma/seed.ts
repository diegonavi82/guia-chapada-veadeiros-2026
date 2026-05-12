import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: "../.env" });
dotenv.config({ path: "../../.env" });

const prisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("Configure ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar seed.");
}

const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.upsert({
  where: { email },
  update: { passwordHash, role: "ADMIN" },
  create: {
    email,
    name: "Administrador",
    passwordHash,
    role: "ADMIN",
  },
});

await prisma.$disconnect();

console.log(`Admin criado/atualizado: ${email}`);
