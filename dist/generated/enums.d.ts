export declare const UserRole: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly ADMIN: "ADMIN";
    readonly TEACHER: "TEACHER";
    readonly STUDENT: "STUDENT";
    readonly ACCOUNTANT: "ACCOUNTANT";
    readonly LIBRARIAN: "LIBRARIAN";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const Gender: {
    readonly MALE: "MALE";
    readonly FEMALE: "FEMALE";
    readonly OTHER: "OTHER";
};
export type Gender = (typeof Gender)[keyof typeof Gender];
export declare const BloodGroup: {
    readonly A_POSITIVE: "A_POSITIVE";
    readonly A_NEGATIVE: "A_NEGATIVE";
    readonly B_POSITIVE: "B_POSITIVE";
    readonly B_NEGATIVE: "B_NEGATIVE";
    readonly AB_POSITIVE: "AB_POSITIVE";
    readonly AB_NEGATIVE: "AB_NEGATIVE";
    readonly O_POSITIVE: "O_POSITIVE";
    readonly O_NEGATIVE: "O_NEGATIVE";
};
export type BloodGroup = (typeof BloodGroup)[keyof typeof BloodGroup];
export declare const Religion: {
    readonly ISLAM: "ISLAM";
    readonly HINDUISM: "HINDUISM";
    readonly CHRISTIANITY: "CHRISTIANITY";
    readonly BUDDHISM: "BUDDHISM";
    readonly OTHER: "OTHER";
};
export type Religion = (typeof Religion)[keyof typeof Religion];
export declare const AddressType: {
    readonly PRESENT: "PRESENT";
    readonly PERMANENT: "PERMANENT";
};
export type AddressType = (typeof AddressType)[keyof typeof AddressType];
export declare const EmployeeRole: {
    readonly PRINCIPAL: "PRINCIPAL";
    readonly MANAGEMENT_STAFF: "MANAGEMENT_STAFF";
    readonly TEACHER: "TEACHER";
    readonly ACCOUNTANT: "ACCOUNTANT";
    readonly STORE_MANAGER: "STORE_MANAGER";
    readonly LIBRARIAN: "LIBRARIAN";
    readonly OTHER: "OTHER";
};
export type EmployeeRole = (typeof EmployeeRole)[keyof typeof EmployeeRole];
export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly BLOCKED: "BLOCKED";
    readonly DELETED: "DELETED";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
//# sourceMappingURL=enums.d.ts.map