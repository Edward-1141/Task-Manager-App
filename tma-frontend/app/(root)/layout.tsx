import "@/app/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
          <ToastContainer />
          {children}
          <ToastContainer />
        </body>
        </html>
    </AuthProvider>
  );
}
