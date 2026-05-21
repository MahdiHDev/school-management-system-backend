import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const getUsers = async (req: Request, res: Response) => {
    try {
        const data = await prisma.user.findMany();
        res.status(200).send({ message: "User Retrieves", data });
    } catch (error) {
        console.log(error);
    }
};

export const userController = {
    getUsers,
};
