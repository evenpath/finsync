// src/components/partner/TeamManagement.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  PlusCircle,
  Search,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Button } from "../../components/ui/button";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PartnerUser, UserRole } from "../../lib/types";
import { archiveUser, getPartnerEmployees } from "../../actions/partner-actions";
import { Badge } from "../../components/ui/badge";
import InviteEmployeeDialog from "./InviteEmployeeDialog";
import { Invitation } from "../../lib/types/invitation";
import { invitationActions } from "../../actions/employee-invitation-actions";
import { PartnerAuthWrapper } from "../PartnerAuthWrapper";
import PartnerHeader from "../PartnerHeader";
import TeamManagementDiagnostics from "../TeamManagementDiagnostics";

export default function TeamManagement() {
  const [isDiagnostic, setIsDiagnostic] = useState<boolean>(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const {
    data: employees,
    isLoading,
    isError,
  } = useQuery<PartnerUser[]>({
    queryKey: ["partnerEmployees", user?.partnerId],
    queryFn: () => getPartnerEmployees(user?.partnerId!),
    enabled: !!user?.partnerId,
  });

  const { data: invitations } = useQuery<Invitation[]>({
    queryKey: ["partnerInvitations", user?.partnerId],
    queryFn: () => invitationActions.getPendingInvitations(user?.partnerId!),
    enabled: !!user?.partnerId,
  });

  const archiveUserMutation = useMutation({
    mutationFn: (userId: string) => archiveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerEmployees"] });
      toast({
        title: "User Archived",
        description: "The user has been successfully archived.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const columns: ColumnDef<PartnerUser>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.email}</span>
          <span className="text-sm text-gray-500">
            {row.original.firstName} {row.original.lastName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.role === UserRole.ADMIN ? "default" : "secondary"
          }
        >
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.isActive
              ? "success"
              : row.original.isArchived
              ? "destructive"
              : "outline"
          }
        >
          {row.original.isActive
            ? "Active"
            : row.original.isArchived
            ? "Archived"
            : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: ({ row }) =>
        row.original.lastLogin ? (
          <span className="text-sm">
            {format(new Date(row.original.lastLogin), "PPP")}
          </span>
        ) : (
          "Never"
        ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const [isDialogOpen, setIsDialogOpen] = useState(false);
        const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
        const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] =
          useState(false);

        const handleUnarchive = () => {
          // Unarchive logic
        };

        const handleArchive = () => {
          archiveUserMutation.mutate(user.id);
          setIsArchiveDialogOpen(false);
        };

        const handleEdit = () => {
          // Edit logic
        };

        return (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit()}>
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.isArchived ? (
                  <DropdownMenuItem
                    onClick={() => setIsUnarchiveDialogOpen(true)}
                  >
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Unarchive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => setIsArchiveDialogOpen(true)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isArchiveDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will archive the user. The user will no longer
                    be able to login. You can unarchive them later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsArchiveDialogOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive}>
                    Archive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: employees || [],
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <PartnerAuthWrapper>
      <div className="flex flex-col h-full">
        <PartnerHeader />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-9 px-3"
                onClick={() => setIsDiagnostic((prev) => !prev)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                Diagnostics
              </Button>
              <InviteEmployeeDialog invitations={invitations || []} />
            </div>
          </div>
          {isDiagnostic && <TeamManagementDiagnostics />}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search employees by email..."
                value={
                  (table.getColumn("email")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("email")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
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
                      {isLoading ? "Loading..." : "No results."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </PartnerAuthWrapper>
  );
}