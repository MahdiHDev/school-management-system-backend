import { createAccessControl } from "better-auth/plugins/access";
import {
    adminAc,
    defaultStatements,
    userAc,
} from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const superAdmin = ac.newRole({
    ...adminAc.statements,
});

export const admin = ac.newRole({
    ...adminAc.statements,
});

export const student = ac.newRole({
    ...userAc.statements,
});

export const roles = {
    SUPER_ADMIN: superAdmin,
    ADMIN: admin,
    STUDENT: student,
};
