import app from "./app.js";
import { envVars } from "./app/config/env.js";
import { prisma } from "./app/lib/prisma.js";
import { seedSuperAdmin } from "./app/utils/seed.js";
const bootstrap = async () => {
    try {
        await seedSuperAdmin();
        await prisma.$connect();
        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};
bootstrap();
//# sourceMappingURL=server.js.map