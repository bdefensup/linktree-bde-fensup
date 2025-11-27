"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ColumnDef,
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
import { Check, ChevronsUpDown, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
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

  const handleBulkStatusChange = async (
    status: "CONFIRMED" | "PENDING" | "CANCELLED"
  ) => {
    const bookingIds = selectedRows.map((row) => (row.original as any).id);

    try {
      const response = await fetch("/api/admin/bookings/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingIds, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update bookings");
      }

      toast.success(`${selectedRows.length} réservations mises à jour.`);
      setRowSelection({});
      router.refresh();
      // Force reload to ensure data is fresh if router.refresh is not enough for client components
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour.");
    }
  };

  return (
    <div>
      {/* Bulk Actions Toolbar */}
      {isBulkActionsVisible && (
        <div className="flex items-center gap-2 p-2 mb-4 bg-muted/50 rounded-md border border-border/50 animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium px-2">
            {selectedRows.length} sélectionné(s)
          </span>
          <div className="h-4 w-px bg-border/50 mx-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusChange("CONFIRMED")}
            className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Check className="w-4 h-4" />
            Valider
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusChange("PENDING")}
            className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            <Clock className="w-4 h-4" />
            En attente
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusChange("CANCELLED")}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="w-4 h-4" />
            Refuser
          </Button>
        </div>
      )}

      <div className="flex items-center py-4 gap-2" suppressHydrationWarning>
        <Input
          placeholder="Filtrer par email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
          suppressHydrationWarning
        />
        {/* Filter by Status */}
        <Select
          value={
            (table.getColumn("status")?.getFilterValue() as string) ?? "ALL"
          }
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "ALL" ? "" : value)
          }
        >
          <SelectTrigger className="w-auto min-w-[140px] h-10">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="cursor-pointer">
              Tout
            </SelectItem>
            <SelectItem
              value="PENDING"
              className="cursor-pointer focus:bg-black/10 dark:focus:bg-white/10"
            >
              <Badge
                variant="outline"
                className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800 hover:bg-orange-200 hover:border-orange-300 dark:hover:bg-orange-900/50 transition-colors duration-200"
              >
                En attente
              </Badge>
            </SelectItem>
            <SelectItem
              value="CONFIRMED"
              className="cursor-pointer focus:bg-black/10 dark:focus:bg-white/10"
            >
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800 hover:bg-green-200 hover:border-green-300 dark:hover:bg-green-900/50 transition-colors duration-200"
              >
                Validé
              </Badge>
            </SelectItem>
            <SelectItem
              value="CANCELLED"
              className="cursor-pointer focus:bg-black/10 dark:focus:bg-white/10"
            >
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800 hover:bg-red-200 hover:border-red-300 dark:hover:bg-red-900/50 transition-colors duration-200"
              >
                Refusé
              </Badge>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Filter by Event */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-auto min-w-[200px] max-w-[300px] justify-between"
            >
              <span className="truncate">
                {table.getColumn("event_title")?.getFilterValue()
                  ? (table.getColumn("event_title")?.getFilterValue() as string)
                  : "Filtrer par événement..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Rechercher un événement..." />
              <CommandList>
                <CommandEmpty>Aucun événement trouvé.</CommandEmpty>
                <CommandGroup>
                  {Array.from(
                    new Set(
                      data
                        .map(
                          (item) =>
                            (item as { event?: { title: string } }).event?.title
                        )
                        .filter(Boolean)
                    )
                  ).map((title) => (
                    <CommandItem
                      key={title as string}
                      value={title as string}
                      onSelect={() => {
                        const filterValue =
                          table.getColumn("event_title")?.getFilterValue() ===
                          title
                            ? ""
                            : title;
                        table
                          .getColumn("event_title")
                          ?.setFilterValue(filterValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          table.getColumn("event_title")?.getFilterValue() ===
                            title
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {title as string}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
