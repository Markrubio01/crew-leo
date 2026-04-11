import { supabase } from "../supabaseClient";

export async function getProjects(companyId: string) {
  const { data, error } = await supabase
    .from("Project")
    .select("*")
    .eq("companyId", companyId);

  if (error) throw error;

  return data;
}

export async function createProject(
  name: string,
    location: string,
    companyId: string
) {
  const { data, error } = await supabase
    .from("Project")
    .insert({ name, location, companyId })
    .select()
    .single();
    
    if (error) throw error;
    
    return data;
}

export async function getProjectsByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from("ProjectAssignment")
    .select(`
      Project (
        id,
        name,
        location,
        companyId
      )
    `)
    .eq("employeeId", employeeId);

  if (error) throw error;

  return data?.map((item) => item.Project);
}