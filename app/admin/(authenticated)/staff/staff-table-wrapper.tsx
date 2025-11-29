"use client";

import dynamic from "next/dynamic";
import { User } from "./columns";

const DataTable = dynamic(() => import("./data-table").then((mod) => mod.DataTable), {
  ssr: false,
});

interface StaffTableWrapperProps {
  data: User[];
  userRole: string;
  currentUserEmail?: string;
}

export function StaffTableWrapper(props: StaffTableWrapperProps) {
  return <DataTable {...props} />;
}
