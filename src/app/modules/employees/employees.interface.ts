import {
    BloodGroup,
    EmployeeRole,
    Gender,
    Religion,
    UserRole,
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
    role: UserRole;
    employeeRole: EmployeeRole;
    emergencyContact?: string | undefined;
    monthlySalary: number;
    experience?: string;
    dateOfJoining: string;
    phone: string;
    email: string;
    nid: string;
    address: {
        present: Address;
        permanent: Address;
    };
}
