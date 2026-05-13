"use client";

import AppSidebar from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 bg-[#F5F5F7] overflow-auto">
        {children}
      </div>
    </div>
  );
}
