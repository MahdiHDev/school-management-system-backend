import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
export declare const jwtUtils: {
    createToken: (payload: JwtPayload, secret: string, { expiresIn }: SignOptions) => string;
    verifyToken: (token: string, secret: string) => {
        success: boolean;
        data: jwt.JwtPayload;
        message?: never;
        error?: never;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: never;
    };
    decodeToken: (token: string) => jwt.JwtPayload;
};
//# sourceMappingURL=jwt.d.ts.map