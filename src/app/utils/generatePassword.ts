import { randomBytes } from "crypto";

export const generateTempPassword = (length = 12): string => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";

    const bytes = randomBytes(length);

    return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
};
