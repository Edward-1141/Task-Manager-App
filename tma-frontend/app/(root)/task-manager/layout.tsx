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
        <main className="flex flex-col min-h-screen bg-white">
          <TopNavBar />
          <div className="flex-1 p-15 pt-30">
            {children}
          </div>
        </main>
      </UserProjectsProvider>
    </UserProvider>
  );
}
