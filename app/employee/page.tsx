"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

import { getAllEmployees, deleteEmployee } from "@/lib/api/employee";
import { getProjects } from "@/lib/api/projects";

import UpsertEmployeeModal from "@/components/employee/upsertEmployeeModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { useCompany } from "@/app/context/CompanyContext";

export default function EmployeePage() {
  const { company } = useCompany();

  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [openUpsert, setOpenUpsert] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!company.id) return;

    getAllEmployees(company.id).then(setEmployees);
    getProjects(company.id).then(setProjects);
  }, [company.id]);

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  // CREATE
  const handleCreate = () => {
    setSelectedEmployee(null);
    setOpenUpsert(true);
  };

  // SAVE (CREATE/UPDATE)
  const handleSave = (emp: any) => {
    setEmployees((prev) => {
      const exists = prev.find((e) => e.id === emp.id);
      if (exists) {
        return prev.map((e) => (e.id === emp.id ? emp : e));
      }
      return [emp, ...prev];
    });
  };

  // DELETE FROM MODAL
  const handleDeleteRequest = (emp: any) => {
    setDeleteTarget(emp);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await deleteEmployee(deleteTarget.id);

      setEmployees((prev) =>
        prev.filter((e) => e.id !== deleteTarget.id)
      );

      setOpenDelete(false);
      setDeleteTarget(null);
      setOpenUpsert(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Employees</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* TOP */}
          <div className="flex gap-3">
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button onClick={handleCreate}>
              <Plus size={16} />
              Create
            </Button>
          </div>

          {/* LIST */}
          <div className="space-y-2">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                onClick={() => {
                  setSelectedEmployee(emp);
                  setOpenUpsert(true);
                }}
                className="grid grid-cols-5 p-3 hover:bg-gray-50 cursor-pointer"
              >
                <span>{emp.name}</span>
                <span>{emp.role}</span>
                <span>₱{emp.rate}</span>

                <div className="flex gap-2">
                  {emp.projects?.map((p: any) => (
                    <Badge key={p.id}>{p.name}</Badge>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Trash2
                    className="text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(emp);
                      setOpenDelete(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UPSERT */}
      <UpsertEmployeeModal
        open={openUpsert}
        onOpenChange={setOpenUpsert}
        companyId={company.id}
        projects={projects}
        employee={selectedEmployee}
        onSave={handleSave}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* DELETE CONFIRM */}
      <ConfirmDeleteModal
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete ${deleteTarget?.name}?`}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}