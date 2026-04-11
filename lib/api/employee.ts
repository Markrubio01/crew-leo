import { supabase } from "../supabaseClient";

export async function getEmployeesByProject(projectId: string) {
  const { data, error } = await supabase
    .from("ProjectAssignment")
    .select(
      `
      Employee (
        id,
        name,
        role,
        rate
      )
    `,
    )
    .eq("projectId", projectId);

  if (error) throw error;

  return data?.map((item) => item.Employee);
}

export async function getAllEmployees() {
  const { data, error } = await supabase
    .from("ProjectAssignment")
    .select(
      `
      Employee (
        id,
        name,
        role,
        rate
      )
    `,
    )

  if (error) throw error;

  return data?.map((item) => item.Employee);
}

export async function createEmployee(
  name: string,
  role: string,
  rate: number,
  projectId: string,
  companyId: string
) {
  const { data: employeeData, error: employeeError } = await supabase
    .from("Employee")
    .insert({ name, role, rate, companyId })
    .select()
    .single();

  if (employeeError) throw employeeError;
  const { data: assignmentData, error: assignmentError } = await supabase
    .from("ProjectAssignment")
    .insert({ employeeId: employeeData.id, projectId })
    .select()
    .single();

  if (assignmentError) throw assignmentError;

  return employeeData;
}

export async function assignEmployeeToProject(
  employeeId: string,
  projectId: string
) {
  const { data, error } = await supabase
    .from("ProjectAssignment")
    .insert({
      employeeId,
      projectId,
    })
    .select()
    .single();

  if (error) {
    // handle duplicate assignment (already assigned)
    if (error.code === "23505") {
      throw new Error("Employee is already assigned to this project");
    }

    throw error;
  }

  return data;
}

export async function getAvailableEmployeesForProject(
  projectId: string,
  companyId: string
) {
  // 1. Get employees already assigned to THIS project
  const { data: assigned, error: assignedError } = await supabase
    .from("ProjectAssignment")
    .select("employeeId")
    .eq("projectId", projectId);

  if (assignedError) throw assignedError;

  const assignedIds = assigned.map((a) => a.employeeId);

  // 2. Get ALL employees of the company
  let query = supabase
    .from("Employee")
    .select("id, name, role, rate")
    .eq("companyId", companyId);

  // 3. Exclude ONLY those assigned to THIS project
  if (assignedIds.length > 0) {
    query = query.not("id", "in", `(${assignedIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}