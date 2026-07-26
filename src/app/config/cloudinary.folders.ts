// src/app/config/cloudinary.folders.ts

const ROOT = "school-management-system"; // <-- your project's root folder

export const CloudinaryFolders = {
    employee: {
        profile: `${ROOT}/employees/profile`,
        authoritySign: `${ROOT}/employees/AuthoritySign`,
        employeeSign: `${ROOT}/employees/EmoloyeeSign`,
        experience: `${ROOT}/employees/Experience`,
    },
    student: {
        profile: `${ROOT}/students/profile`,
        documents: `${ROOT}/students/documents`,
    },
    // add more as your project grows
} as const;
