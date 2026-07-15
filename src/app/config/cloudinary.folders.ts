// src/app/config/cloudinary.folders.ts

const ROOT = "school-management-system"; // <-- your project's root folder

export const CloudinaryFolders = {
    employee: {
        profile: `${ROOT}/employees/profile`,
        signature: `${ROOT}/employees/signature`,
    },
    student: {
        profile: `${ROOT}/students/profile`,
        documents: `${ROOT}/students/documents`,
    },
    // add more as your project grows
} as const;
