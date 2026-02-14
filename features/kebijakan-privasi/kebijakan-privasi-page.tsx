/**
 * Privacy Policy Page Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Calendar, FileText, Mail, Shield } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

const sections = [
    {
        id: "informasi-yang-kami-kumpulkan",
        title: "1. Informasi yang Kami Kumpulkan",
        content: [
            {
                subtitle: "Informasi yang Anda Berikan",
                items: [
                    "Informasi akun: nama, alamat email, dan kata sandi saat Anda mendaftar",
                    "Informasi profil: foto profil, bio, dan preferensi makanan",
                    "Konten yang Anda buat: resep, komentar, dan ulasan",
                    "Komunikasi: pesan yang Anda kirim kepada kami",
                ],
            },
            {
                subtitle: "Informasi yang Dikumpulkan Secara Otomatis",
                items: [
                    "Informasi perangkat: jenis perangkat, sistem operasi, dan browser",
                    "Informasi penggunaan: halaman yang dikunjungi, waktu akses, dan interaksi",
                    "Informasi lokasi: berdasarkan alamat IP Anda (perkiraan)",
                    "Cookies dan teknologi pelacakan serupa",
                ],
            },
        ],
    },
    {
        id: "penggunaan-informasi",
        title: "2. Penggunaan Informasi",
        content: [
            {
                subtitle: "Kami menggunakan informasi Anda untuk:",
                items: [
                    "Menyediakan, memelihara, dan meningkatkan layanan kami",
                    "Memproses dan mengelola akun Anda",
                    "Mengirim pemberitahuan penting tentang layanan",
                    "Merespons pertanyaan dan permintaan dukungan",
                    "Menganalisis penggunaan untuk meningkatkan pengalaman pengguna",
                    "Mendeteksi, mencegah, dan mengatasi masalah teknis atau keamanan",
                    "Mematuhi kewajiban hukum",
                ],
            },
        ],
    },
    {
        id: "berbagi-informasi",
        title: "3. Berbagi Informasi",
        content: [
            {
                subtitle: "Kami dapat membagikan informasi Anda dengan:",
                items: [
                    "Penyedia layanan pihak ketiga yang membantu operasional kami",
                    "Mitra bisnis untuk layanan terintegrasi",
                    "Otoritas hukum jika diwajibkan oleh hukum",
                    "Pihak ketiga dalam hal merger, akuisisi, atau penjualan aset",
                ],
            },
            {
                subtitle: "Kami TIDAK akan:",
                items: [
                    "Menjual informasi pribadi Anda kepada pihak ketiga",
                    "Membagikan informasi Anda untuk tujuan pemasaran tanpa persetujuan",
                ],
            },
        ],
    },
    {
        id: "keamanan-data",
        title: "4. Keamanan Data",
        content: [
            {
                subtitle: "Langkah-langkah keamanan kami:",
                items: [
                    "Enkripsi data menggunakan protokol SSL/TLS",
                    "Penyimpanan kata sandi dengan hash yang aman",
                    "Akses terbatas ke data pribadi hanya untuk karyawan yang memerlukan",
                    "Pemantauan sistem secara berkala untuk mendeteksi ancaman",
                    "Backup data secara teratur",
                ],
            },
        ],
    },
    {
        id: "hak-pengguna",
        title: "5. Hak Pengguna",
        content: [
            {
                subtitle: "Anda memiliki hak untuk:",
                items: [
                    "Mengakses data pribadi yang kami simpan tentang Anda",
                    "Memperbarui atau memperbaiki informasi yang tidak akurat",
                    "Menghapus akun dan data pribadi Anda",
                    "Menarik persetujuan untuk pemrosesan data tertentu",
                    "Mengajukan keluhan kepada otoritas perlindungan data",
                    "Meminta portabilitas data dalam format yang dapat dibaca mesin",
                ],
            },
        ],
    },
    {
        id: "cookies",
        title: "6. Cookies dan Teknologi Pelacakan",
        content: [
            {
                subtitle: "Jenis cookies yang kami gunakan:",
                items: [
                    "Cookies esensial: diperlukan untuk fungsi dasar situs",
                    "Cookies analitik: membantu kami memahami penggunaan situs",
                    "Cookies preferensi: menyimpan pengaturan dan preferensi Anda",
                ],
            },
            {
                subtitle: "Mengelola cookies:",
                items: [
                    "Anda dapat mengatur browser untuk menolak cookies",
                    "Beberapa fitur mungkin tidak berfungsi tanpa cookies",
                ],
            },
        ],
    },
    {
        id: "penyimpanan-data",
        title: "7. Penyimpanan Data",
        content: [
            {
                subtitle: "Kebijakan retensi:",
                items: [
                    "Data akun disimpan selama akun Anda aktif",
                    "Data dapat dihapus atas permintaan Anda",
                    "Beberapa data mungkin disimpan untuk keperluan hukum",
                    "Log sistem disimpan selama 90 hari",
                ],
            },
        ],
    },
    {
        id: "anak-anak",
        title: "8. Privasi Anak-anak",
        content: [
            {
                subtitle: "Perlindungan untuk anak-anak:",
                items: [
                    "Layanan kami tidak ditujukan untuk anak di bawah 13 tahun",
                    "Kami tidak dengan sengaja mengumpulkan data dari anak-anak",
                    "Jika Anda mengetahui anak Anda memberikan data, hubungi kami",
                ],
            },
        ],
    },
    {
        id: "perubahan-kebijakan",
        title: "9. Perubahan Kebijakan",
        content: [
            {
                subtitle: "Pembaruan kebijakan:",
                items: [
                    "Kami dapat memperbarui kebijakan ini dari waktu ke waktu",
                    "Perubahan signifikan akan diberitahukan melalui email atau notifikasi",
                    "Tanggal efektif akan diperbarui di bagian atas halaman",
                    "Penggunaan berkelanjutan berarti persetujuan terhadap perubahan",
                ],
            },
        ],
    },
];

export function KebijakanPrivasiPage() {
    const lastUpdated = "14 Februari 2026";

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-linear-to-br from-primary/10 via-background to-background py-12 sm:py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <Button variant="ghost" size="sm" className="gap-2" asChild>
                            <Link href="/">
                                <ArrowLeft className="size-4" />
                                Kembali ke Beranda
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div {...fadeInUp} className="text-center">
                        <Badge variant="outline" className="mb-4 gap-2">
                            <Shield className="size-4" />
                            Kebijakan Privasi
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Kebijakan Privasi
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                            Kami menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana {APP_NAME} mengumpulkan,
                            menggunakan, dan melindungi informasi pribadi Anda.
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-4" />
                            <span>Terakhir diperbarui: {lastUpdated}</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Table of Contents */}
            <section className="border-b border-border/50 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}>
                        <Card className="border-border/50">
                            <CardContent className="p-6">
                                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                                    <FileText className="size-5 text-primary" />
                                    Daftar Isi
                                </h2>
                                <nav className="grid gap-2 sm:grid-cols-2">
                                    {sections.map((section) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                            {section.title}
                                        </a>
                                    ))}
                                </nav>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-12">
                        {sections.map((section, sectionIndex) => (
                            <motion.div
                                key={section.id}
                                id={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: 0.1 }}>
                                <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">{section.title}</h2>
                                <div className="space-y-6">
                                    {section.content.map((contentBlock, blockIndex) => (
                                        <div key={blockIndex}>
                                            <h3 className="mb-3 font-medium text-foreground">
                                                {contentBlock.subtitle}
                                            </h3>
                                            <ul className="space-y-2">
                                                {contentBlock.items.map((item, itemIndex) => (
                                                    <li
                                                        key={itemIndex}
                                                        className="flex items-start gap-3 text-muted-foreground">
                                                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                {sectionIndex < sections.length - 1 && <Separator className="mt-12" />}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="border-t border-border/50 bg-muted/30 py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center">
                        <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">Ada Pertanyaan?</h2>
                        <p className="mb-6 text-muted-foreground">
                            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami.
                        </p>
                        <Button asChild className="gap-2">
                            <a href="mailto:privacy@reseply.id">
                                <Mail className="size-4" />
                                Hubungi Kami
                            </a>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
