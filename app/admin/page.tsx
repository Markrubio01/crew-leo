"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  Info,
  CirclePlus,
  UserPlus,
  Calendar,
  DollarSign,
  Crown,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { getProjects, getProjectsByEmployee } from "@/lib/api/projects";
import { getEmployeesByProject } from "@/lib/api/employee";
import ProjectModal from "@/components/admin/createProjectModal";
import EmployeeModal from "@/components/admin/addEmployeeModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Project = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  name: string;
  role: string;
  rate: number;
};

type Timesheet = {
  date: string;
  timeIn: string;
  timeOut: string;
  hours: number;
};

export default function AdminPage() {
  const [selectedEmployeeID, setSelectedEmployeeID] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");

  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);

  const [projectsForEmployee, setProjectsForEmployee] = useState<Project[]>([]);
  const [company, setCompany] = useState<any>({});

  const [activeTab, setActiveTab] = useState<"timesheet" | "payroll" | null>(
    null,
  );

  const [timeIn, setTimeIn] = useState<string | null>(null);
  const [timeOut, setTimeOut] = useState<string | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet[]>([]);

  const router = useRouter();

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeID);

  const handleTimeIn = () => {
    const now = new Date().toLocaleTimeString();
    setTimeIn(now);
  };

  const handleTimeOut = () => {
    const now = new Date().toLocaleTimeString();
    setTimeOut(now);

    if (timeIn) {
      const hours = 8; // dummy calc (replace with real logic later)

      const newRecord: Timesheet = {
        date: new Date().toLocaleDateString(),
        timeIn,
        timeOut: now,
        hours,
      };

      setTimesheet((prev) => [newRecord, ...prev]);
    }
  };

    const handleEmployeeClick = (id: string) => {
    setSelectedEmployeeID(id);
  };

    const handleChange = (value: string) => {
    setSelectedProject(value);
  };

    const handleSearch = (e: any) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const stored = localStorage.getItem("company");
    if (stored) setCompany(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!company?.id) return;

    getProjects(company.id).then(setProjects);
  }, [company, openProjectModal]);

  useEffect(() => {
    if (!selectedProject) return;

    setSelectedEmployeeID(null);
    setActiveTab(null);

    getEmployeesByProject(selectedProject).then((data) =>
      setEmployees((data || []).flat()),
    );
  }, [selectedProject, openEmployeeModal]);

  useEffect(() => {
    if (!selectedEmployeeID) return;

    getProjectsByEmployee(selectedEmployeeID).then(setProjectsForEmployee);
  }, [selectedEmployeeID]);

  return (
    <div className="flex h-screen">
      {/* LEFT PANEL */}
      <div className="border-r w-[260px] flex flex-col">
        <div className="p-4 font-bold text-lg">Administrator</div>

        {/* Project Select */}
        <div className="px-4 flex items-center gap-2">
          <Select onValueChange={handleChange} value={selectedProject}>
            <SelectTrigger className="overflow-hidden w-full text-ellipsis whitespace-nowrap">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CirclePlus
            className="cursor-pointer"
            onClick={() => setOpenProjectModal(true)}
          />
        </div>

        {/* Employees Header */}
        <div className="flex justify-between items-center px-4 mt-4">
          <Link href="/employee" className="font-semibold">
            Employees
          </Link>
          <ChevronRight
            className="cursor-pointer"
            onClick={() => router.push("/employee")}
          />
        </div>

        {/* Search */}
        <div className="px-4 mt-2 flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <UserPlus
            className={`cursor-pointer ${!selectedProject ? "opacity-30" : ""}`}
            onClick={() => {
              if (!selectedProject) return;
              setOpenEmployeeModal(true);
            }}
          />
        </div>

        {/* Employee List */}
        <div className="mt-4 overflow-y-auto">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              onClick={() => handleEmployeeClick(employee.id)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selectedEmployeeID === employee.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full" />
              <div>
                <div>{employee.name}</div>
                <div className="text-sm text-gray-500">{employee.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-8 bg-gray-50">
        {selectedEmployee ? (
          <div className="grid grid-cols-2 gap-8">
            {/* LEFT SIDE */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-full" />
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedEmployee.name}
                  </h2>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Crown size={14} className="text-yellow-500" />
                    {selectedEmployee.role}
                  </div>
                </div>
              </div>

              <div className="font-semibold text-lg">
                ₱{selectedEmployee.rate.toFixed(2)}/day
              </div>

              <div className="bg-white p-4 rounded-xl border">
                <h3 className="font-semibold mb-2">Projects Assigned</h3>
                <ul className="list-disc ml-5">
                  {projectsForEmployee.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </div>

              {/* TIME */}
              <div className="flex gap-3">
                <button
                  onClick={handleTimeIn}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Time In
                </button>
                <button
                  onClick={handleTimeOut}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Time Out
                </button>
              </div>

              {/* TODAY RECORD */}
              <div className="bg-white p-4 rounded-xl border">
                <h3 className="font-semibold mb-2">Today's Record</h3>
                <div className="flex justify-between">
                  <span>Time In</span>
                  <span>{timeIn || "--:--"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Out</span>
                  <span>{timeOut || "--:--"}</span>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("timesheet")}
                  className="w-full flex justify-between bg-gray-200 px-4 py-3 rounded-lg"
                >
                  <span className="flex gap-2 items-center">
                    <Calendar size={16} />
                    View Timesheet
                  </span>
                  <ChevronRight />
                </button>

                <button
                  onClick={() => setActiveTab("payroll")}
                  className="w-full flex justify-between bg-gray-200 px-4 py-3 rounded-lg"
                >
                  <span className="flex gap-2 items-center">
                    <DollarSign size={16} />
                    View Payroll
                  </span>
                  <ChevronRight />
                </button>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div>
              {!activeTab && (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Select Timesheet or Payroll
                </div>
              )}

              {/* TIMESHEET */}
              {activeTab === "timesheet" && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="font-semibold mb-4">Timesheet</h3>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2">Date</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheet.map((t, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{t.date}</td>
                          <td>{t.timeIn}</td>
                          <td>{t.timeOut}</td>
                          <td>{t.hours}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {timesheet.length === 0 && (
                    <div className="text-center text-gray-400 mt-6">
                      No records yet
                    </div>
                  )}
                </div>
              )}

              {activeTab === "payroll" && (
                <div className="space-y-6">
                  <div className="bg-gray-100 px-4 py-2 rounded">
                    Pay Period: Oct 1 - Oct 31
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-xl p-4">
                      <h3 className="font-semibold mb-2">Gross Earnings</h3>
                      <div className="flex justify-between">
                        <span>Regular</span>
                        <span>₱10,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime</span>
                        <span>₱3,200</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>₱13,200</span>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4">
                      <h3 className="font-semibold mb-2">Deductions</h3>
                      <div className="flex justify-between">
                        <span>Lates</span>
                        <span>₱112.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Absences</span>
                        <span>₱1,200</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>₱1,312.50</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm">Net Pay</div>
                    <div className="text-3xl font-bold">₱11,887.50</div>
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      Download Payroll
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select an employee
          </div>
        )}
      </div>

      {/* MODALS */}
      <ProjectModal
        open={openProjectModal}
        setOpen={setOpenProjectModal}
        companyName={company?.name}
      />

      <EmployeeModal
        open={openEmployeeModal}
        setOpen={setOpenEmployeeModal}
        projectId={selectedProject}
        projectName={projects.find((p) => p.id === selectedProject)?.name || ""}
      />
    </div>
  );
}
