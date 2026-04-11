import { supabase } from "../supabaseClient";

export async function getPayroll(employeeId: string) {
  const { data, error } = await supabase
    .from("Payroll")
    .select("*")
    .eq("employeeId", employeeId);

  if (error) throw error;

  return data;
}