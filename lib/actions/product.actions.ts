'use server'

import { PrismaClient } from "@prisma/client"
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";

const prisma = new PrismaClient();

//Get latest products
export async function getLatestProducts() {
    const data = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: {createdAt: 'desc'}
    })

    return convertToPlainObject(data);
}