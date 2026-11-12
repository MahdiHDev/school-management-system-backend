import ejs from "ejs";
import fs from "fs";
import path from "path";

const testTemplate = async () => {
    try {
        const templatePath = path.resolve(
            process.cwd(),
            "src/app/templates/student-credentials.ejs",
        );

        const html = await ejs.renderFile(templatePath, {
            name: "Mahdi Hussain",
            email: "mahdi@example.com",
            password: "Temp@12345",
            loginUrl: "http://localhost:3000/login",
        });

        const outputPath = path.resolve(
            process.cwd(),
            "student-email-preview.html",
        );

        fs.writeFileSync(outputPath, html);

        console.log("Email preview generated successfully!");
    } catch (error) {
        console.error("Failed to generate email preview:", error);
    }
};

testTemplate();
