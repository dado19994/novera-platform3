import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novera | Creative Culture Infrastructure",
  description: "A living map for cultural movement, artistic signals, and opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
