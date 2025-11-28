"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InviteUserModal } from "@/components/admin/invite-user-modal";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { isSameDay, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldAlert,
  User as UserIcon,
  Check,
  X,
  Trash2,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getColumns, User } from "./columns";

interface DataTableProps {
  data: User[];
  userRole: string;
}

export function DataTable({ data, userRole }: DataTableProps) {
  const router = useRouter();
  const columns = React.useMemo(() => getColumns(userRole), [userRole]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({});

  // Date filtering state
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Filter data based on date AND global text search
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // 1. Date Filtering
      let matchesDate = true;
      if (item.createdAt && dateRange?.from) {
        const itemDate = new Date(item.createdAt);

        if (dateRange.to) {
          matchesDate = isWithinInterval(itemDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        } else {
          matchesDate = isSameDay(itemDate, dateRange.from);
        }
      }

      // 2. Global Text Filtering (Name or Email)
      let matchesGlobal = true;
      if (globalFilter) {
        const search = globalFilter.toLowerCase();
        const name = item.name?.toLowerCase() || "";
        const email = item.email?.toLowerCase() || "";
        matchesGlobal = name.includes(search) || email.includes(search);
      }

      return matchesDate && matchesGlobal;
    });
  }, [data, dateRange, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const isBulkActionsVisible = selectedRows.length > 0;

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedRows.length} utilisateurs ?`
      )
    ) {
      return;
    }

    const userIds = selectedRows.map((row) => row.original.id);

    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete users");
      }

      toast.success(`${selectedRows.length} utilisateurs supprimés.`);
      setRowSelection({});
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression.");
    }
  };

  const handleBulkRoleChange = async (newRole: string) => {
    const userIds = selectedRows.map((row) => row.original.id);

    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds, role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update roles");
      }

      toast.success(
        `Rôle mis à jour pour ${selectedRows.length} utilisateurs.`
      );
      setRowSelection({});
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour.");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 py-4 w-full">
        {/* Bulk Actions Toolbar */}
        {isBulkActionsVisible && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border/50 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium px-2">
              {selectedRows.length} sélectionné(s)
            </span>
            <div className="h-4 w-px bg-border/50 mx-2" />

            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  Changer Rôle
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => handleBulkRoleChange("adherent")}
                >
                  <UserIcon className="w-4 h-4 mr-2 text-violet-600" />
                  Adhérent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkRoleChange("staff")}>
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  Staff
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkRoleChange("admin")}>
                  <ShieldAlert className="w-4 h-4 mr-2 text-orange-600" />
                  Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>

        {/* Search and Invite */}
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder="Rechercher par nom ou email..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm bg-background/50"
            />
            <Select
              value={
                (table.getColumn("role")?.getFilterValue() as string) ?? "ALL"
              }
              onValueChange={(value) =>
                table
                  .getColumn("role")
                  ?.setFilterValue(value === "ALL" ? "" : value)
              }
            >
              <SelectTrigger className="w-auto min-w-[140px] h-10 bg-background/50">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">
                  Rôle
                </SelectItem>
                <SelectItem
                  value="admin"
                  className="cursor-pointer focus:bg-black/10 dark:focus:bg-white/10"
                >
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800 gap-1 hover:bg-orange-100 dark:hover:bg-orange-900/60"
                  >
                    <ShieldAlert className="w-3 h-3 text-orange-700 dark:text-orange-300" />
                    Admin
                  </Badge>
                </SelectItem>
                <SelectItem
                  value="staff"
                  className="cursor-pointer focus:bg-black/10 dark:focus:bg-white/10"
                >
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                  >
                    <Shield className="w-3 h-3" />
                    Staff
                  </Badge>
                </SelectItem>
                <SelectItem
                  value="adherent"
                  className="cursor-pointer focus:bg-black/10 dark:focus:bg-white/10"
                >
                  <Badge
                    variant="outline"
                    className="bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800 gap-1 hover:bg-violet-100 dark:hover:bg-violet-900/60"
                  >
                    <UserIcon className="w-3 h-3" />
                    Adhérent
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={
                (table
                  .getColumn("emailVerified")
                  ?.getFilterValue() as string) === undefined
                  ? "ALL"
                  : String(table.getColumn("emailVerified")?.getFilterValue())
              }
              onValueChange={(value) =>
                table
                  .getColumn("emailVerified")
                  ?.setFilterValue(
                    value === "ALL" ? undefined : value === "true"
                  )
              }
            >
              <SelectTrigger className="w-auto min-w-[140px] h-10 bg-background/50">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">
                  Statut
                </SelectItem>
                <SelectItem
                  value="true"
                  className="cursor-pointer focus:bg-black/10 dark:focus:bg-white/10"
                >
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800 gap-1 hover:bg-green-100 dark:hover:bg-green-900/60"
                  >
                    <Check className="w-3 h-3" />
                    Vérifié
                  </Badge>
                </SelectItem>
                <SelectItem
                  value="false"
                  className="cursor-pointer focus:bg-black/10 dark:focus:bg-white/10"
                >
                  <Badge
                    variant="outline"
                    className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 gap-1 hover:bg-red-100 dark:hover:bg-red-900/60"
                  >
                    <X className="w-3 h-3" />
                    Non vérifié
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <InviteUserModal />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
