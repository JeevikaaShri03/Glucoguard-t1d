// src/app/layout.tsx
import "./globals.css";
import SidebarNav from "@/src/components/ui/SidebarNav";
import AuthGuard from "@/src/components/authguard";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/src/components/ui/Toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthGuard>
            <div className="flex flex-col md:flex-row min-h-screen">
              <SidebarNav />
              <main className="flex-1 p-4 md:p-8 bg-[var(--bg-main)]">
                {children}
              </main>
            </div>
          </AuthGuard>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}