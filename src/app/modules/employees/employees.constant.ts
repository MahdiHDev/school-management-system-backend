export const employeeSearchableFields = ["fullName", "email"];

export const employeeFilterableFields = ["user.role"];

// export const EmployeeIncludeConfig: Partial<
//     Record<
//         keyof Prisma.EmployeeInclude,
//         Prisma.EmployeeInclude[keyof Prisma.EmployeeInclude]
//     >
// > = {
//     user: true,
//     appointments: {
//         include: {
//             patient: true,
//             doctor: true,
//         },
//     },
//     doctorSchedules: {
//         include: {
//             schedule: true,
//         },
//     },
//     prescriptions: true,
//     reviews: true,
// };
