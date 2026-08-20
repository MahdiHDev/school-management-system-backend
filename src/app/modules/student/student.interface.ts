import { Religion } from "../../../generated/enums";

interface Address {
    village: string;
    postOffice: string;
    postCode: string;
    district: string;
}

export interface ICreateStudentPayload {
    fullName: string;
    fullNameBangla: string;
    dateOfBirth: string;
    birthRegistrationNumber: string;
    religion: Religion;
    classId: string;
    fatherName: string;
    fatherNameBangla: string;
    whatsappNumber: string;
    fatherOccupation: string;
    mothersName: string;
    mothersNameBangla: string;
    motherMobileNumber: string;
    motherOccupation: string;
    email: string;
    guardianName?: string;
    guardianRelationship?: string;
    guardianMobile?: string;
    admissionTotalFees: number;
    admissionDate: string;
    prviousInstitute?: string;
    endingClass?: string;
    result?: string;
    testimonialNumber?: string;
    address: {
        present: Address;
        permanent: Address;
    };
}
