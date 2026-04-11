import { supabase } from "../supabaseClient";

export async function getCompanyByName(name: string) {
  const { data, error } = await supabase
    .from("Company")
    .select(`
      id,
      name,
      Project (
        id,
        name,
        location,
        ProjectAssignment (
          Employee (
            id,
            name,
            role,
            rate
          )
        )
      )
    `)
    .eq("name", name)
    .single();

  if (error) {
    console.log("Error fetching company:", error);
    return {name: 'Company not found'};
  };

  return data;
}