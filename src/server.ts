import app from "./app";
import { envVars } from "./app/config/env";
import { prisma } from "./app/lib/prisma";
import { seedSuperAdmin } from "./app/utils/seed";

const bootstrap = async () => {
  try {
    await seedSuperAdmin();
    await prisma.$connect();
    app.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

bootstrap();
