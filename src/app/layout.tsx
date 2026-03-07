import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

import AlertSystemProvider from "./AlertSystemProvider";

export const metadata: Metadata = {
  title: "FITNESS CLUB - منصة إدارة النوادي الرياضية",
  description: "النظام الأول في المملكة لإدارة النوادي الرياضية والاشتراكات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className={`${tajawal.variable} antialiased`}>
        <AlertSystemProvider>
          {children}
        </AlertSystemProvider>
      </body>
    </html>
  );
}
