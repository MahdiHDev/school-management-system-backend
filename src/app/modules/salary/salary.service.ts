import { Prisma } from "../../../generated/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateSalaryPayload } from "./salary.validation";

import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

type SalaryEmployeeListItem = Prisma.EmployeeGetPayload<{
    select: {
        id: true;
        employeeId: true;
        fullName: true;
        picture: true;
        monthlySalary: true;
    };
}>;

const getEmployeeforSalary = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        SalaryEmployeeListItem,
        Prisma.EmployeeWhereInput,
        Prisma.EmployeeInclude
    >(prisma.employee, query, {
        searchableFields: ["fullName", "employeeId"],
        filterableFields: ["employeeRole"],
    });

    const result = await queryBuilder
        .search()
        .filter()
        .where({ isdeleted: false })
        .select({
            id: true,
            employeeId: true,
            fullName: true,
            picture: true,
            monthlySalary: true,
        })
        .paginate()
        .sort()
        .execute();

    return {
        ...result,
        data: result.data.map((employee) => ({
            id: employee.id,
            employeeId: employee.employeeId,
            name: employee.fullName,
            image: employee.picture,
            salary: employee.monthlySalary,
        })),
    };
};

const createSalary = async (payload: CreateSalaryPayload) => {
    const { employeeId, salaryMonth, paymentDate, bonus, deduction } = payload;

    // 1. Check employee
    const employee = await prisma.employee.findFirst({
        where: {
            id: employeeId,
            isdeleted: false,
        },
        select: {
            id: true,
            fullName: true,
            employeeId: true,
            employeeRole: true,
            monthlySalary: true,
        },
    });

    if (!employee) {
        throw new AppError(404, "Employee not found");
    }

    // 2. Get fixed salary
    const fixedSalary = employee.monthlySalary;

    // 3. Calculate salary
    const totalAmount = fixedSalary + bonus;
    const netPaid = totalAmount - deduction;

    if (deduction > totalAmount) {
        throw new AppError(
            400,
            "Deduction cannot be greater than total salary",
        );
    }

    // 4. Check existing salary payment
    const existingSalary = await prisma.salaryPayment.findUnique({
        where: {
            employeeId_salaryMonth: {
                employeeId,
                salaryMonth,
            },
        },
    });

    if (existingSalary) {
        throw new AppError(
            409,
            `Salary has already been paid for ${salaryMonth}`,
        );
    }

    // 5. Convert DD/MM/YYYY to Date
    const [day, month, year] = paymentDate.split("/").map(Number);

    const formattedPaymentDate = new Date(Date.UTC(year!, month! - 1, day!));

    // 6. Create salary payment
    try {
        const result = await prisma.salaryPayment.create({
            data: {
                employeeId,
                salaryMonth,
                paymentDate: formattedPaymentDate,
                fixedSalary,
                bonus,
                deduction,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        fullName: true,
                        employeeId: true,
                        employeeRole: true,
                    },
                },
            },
        });

        return {
            ...result,
            totalAmount,
            netPaid,
        };
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new AppError(
                409,
                `Salary has already been paid for ${salaryMonth}`,
            );
        }

        throw error;
    }
};

export const SalaryService = {
    getEmployeeforSalary,
    createSalary,
};
