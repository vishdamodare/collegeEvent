import type { Metadata } from "next";
import { Inter, Anton, Archivo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollegeEvents — Where Campus Life Happens",
  description: "The platform where students discover, register for, and live campus life across every university.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${anton.variable} ${archivo.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
