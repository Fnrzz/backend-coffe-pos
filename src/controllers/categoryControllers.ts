import { prisma } from "../lib/prisma";
import {
  errorInternalServerErrorResponse,
  errorNotFoundResponse,
  errorValidationResponse,
  successCreatedResponse,
  successMultipleResponse,
  successSingleResponse,
} from "../utils/response";
import { Request, Response } from "express";

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return errorValidationResponse(res, "Nama Kategori Wajib Diisi!", {
        name: ["required"],
      });
    }

    const slug = createSlug(name);

    const existingCategory = await prisma.category.findUnique({
      where: {
        slug,
      },
    });

    if (existingCategory) {
      return errorValidationResponse(res, "Kategori Sudah Ada!", {
        name: ["unique"],
      });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    return successCreatedResponse(res, newCategory);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;

    if (!name) {
      return errorValidationResponse(res, "Nama Kategori Wajib Diisi!", {
        name: ["required"],
      });
    }

    if (!slug) {
      return errorValidationResponse(res, "Slug Kategori Wajib Diisi!", {
        slug: ["required"],
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        slug: String(slug),
      },
    });

    if (!category) {
      return errorNotFoundResponse(res);
    }

    const newSlug = createSlug(name);

    if (newSlug !== slug) {
      const existingCategory = await prisma.category.findUnique({
        where: {
          slug: newSlug,
        },
      });

      if (existingCategory) {
        return errorValidationResponse(res, "Kategori Sudah Ada!", {
          name: ["unique"],
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: {
        slug: String(slug),
      },
      data: {
        name,
        slug: newSlug,
      },
    });

    return successSingleResponse(res, "", updatedCategory);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return errorValidationResponse(res, "Slug Kategori Wajib Diisi!", {
        slug: ["required"],
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        slug: String(slug),
      },
    });

    if (!category) {
      return errorNotFoundResponse(res);
    }

    await prisma.category.delete({
      where: {
        slug: String(slug),
      },
    });

    return successSingleResponse(res, "Kategori Berhasil Dihapus!");
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const total = await prisma.category.count();
    const categories = await prisma.category.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        name: true,
        slug: true,
      },
    });
    return successMultipleResponse(
      res,
      categories,
      page ? page : 1,
      limit ? limit : categories.length,
      total,
    );
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};
