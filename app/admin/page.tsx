"use client";
import { useEffect, useState } from "react";
import { ChevronRight, Info, CirclePlus, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getProjects } from "@/lib/api/projects";
import { getEmployeesByProject } from "@/lib/api/employee";
import ProjectModal from "@/components/admin/createProjectModal";
import EmployeeModal from "@/components/admin/addEmployeeModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function AdminPage() {
  const [selectedEmployeeID, setSelectedEmployeeID] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const [company, setCompany] = useState("");
  const router = useRouter();
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEmployeeClick = (id) => {
    console.log("Selected Employee ID:", id);
    setSelectedEmployeeID(id);
  };

  const handleTimeIn = () => {
    console.log("Time In for Employee ID:", selectedEmployeeID);
  };

  const handleTimeOut = () => {
    console.log("Time Out for Employee ID:", selectedEmployeeID);
  };

  const handleSearch = (e) => {
    console.log("Search Query:", e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleChange = (value: string) => {
    setSelectedProject(value);
    console.log("Selected project ID:", value);
  };

  const clearInitialData = () => {
    setSearchQuery("");
    setSelectedEmployeeID(null);
  };

  useEffect(() => {
    const fetchCompany = async () => {
      setCompany(JSON.parse(localStorage.getItem("company") || "{}"));
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects(company?.id);
      setProjects(data || []);
    };
    if (company?.id) {
      fetchProjects();
    } else {
      console.log("Company ID not found in localStorage");
    }
  }, [company, openProjectModal]);

  useEffect(() => {
    if (!selectedProject) return;

    const fetchEmployees = async () => {
      clearInitialData(); // Clear search and selected employee when project changes
      const data = await getEmployeesByProject(selectedProject);
      setEmployees((data || []).flat()); // flatten in case of nested arrays
    };

    fetchEmployees();
  }, [selectedProject, openEmployeeModal]);

  return (
    <div>
      <div className="flex">
        <div className="border-r-2 border-gray-300">
          <span className="ml-4 mb-4 text-lg font-bold ">
            Administrator
          </span>

          <div className="w-[200px] ml-4 mr-4">
            <div className=" flex justify-center">
              <div className="w-[200px] overflow-hidden">
                <Select onValueChange={handleChange} value={selectedProject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>

                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CirclePlus
                size={25}
                className="ml-4 cursor-pointer strokeWidth={1} self-center"
                onClick={() => setOpenProjectModal(true)}
              />
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between">

              <Link href="/employee" className="pl-4 pt-4 font-bold cursor-pointer">
                Employees
              </Link>
              <ChevronRight size={18} className="mr-4 cursor-pointer" strokeWidth={3} onClick={() => {  router.push("/employee") }} />
            </div>
            <div className="flex items-center w-[215px]">
              <Input
                placeholder="Search..."
                className="ml-4 w-[215px]"
                onChange={handleSearch}
                value={searchQuery}
              />
              <UserPlus
                size={27}
                className={`ml-4 cursor-pointer self-center ${
                  !selectedProject ? "opacity-30 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (!selectedProject) return;
                  setOpenEmployeeModal(true);
                }}
              />
            </div>
            {filteredEmployees.length === 0 && selectedEmployeeID === null && (
              <p className="px-4 text-gray-500 pt-4">No employees found</p>
            )}
            <div className="h-[calc(100vh-250px)] overflow-y-auto pt-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`flex items-center gap-4 h-[50px] rounded-md cursor-pointer hover:bg-gray-100 ${
                    selectedEmployeeID === employee.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleEmployeeClick(employee.id)}
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full ml-4" />
                  <div className="flex flex-col">
                    <span>{employee.name}</span>
                    <span className="text-sm text-gray-500">
                      {employee.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 w-full">
          {selectedEmployeeID !== null ? (
            <div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full" />
                <div className="flex flex-col">
                  <span>
                    {employees.find((e) => e.id === selectedEmployeeID)?.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {employees.find((e) => e.id === selectedEmployeeID)?.role}
                  </span>
                </div>
              </div>
              <div>
                <div className="mt-4 flex items-center">
                  Status: <span className="ml-2 font-bold">Not Timed In</span>{" "}
                  <Info size={16} className="ml-2" />
                </div>
                <div>
                  <button
                    className="mt-4 rounded bg-green-500 px-4 py-2 text-white cursor-pointer"
                    onClick={handleTimeIn}
                  >
                    Time In
                  </button>
                  <button
                    className="mt-4 ml-2 rounded bg-red-500 px-4 py-2 text-white cursor-pointer"
                    onClick={handleTimeOut}
                  >
                    Time Out
                  </button>
                </div>
                <div>
                  <h2 className="mt-6 text-lg font-bold">Todays Record</h2>
                  <p>Time In: --:--:--</p>
                  <p>Time Out: --:--:--</p>
                </div>
              </div>
            </div>
          ) : (
            <span>No employee selected</span>
          )}
        </div>
        <ProjectModal
          open={openProjectModal}
          setOpen={setOpenProjectModal}
          companyName={company?.name}
        />
        <EmployeeModal
          open={openEmployeeModal}
          setOpen={setOpenEmployeeModal}
          projectId={selectedProject}
          projectName={
            projects.find((p) => p.id === selectedProject)?.name || ""
          }
        />
      </div>
    </div>
  );
}

export default AdminPage;
