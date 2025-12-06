'use server'

import { prisma } from "@/db/prisma";
import { LATEST_PRODUCTS_LIMIT } from "../constants";

//Get latest products
export async function getLatestProducts() {
    const data = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: {createdAt: 'desc'}
    })

    return data.map(product => ({
        ...product,
        price: product.price.toString(),
        rating: product.rating.toString(),
    }))
}

//Get product by slug
export async function getProductBySlug(slug: string) {
    const product = await prisma.product.findFirst({
        where: { slug }
    })

    if (!product) return null;

    return {
        ...product,
        price: product.price.toString(),
        rating: product.rating.toString(),
    }
}