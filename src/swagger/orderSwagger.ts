export const orderDocs = {
  "/api/orders": {
    get: {
      tags: ["Orders"],
      security: [{ bearerAuth: [] }],
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
        {
          name: "status",
          in: "query",
          description:
            "Filter berdasarkan status pesanan (pending, paid, completed, cancelled)",
          schema: { type: "string", example: "pending" },
        },
      ],
      responses: {
        200: { description: "Berhasil mengambil data pesanan" },
        401: { description: "Unauthorized" },
        500: { description: "Internal Server Error" },
      },
    },
    post: {
      tags: ["Orders"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["customerName", "items"],
              properties: {
                customerName: { type: "string", example: "Budi Santoso" },
                items: {
                  type: "array",
                  description: "Daftar produk yang dipesan (keranjang)",
                  items: {
                    type: "object",
                    required: ["productSlug", "quantity"],
                    properties: {
                      productSlug: { type: "string", example: "kopi-susu" },
                      quantity: { type: "integer", example: 2 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description:
            "Pesanan berhasil dibuat, mengembalikan data order & URL Midtrans",
        },
        400: {
          description:
            "Validasi Error (Keranjang kosong, produk habis/tidak valid)",
        },
        401: { description: "Unauthorized" },
        404: { description: "Produk tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/orders/{id}": {
    get: {
      tags: ["Orders"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID Pesanan (Contoh: ORD-1234567890-123)",
          schema: { type: "string", example: "ORD-1709456789-123" },
        },
      ],
      responses: {
        200: { description: "Berhasil mengambil detail pesanan" },
        401: { description: "Unauthorized" },
        404: { description: "Pesanan tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
    delete: {
      tags: ["Orders"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID Pesanan yang ingin dihapus",
          schema: { type: "string", example: "ORD-1709456789-123" },
        },
      ],
      responses: {
        200: { description: "Berhasil menghapus pesanan" },
        400: {
          description: "Pesanan yang sudah dibayar tidak bisa dibatalkan!",
        },
        401: { description: "Unauthorized" },
        404: { description: "Pesanan tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/orders/{id}/status": {
    put: {
      tags: ["Orders"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID Pesanan",
          schema: { type: "string", example: "ORD-1709456789-123" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["pending", "paid", "completed", "cancelled"],
                  example: "completed",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Berhasil mengupdate status pesanan" },
        400: { description: "Status tidak valid" },
        401: { description: "Unauthorized" },
        404: { description: "Pesanan tidak ditemukan" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
