/**
 * Terms of Service Page Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Calendar, FileText, Gavel, Mail, Scale } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
        id: "penerimaan-syarat",
        title: "1. Penerimaan Syarat",
        content: [
            {
                text: `Dengan mengakses atau menggunakan layanan ${APP_NAME}, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui syarat-syarat ini, mohon untuk tidak menggunakan layanan kami.`,
            },
            {
                subtitle: "Anda menyatakan bahwa:",
                items: [
                    "Anda berusia minimal 13 tahun",
                    "Anda memiliki kapasitas hukum untuk menyetujui syarat ini",
                    "Anda akan menggunakan layanan sesuai dengan hukum yang berlaku",
                    "Informasi yang Anda berikan adalah akurat dan terkini",
                ],
            },
        ],
    },
    {
        id: "layanan-kami",
        title: "2. Layanan Kami",
        content: [
            {
                text: `${APP_NAME} adalah platform berbagi resep masakan Indonesia yang memungkinkan pengguna untuk:`,
            },
            {
                items: [
                    "Menjelajahi dan mencari resep masakan",
                    "Membuat dan membagikan resep sendiri",
                    "Menyimpan resep favorit",
                    "Berinteraksi dengan komunitas pecinta masak",
                    "Menggunakan fitur AI Virtual Chef untuk saran resep",
                ],
            },
            {
                subtitle: "Ketersediaan Layanan:",
                items: [
                    'Layanan disediakan "sebagaimana adanya" dan "sebagaimana tersedia"',
                    "Kami berhak mengubah, menangguhkan, atau menghentikan layanan kapan saja",
                    "Kami tidak menjamin layanan akan bebas dari gangguan atau error",
                ],
            },
        ],
    },
    {
        id: "akun-pengguna",
        title: "3. Akun Pengguna",
        content: [
            {
                subtitle: "Pendaftaran Akun:",
                items: [
                    "Anda harus memberikan informasi yang akurat dan lengkap",
                    "Anda bertanggung jawab menjaga kerahasiaan kata sandi",
                    "Anda bertanggung jawab atas semua aktivitas di akun Anda",
                    "Segera beritahu kami jika ada penggunaan tidak sah",
                ],
            },
            {
                subtitle: "Penangguhan dan Penghapusan:",
                items: [
                    "Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan",
                    "Anda dapat menghapus akun Anda kapan saja melalui pengaturan",
                    "Penghapusan akun akan menghapus konten yang Anda buat",
                ],
            },
        ],
    },
    {
        id: "konten-pengguna",
        title: "4. Konten Pengguna",
        content: [
            {
                subtitle: "Kepemilikan Konten:",
                items: [
                    "Anda mempertahankan hak atas konten yang Anda buat",
                    `Dengan memposting konten, Anda memberikan ${APP_NAME} lisensi non-eksklusif untuk menggunakan, menampilkan, dan mendistribusikan konten tersebut`,
                    "Anda menjamin memiliki hak untuk membagikan konten tersebut",
                ],
            },
            {
                subtitle: "Konten yang Dilarang:",
                items: [
                    "Konten yang melanggar hak cipta atau kekayaan intelektual",
                    "Konten yang mengandung ujaran kebencian, diskriminasi, atau kekerasan",
                    "Konten yang menyesatkan atau menipu",
                    "Spam, iklan tanpa izin, atau konten promosi berlebihan",
                    "Konten yang berbahaya, ilegal, atau melanggar hukum",
                    "Resep dengan bahan berbahaya atau instruksi yang dapat membahayakan",
                ],
            },
        ],
    },
    {
        id: "kekayaan-intelektual",
        title: "5. Kekayaan Intelektual",
        content: [
            {
                text: `Semua konten dan materi yang disediakan oleh ${APP_NAME} (tidak termasuk konten pengguna) dilindungi oleh hak cipta dan hukum kekayaan intelektual lainnya.`,
            },
            {
                subtitle: "Anda tidak boleh:",
                items: [
                    "Menyalin, memodifikasi, atau mendistribusikan materi kami tanpa izin",
                    "Menggunakan merek dagang atau logo kami tanpa persetujuan tertulis",
                    "Membuat karya turunan dari layanan kami",
                    "Melakukan reverse engineering pada software kami",
                ],
            },
        ],
    },
    {
        id: "penggunaan-yang-dilarang",
        title: "6. Penggunaan yang Dilarang",
        content: [
            {
                subtitle: "Anda setuju untuk tidak:",
                items: [
                    "Menggunakan layanan untuk tujuan ilegal",
                    "Mengganggu operasi layanan atau server kami",
                    "Mencoba mengakses akun atau data pengguna lain tanpa izin",
                    "Menggunakan bot, scraper, atau alat otomatis tanpa persetujuan",
                    "Menyebarkan virus, malware, atau kode berbahaya lainnya",
                    "Melakukan phishing atau penipuan",
                    "Melanggar privasi pengguna lain",
                    "Mengumpulkan data pengguna tanpa persetujuan",
                ],
            },
        ],
    },
    {
        id: "disclaimer",
        title: "7. Disclaimer",
        content: [
            {
                subtitle: "Resep dan Informasi Kesehatan:",
                items: [
                    "Resep disediakan untuk tujuan informasi dan hiburan",
                    "Kami tidak bertanggung jawab atas reaksi alergi atau masalah kesehatan",
                    "Selalu periksa bahan untuk alergen sebelum memasak",
                    "Konsultasikan dengan profesional kesehatan untuk kebutuhan diet khusus",
                ],
            },
            {
                subtitle: "Batasan Tanggung Jawab:",
                items: [
                    "Layanan disediakan tanpa jaminan apa pun",
                    "Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan layanan",
                    "Kami tidak menjamin keakuratan konten yang dibuat pengguna",
                ],
            },
        ],
    },
    {
        id: "ganti-rugi",
        title: "8. Ganti Rugi",
        content: [
            {
                text: `Anda setuju untuk membebaskan dan melindungi ${APP_NAME}, direktur, karyawan, dan afiliasinya dari setiap klaim, kerugian, atau biaya (termasuk biaya pengacara) yang timbul dari:`,
            },
            {
                items: [
                    "Pelanggaran Anda terhadap Syarat dan Ketentuan ini",
                    "Konten yang Anda posting atau bagikan",
                    "Pelanggaran hak pihak ketiga",
                    "Penggunaan layanan yang tidak sah",
                ],
            },
        ],
    },
    {
        id: "perubahan-ketentuan",
        title: "9. Perubahan Ketentuan",
        content: [
            {
                subtitle: "Pembaruan:",
                items: [
                    "Kami dapat memperbarui Syarat dan Ketentuan ini kapan saja",
                    "Perubahan material akan diberitahukan melalui email atau notifikasi",
                    "Penggunaan berkelanjutan setelah perubahan berarti persetujuan",
                    "Tanggal efektif akan diperbarui di bagian atas halaman",
                ],
            },
        ],
    },
    {
        id: "hukum-yang-berlaku",
        title: "10. Hukum yang Berlaku",
        content: [
            {
                text: "Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.",
            },
            {
                subtitle: "Penyelesaian Sengketa:",
                items: [
                    "Sengketa akan diselesaikan melalui musyawarah terlebih dahulu",
                    "Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui arbitrase",
                    "Arbitrase akan dilakukan di Jakarta, Indonesia",
                ],
            },
        ],
    },
];

export function SyaratKetentuanPage() {
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
                            <Scale className="size-4" />
                            Syarat & Ketentuan
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Syarat & Ketentuan
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                            Mohon baca dengan seksama syarat dan ketentuan penggunaan layanan {APP_NAME} berikut ini
                            sebelum menggunakan platform kami.
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-4" />
                            <span>Terakhir diperbarui: {lastUpdated}</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Important Notice */}
            <section className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}>
                        <Alert className="border-amber-500/50 bg-amber-500/10">
                            <AlertTriangle className="size-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                                <strong>Penting:</strong> Dengan menggunakan layanan {APP_NAME}, Anda dianggap telah
                                membaca, memahami, dan menyetujui semua syarat dan ketentuan yang tercantum di halaman
                                ini.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                </div>
            </section>

            {/* Table of Contents */}
            <section className="border-b border-border/50 pb-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}>
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
                                            {contentBlock.text && (
                                                <p className="mb-4 text-muted-foreground">{contentBlock.text}</p>
                                            )}
                                            {contentBlock.subtitle && (
                                                <h3 className="mb-3 font-medium text-foreground">
                                                    {contentBlock.subtitle}
                                                </h3>
                                            )}
                                            {contentBlock.items && (
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
                                            )}
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
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                            <Gavel className="size-8 text-primary" />
                        </div>
                        <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">Ada Pertanyaan?</h2>
                        <p className="mb-6 text-muted-foreground">
                            Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, jangan ragu untuk
                            menghubungi kami.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button asChild className="gap-2">
                                <a href="mailto:legal@reseply.id">
                                    <Mail className="size-4" />
                                    Hubungi Tim Legal
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/kebijakan-privasi">Lihat Kebijakan Privasi</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
