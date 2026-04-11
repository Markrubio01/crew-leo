"use client";

import { use, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { getAvailableEmployeesForProject, assignEmployeeToProject } from "@/lib/api/employee";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EmployeeModal({
  open,
  setOpen,
  projectId,
  projectName,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  projectId: string;
  projectName: string;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rate, setRate] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");


  useEffect(() => {
    const companyData = localStorage.getItem("company");
    if (companyData) {
      setCompany(JSON.parse(companyData));
    } else {
      console.error("No company data found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAvailableEmployeesForProject(projectId, company?.id);
        setEmployees(data || []);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [company, projectId, open]);

  const handleSubmit = async () => {
    if (!name || !role || !rate) return;

    try {
      setLoading(true);

      await assignEmployeeToProject(selectedEmployee, projectId);

      setName("");
      setRole("");
      setRate(0);
      setSelectedEmployee("");

      setOpen(false);
    } catch (error) {
      console.error("Failed to assign employee to project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setSelectedEmployee(value);
    console.log("Selected employee ID:", value);
  };

  useEffect(() => {
    if (open) {
      const employee = employees.find((emp) => emp.id === selectedEmployee);
      if (employee) {
        setName(employee.name);
        setRole(employee.role);
        setRate(employee.rate);
      } else {
        setName("");
        setRole("");
        setRate(0);
      }
    } else {
      setSelectedEmployee("");
    }
  }, [open, selectedEmployee, employees]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employee to Project</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Project Name</Label>
            <Input value={projectName} disabled />
          </div>

          <div className="grid gap-2">
            <Label>Employee</Label>
            <Select onValueChange={handleChange} value={selectedEmployee}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>

              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Input
              value={role}
              placeholder=""
              disabled
            />
          </div>

          <div className="grid gap-2">
            <Label>Rate</Label>
            <Input
              type="number"
              value={rate}
              placeholder="0.00"
              disabled
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
