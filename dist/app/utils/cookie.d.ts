import { CookieOptions, Request, Response } from "express";
export declare const CookieUtils: {
    setCookie: (res: Response, key: string, value: string, options: CookieOptions) => void;
    getCookie: (req: Request, key: string) => any;
    clearCookie: (res: Response, key: string, options: CookieOptions) => void;
};
//# sourceMappingURL=cookie.d.ts.map