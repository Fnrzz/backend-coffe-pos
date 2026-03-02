import { Request, Response } from "express";
import {
  errorInternalServerErrorResponse,
  errorNotFoundResponse,
  errorValidationResponse,
  successCreatedResponse,
  successMultipleResponse,
  successSingleResponse,
} from "../utils/response";
import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const deleteImageFromDisk = (imageUrl: string | null) => {
  if (imageUrl) {
    const filename = imageUrl.split("/").pop();
    if (filename) {
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, isAvailable, categorySlug } = req.body;

    const requiredFields = [
      "name",
      "description",
      "price",
      "isAvailable",
      "categorySlug",
    ];

    const errors: Record<string, string[]> = {};

    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors[field] = [`required`];
      }
    }

    if (!req.file) {
      errors["image"] = ["required"];
    }

    if (Object.keys(errors).length > 0) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return errorValidationResponse(res, "Validation Error!", errors);
    }

    let imageUrl = null;

    if (req.file) {
      const protocol = req.protocol;
      const host = req.get("host");
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const categoryExists = await prisma.category.findUnique({
      where: { slug: String(categorySlug) },
      select: { id: true },
    });

    if (!categoryExists) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return errorValidationResponse(res, "Kategori Tidak Ditemukan!");
    }

    const slug = createSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        imageUrl,
        isAvailable: isAvailable === "false" ? false : true,
        categoryId: categoryExists.id,
      },
    });

    return successCreatedResponse(res, product);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      if (req.file) fs.unlinkSync(req.file.path);
      return errorValidationResponse(res, "Slug Produk Wajib Diisi!", {
        slug: ["required"],
      });
    }

    const { name, description, price, isAvailable, categorySlug } = req.body;

    const product = await prisma.product.findUnique({
      where: { slug: String(slug) },
      select: {
        name: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        isAvailable: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      if (req.file) fs.unlinkSync(req.file.path);
      return errorNotFoundResponse(res);
    }

    let categoryId = product.category.id;

    if (categorySlug && categorySlug !== product.category.slug) {
      const categoryExists = await prisma.category.findUnique({
        where: { slug: String(categorySlug) },
      });

      if (!categoryExists) {
        if (req.file) fs.unlinkSync(req.file.path);
        return errorValidationResponse(res, "Kategori Tidak Ditemukan!");
      }

      categoryId = categoryExists.id;
    }

    let newSlug = createSlug(name);

    if (newSlug !== slug) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: newSlug },
      });

      if (existingProduct) {
        if (req.file) fs.unlinkSync(req.file.path);
        return errorValidationResponse(res, "Nama Produk Sudah Ada!", {
          name: ["unique"],
        });
      }
    }

    let imageUrl = product.imageUrl;

    if (req.file) {
      const protocol = req.protocol;
      const host = req.get("host");
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { slug: String(slug) },
      data: {
        name: name || product.name,
        slug: newSlug,
        description: description || product.description,
        price: price ? Number(price) : product.price,
        imageUrl,
        isAvailable:
          isAvailable !== undefined
            ? isAvailable === "false"
              ? false
              : true
            : product.isAvailable,
        categoryId,
      },
      select: {
        name: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        isAvailable: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (req.file) {
      deleteImageFromDisk(product.imageUrl);
    }

    return successSingleResponse(
      res,
      "Produk Berhasil Diupdate!",
      updatedProduct,
    );
  } catch (e) {
    console.log(e);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return errorInternalServerErrorResponse(res);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return errorValidationResponse(res, "Slug Produk Wajib Diisi!", {
        slug: ["required"],
      });
    }

    const product = await prisma.product.findUnique({
      where: { slug: String(slug) },
    });

    if (!product) {
      return errorNotFoundResponse(res);
    }

    await prisma.product.delete({
      where: { slug: String(slug) },
    });

    deleteImageFromDisk(product.imageUrl);

    return successSingleResponse(res, "Produk Berhasil Dihapus!");
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const total = await prisma.product.count();
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        name: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        isAvailable: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
    return successMultipleResponse(
      res,
      products,
      page ? page : 1,
      limit ? limit : products.length,
      total,
    );
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return errorValidationResponse(res, "Slug Produk Wajib Diisi!", {
        slug: ["required"],
      });
    }

    const product = await prisma.product.findUnique({
      where: { slug: String(slug) },
      select: {
        name: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        isAvailable: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return errorNotFoundResponse(res);
    }

    return successSingleResponse(res, "", product);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};
