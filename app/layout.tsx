import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SootheSpot",
  description: "Your tools. Your space. A calmer you."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
