"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { createEmployee, updateEmployee } from "@/lib/api/employee";

type Project = {
  id: number | string;
  name: string;
};

type Employee = {
  id?: string;
  name: string;
  role: string;
  rate: number;
  projects?: Project[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  projects: Project[];

  employee?: Employee | null;

  onSave: (emp: any) => void;
  onDeleteRequest: (emp: any) => void; // 👈 NEW
}

export default function UpsertEmployeeModal({
  open,
  onOpenChange,
  companyId,
  projects,
  employee,
  onSave,
  onDeleteRequest,
}: Props) {
  const isEditMode = !!employee;

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rate, setRate] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setRole(employee.role);
      setRate(String(employee.rate));
      setSelectedProjects(employee.projects || []);
    } else {
      setName("");
      setRole("");
      setRate("");
      setSelectedProjects([]);
    }
  }, [employee, open]);

  const toggleProject = (project: Project) => {
    setSelectedProjects((prev) => {
      const exists = prev.find((p) => p.id === project.id);
      if (exists) return prev.filter((p) => p.id !== project.id);
      return [...prev, project];
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const projectIds = selectedProjects.map((p) => String(p.id));

      let result;

      if (isEditMode && employee?.id) {
        result = await updateEmployee(
          employee.id,
          name,
          role,
          Number(rate),
          projectIds,
          companyId
        );
      } else {
        result = await createEmployee(
          name,
          role,
          Number(rate),
          projectIds,
          companyId
        );
      }

      onSave({
        ...result,
        projects: selectedProjects,
      });

      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Employee" : "Create Employee"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <Input
            placeholder="Rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {projects.map((p) => {
              const selected = selectedProjects.some((sp) => sp.id === p.id);

              return (
                <Badge
                  key={p.id}
                  onClick={() => toggleProject(p)}
                  className={`cursor-pointer ${
                    selected ? "bg-black text-white" : "bg-gray-200"
                  }`}
                >
                  {p.name}
                </Badge>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex justify-between w-full">
          {/* 👇 DELETE BUTTON (ONLY EDIT MODE) */}
          {isEditMode && (
            <Button
              variant="destructive"
              onClick={() => onDeleteRequest(employee)}
            >
              Delete
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={loading}>
              {isEditMode ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}