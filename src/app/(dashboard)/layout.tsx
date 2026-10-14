"use client";

import AppSidebar from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AppSidebar />
      <div className="flex-1 min-w-0 bg-[#f7f8f4]">
        {children}
      </div>
    </div>
  );
}
