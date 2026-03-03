export const authDocs = {
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "password"],
              properties: {
                username: { type: "string", default: "admin" },
                password: { type: "string", default: "rahasia123" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Berhasil Login (Mengembalikan Token JWT)" },
        400: { description: "Validasi Error / Username & Password Salah" },
      },
    },
  },
  "/api/auth/me": {
    get: {
      tags: ["Auth"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Berhasil mengambil profil" },
        401: { description: "Unauthorized (Token tidak ada atau kadaluarsa)" },
      },
    },
  },
};
