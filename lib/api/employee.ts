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

  // export async function getAllEmployees() {
  //   const { data, error } = await supabase
  //     .from("ProjectAssignment")
  //     .select(
  //       `
  //       Employee (
  //         id,
  //         name,
  //         role,
  //         rate
  //       )
  //     `,
  //     )

  //   if (error) throw error;

  //   return data?.map((item) => item.Employee);
  // }

  export async function getAllEmployees() {
    const { data, error } = await supabase
      .from("ProjectAssignment")
      .select(`
        Employee (
          id,
          name,
          role,
          rate
        ),
        Project (
          id,
          name
        )
      `);

    if (error) throw error;

    const map = new Map();

    data?.forEach((item) => {
      const emp = item.Employee;
      const project = item.Project;

      if (!emp) return;

      // if employee already exists → reuse it
      if (!map.has(emp.id)) {
        map.set(emp.id, {
          ...emp,
          projects: [],
        });
      }

      // add project (avoid duplicates if needed)
      if (project) {
        map.get(emp.id).projects.push(project);
      }
    });

    return Array.from(map.values());
  }

  // export async function createEmployee(
  //   name: string,
  //   role: string,
  //   rate: number,
  //   projectId: string,
  //   companyId: string
  // ) {
  //   const { data: employeeData, error: employeeError } = await supabase
  //     .from("Employee")
  //     .insert({ name, role, rate, companyId })
  //     .select()
  //     .single();

  //   if (employeeError) throw employeeError;
  //   const { data: assignmentData, error: assignmentError } = await supabase
  //     .from("ProjectAssignment")
  //     .insert({ employeeId: employeeData.id, projectId })
  //     .select()
  //     .single();

  //   if (assignmentError) throw assignmentError;

  //   return employeeData;
  // }

  export async function createEmployee(
    name: string,
    role: string,
    rate: number,
    projectIds: string[],
    companyId: string
  ) {
    const { data: employeeData, error: employeeError } = await supabase
      .from("Employee")
      .insert({ name, role, rate, companyId })
      .select()
      .single();

    if (employeeError) throw employeeError;

    // insert multiple project assignments
    const assignments = projectIds.map((projectId) => ({
      employeeId: employeeData.id,
      projectId,
    }));

    const { error: assignmentError } = await supabase
      .from("ProjectAssignment")
      .insert(assignments);

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

  export async function updateEmployee(
  employeeId: string,
  name: string,
  role: string,
  rate: number,
  projectIds: string[],
  companyId: string
) {
  // 1. Update employee basic info
  const { data: employeeData, error: employeeError } = await supabase
    .from("Employee")
    .update({
      name,
      role,
      rate,
      companyId,
    })
    .eq("id", employeeId)
    .select()
    .single();

  if (employeeError) throw employeeError;

  // 2. Remove existing project assignments (clean slate approach)
  const { error: deleteError } = await supabase
    .from("ProjectAssignment")
    .delete()
    .eq("employeeId", employeeId);

  if (deleteError) throw deleteError;

  // 3. Insert new project assignments (multi-project support)
  if (projectIds.length > 0) {
    const assignments = projectIds.map((projectId) => ({
      employeeId,
      projectId,
    }));

    const { error: assignmentError } = await supabase
      .from("ProjectAssignment")
      .insert(assignments);

    if (assignmentError) throw assignmentError;
  }

  return employeeData;
}

export async function deleteEmployee(employeeId: string) {
  // 1. delete project assignments first (cleanup)
  const { error: assignmentError } = await supabase
    .from("ProjectAssignment")
    .delete()
    .eq("employeeId", employeeId);

  if (assignmentError) throw assignmentError;

  // 2. delete employee
  const { error: employeeError } = await supabase
    .from("Employee")
    .delete()
    .eq("id", employeeId);

  if (employeeError) throw employeeError;

  return true;
}