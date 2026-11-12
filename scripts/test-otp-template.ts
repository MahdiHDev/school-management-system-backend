import ejs from "ejs";
import fs from "fs";
import path from "path";

const testTemplate = async () => {
    try {
        const templatePath = path.resolve(
            process.cwd(),
            "src/app/templates/otp.ejs",
        );

        const html = await ejs.renderFile(templatePath, {
            name: "Mahdi Hussain",
            otp: "123456",
            expiryMinutes: 2,
            appName: "GreenFair Kindergarten",
        });

        const outputPath = path.resolve(process.cwd(), "otp-preview.html");

        fs.writeFileSync(outputPath, html);

        console.log("OTP preview generated successfully!");
    } catch (error) {
        console.error("Failed to generate OTP preview:", error);
    }
};

testTemplate();
