# Reseply

<div align="center">

![Reseply Banner](public/banner.webp)

**Jelajahi Cita Rasa Kuliner Indonesia**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Demo](https://reseply.kidzeroll.space) · [Laporkan Bug](https://github.com/kidzeroll/reseply/issues) · [Request Fitur](https://github.com/kidzeroll/reseply/issues)

</div>

---

## 📖 Tentang Proyek

**Reseply** adalah platform resep masakan Indonesia yang dirancang untuk mempertemukan pecinta kuliner dengan ribuan resep masakan nusantara yang autentik. Dari hidangan tradisional hingga kreasi modern, setiap resep dirancang untuk memanjakan lidah Anda.

### ✨ Fitur Utama

- 🍽️ **Koleksi Resep** - Ribuan resep masakan Indonesia dengan instruksi lengkap
- 🤖 **Virtual Chef AI** - Asisten dapur pintar berbasis AI untuk tips dan rekomendasi memasak
- ❤️ **Favorit** - Simpan resep favorit untuk akses mudah
- 🔍 **Pencarian Canggih** - Filter berdasarkan kategori, bahan, atau tingkat kesulitan
- 🌓 **Dark/Light Mode** - Tampilan yang nyaman untuk mata
- 📱 **Responsive** - Optimal di semua perangkat

---

## 🛠️ Tech Stack

| Kategori            | Teknologi                                                                        |
| ------------------- | -------------------------------------------------------------------------------- |
| **Framework**       | [Next.js 15](https://nextjs.org/) (App Router)                                   |
| **Bahasa**          | [TypeScript](https://www.typescriptlang.org/)                                    |
| **Styling**         | [Tailwind CSS 4](https://tailwindcss.com/)                                       |
| **UI Components**   | [shadcn/ui](https://ui.shadcn.com/)                                              |
| **Database**        | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Authentication**  | [Better Auth](https://better-auth.com/)                                          |
| **AI Integration**  | [Vercel AI SDK](https://sdk.vercel.ai/) + [OpenRouter](https://openrouter.ai/)   |
| **Form Handling**   | [TanStack Form](https://tanstack.com/form/)                                      |
| **Data Fetching**   | [TanStack Query](https://tanstack.com/query/)                                    |
| **Animations**      | [Framer Motion](https://www.framer.com/motion/)                                  |
| **Linting**         | [Biome](https://biomejs.dev/)                                                    |
| **Package Manager** | [Bun](https://bun.sh/)                                                           |

---

## 🚀 Memulai

### Prasyarat

- [Node.js](https://nodejs.org/) v18+ atau [Bun](https://bun.sh/) v1.0+
- [PostgreSQL](https://www.postgresql.org/) Database
- [OpenRouter API Key](https://openrouter.ai/) (untuk Virtual Chef AI)

### Instalasi

1. **Clone repository**

    ```bash
    git clone https://github.com/kidzeroll/reseply.git
    cd reseply
    ```

2. **Install dependencies**

    ```bash
    bun install
    ```

3. **Setup environment variables**

    ```bash
    cp .env.example .env
    ```

    Edit `.env` dengan konfigurasi Anda:

    ```env
    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/reseply"

    # Auth
    BETTER_AUTH_SECRET="your-secret-key"
    BETTER_AUTH_URL="http://localhost:3000"

    # OpenRouter (untuk Virtual Chef AI)
    OPENROUTER_API_KEY="your-openrouter-api-key"

    # App URL
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

4. **Setup database**

    ```bash
    # Generate Prisma Client
    bun run db:generate

    # Push schema ke database
    bun run db:push

    # (Opsional) Seed data awal
    bun run db:seed
    ```

5. **Jalankan development server**

    ```bash
    bun run dev
    ```

6. Buka [http://localhost:3000](http://localhost:3000) di browser

---

## 📁 Struktur Proyek

```
reseply/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Halaman autentikasi
│   ├── (authenticated)/   # Halaman yang butuh login
│   ├── (public)/          # Halaman publik
│   └── api/               # API routes
├── components/            # Komponen reusable
│   ├── ui/               # shadcn/ui components
│   └── navbar/           # Navigasi
├── config/               # Konfigurasi (auth, prisma, site)
├── features/             # Feature-based modules
│   ├── auth/             # Autentikasi
│   ├── recipes/          # Manajemen resep
│   ├── virtual-chef/     # AI assistant
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── prisma/               # Database schema & migrations
├── public/               # Static assets
├── styles/               # Global styles
└── types/                # TypeScript types
```

---

## 📜 Scripts

| Script                | Deskripsi                   |
| --------------------- | --------------------------- |
| `bun run dev`         | Jalankan development server |
| `bun run build`       | Build untuk production      |
| `bun run start`       | Jalankan production server  |
| `bun run lint`        | Cek linting dengan Biome    |
| `bun run format`      | Format code dengan Biome    |
| `bun run db:generate` | Generate Prisma Client      |
| `bun run db:push`     | Push schema ke database     |
| `bun run db:migrate`  | Jalankan migrasi database   |
| `bun run db:studio`   | Buka Prisma Studio          |
| `bun run db:seed`     | Seed data ke database       |

---

## 🌐 Environment Variables

| Variable              | Deskripsi                     | Required |
| --------------------- | ----------------------------- | -------- |
| `DATABASE_URL`        | PostgreSQL connection string  | ✅       |
| `BETTER_AUTH_SECRET`  | Secret key untuk autentikasi  | ✅       |
| `BETTER_AUTH_URL`     | Base URL aplikasi             | ✅       |
| `OPENROUTER_API_KEY`  | API key untuk Virtual Chef AI | ✅       |
| `NEXT_PUBLIC_APP_URL` | Public app URL                | ✅       |

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan ikuti langkah berikut:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## 👨‍💻 Author

**Kidzeroll**

- Website: [kidzeroll.space](https://kidzeroll.space)
- GitHub: [@kidzeroll](https://github.com/kidzeroll)

---

<div align="center">

Dibuat dengan ❤️ untuk pecinta kuliner Indonesia

</div>
