import type { Metadata } from "next";
import "./globals.css";
import { SentinelShell } from "@/components/layout/SentinelShell";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Sentinel Command Center",
  description: "AI-Powered Blockchain Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SentinelShell>
            {children}
          </SentinelShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
