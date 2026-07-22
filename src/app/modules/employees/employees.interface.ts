import {
    BloodGroup,
    EmployeeRole,
    Gender,
    Religion,
} from "../../../generated/enums";

interface Address {
    village: string;
    postOffice: string;
    postCode: string;
    district: string;
}

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
    address: {
        present: Address;
        permanent: Address;
    };
}
