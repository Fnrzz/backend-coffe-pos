export const categoryDocs = {
  "/api/categories": {
    get: {
      tags: ["Categories"],
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Nomor halaman (default: 1)",
          schema: { type: "integer", example: 1 },
        },
        {
          name: "limit",
          in: "query",
          description: "Jumlah data per halaman (default: 10)",
          schema: { type: "integer", example: 10 },
        },
      ],
      responses: {
        200: { description: "Berhasil mengambil data kategori" },
        500: { description: "Internal Server Error" },
      },
    },
    post: {
      tags: ["Categories"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Kopi Susu" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Berhasil membuat kategori baru" },
        400: {
          description: "Validasi Error (Nama kategori kosong atau sudah ada)",
        },
        401: { description: "Unauthorized (Token tidak valid/tidak ada)" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/categories/{slug}": {
    put: {
      tags: ["Categories"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          description: "Slug dari kategori yang ingin diubah",
          schema: { type: "string", example: "kopi-susu" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Kopi Susu Spesial" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Berhasil mengupdate kategori" },
        400: { description: "Validasi Error" },
        401: { description: "Unauthorized" },
        404: { description: "Kategori tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
    delete: {
      tags: ["Categories"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          description: "Slug dari kategori yang ingin dihapus",
          schema: { type: "string", example: "kopi-susu" },
        },
      ],
      responses: {
        200: { description: "Berhasil menghapus kategori" },
        401: { description: "Unauthorized" },
        404: { description: "Kategori tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
