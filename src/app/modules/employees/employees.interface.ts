import {
    BloodGroup,
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

export interface IEmployeePayload {
    fullName: string;
    fatherName: string;
    motherName: string;
    gender: Gender;
    bloodGroup: BloodGroup;
    religion: Religion;
    employeeRole: UserRole;
    emergencyContact?: string | undefined;
    monthlySalary: number;
    dateOfJoining: string;
    phone: string;
    email: string;
    nid: string;
    address: {
        present: Address;
        permanent: Address;
    };
}

interface UpdateAddress {
    village?: string | undefined;
    postOffice?: string | undefined;
    postCode?: string | undefined;
    district?: string | undefined;
}

export interface IUpdatePayload {
    fullName?: string | undefined;
    fatherName?: string | undefined;
    motherName?: string | undefined;
    gender?: Gender | undefined;
    bloodGroup?: BloodGroup | undefined;
    religion?: Religion | undefined;
    employeeRole?: UserRole | undefined;
    emergencyContact?: string | undefined;
    monthlySalary?: number | undefined;
    dateOfJoining?: string | undefined;
    phone?: string | undefined;
    nid?: string | undefined;

    address?:
        | {
              present?: UpdateAddress | undefined;
              permanent?: UpdateAddress | undefined;
          }
        | undefined;
}
