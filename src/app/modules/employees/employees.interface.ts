import {
    BloodGroup,
    EmployeeRole,
    Gender,
    Religion,
} from "../../../generated/enums";

export interface EmployeePayload {
    fullName: string;
    fatherName: string;
    motherName: string;
    gender: Gender;
    bloodGroup: BloodGroup;
    religion: Religion;
    employeeRole: EmployeeRole;
    emergencyContact?: string | undefined;
    monthlySalary: number;
    experience: string;
    dateOfBirth: Date;
    phone: string;
    email: string;
    nid: string;
    birthRegistrationNumber?: string | undefined;
}
