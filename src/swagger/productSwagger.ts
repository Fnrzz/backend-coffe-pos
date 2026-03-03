export const productDocs = {
  "/api/products": {
    get: {
      tags: ["Products"],
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
        200: { description: "Berhasil mengambil data produk" },
        500: { description: "Internal Server Error" },
      },
    },
    post: {
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: [
                "name",
                "description",
                "price",
                "isAvailable",
                "categorySlug",
                "image",
              ],
              properties: {
                name: { type: "string", example: "Kopi Susu Gula Aren" },
                description: {
                  type: "string",
                  example: "Kopi susu dengan gula aren asli yang manis legit",
                },
                price: { type: "number", example: 18000 },
                isAvailable: { type: "boolean", example: true },
                categorySlug: { type: "string", example: "kopi-susu" },
                image: {
                  type: "string",
                  format: "binary", // Format khusus Swagger untuk file
                  description: "File gambar produk (jpg/png/jpeg)",
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Berhasil membuat produk baru" },
        400: { description: "Validasi Error / Kategori tidak ditemukan" },
        401: { description: "Unauthorized" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/products/{slug}": {
    get: {
      tags: ["Products"],
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          description: "Slug dari produk",
          schema: { type: "string", example: "kopi-susu-gula-aren" },
        },
      ],
      responses: {
        200: { description: "Berhasil mengambil data produk" },
        404: { description: "Produk tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
    put: {
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          description: "Slug dari produk yang ingin diubah",
          schema: { type: "string", example: "kopi-susu-gula-aren" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "Kopi Susu Gula Aren Spesial",
                },
                description: {
                  type: "string",
                  example: "Resep baru lebih mantap",
                },
                price: { type: "number", example: 20000 },
                isAvailable: { type: "boolean", example: true },
                categorySlug: { type: "string", example: "kopi-susu" },
                image: {
                  type: "string",
                  format: "binary",
                  description:
                    "File gambar baru (Opsional, biarkan kosong jika tidak ingin ganti gambar)",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Berhasil mengupdate produk" },
        400: { description: "Validasi Error" },
        401: { description: "Unauthorized" },
        404: { description: "Produk tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
    delete: {
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          description: "Slug dari produk yang ingin dihapus",
          schema: { type: "string", example: "kopi-susu-gula-aren" },
        },
      ],
      responses: {
        200: { description: "Berhasil menghapus produk" },
        401: { description: "Unauthorized" },
        404: { description: "Produk tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
