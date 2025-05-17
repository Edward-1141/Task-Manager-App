'use client'

import "@/app/globals.css";
import TopNavBar from "@/components/TopNavBar";
import { UserProjectsProvider } from "@/contexts/UserProjectsContext";
import { UserProvider } from "@/contexts/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <UserProjectsProvider>
        <TopNavBar />
        <main className="container px-4 sm:px-6 lg:px-8 pt-30 flex-1">
          {children}
        </main>
      </UserProjectsProvider>
    </UserProvider>
  );
}
