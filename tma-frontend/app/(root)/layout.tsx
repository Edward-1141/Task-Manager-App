import "@/app/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import { Metadata } from "next";
import styles from '@/styles/default.module.css';

export const metadata: Metadata = {
  title: {
    default: "Task Manager App",
    template: "%s | Task Manager App"
  },
  description: "A modern task management application",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        {/* A temporary fix to make the text color consistent since now only supports one fixed theme */}
        <body className={`bg-white ${styles.defaultText}`}>
          <ToastContainer />
          {children}
          <ToastContainer />
        </body>
      </html>
    </AuthProvider>
  );
}
