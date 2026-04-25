import { Metadata } from "next";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";

export const metadata: Metadata = {
  title: "Admin Panel - SMA Negeri 1 Tapa",
  description: "Manajemen Sistem Informasi SMA N 1 Tapa",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
