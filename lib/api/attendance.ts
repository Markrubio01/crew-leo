import { supabase } from "../supabaseClient";

export async function getAttendance(employeeId: string) {
  const { data, error } = await supabase
    .from("Attendance")
    .select("*")
    .eq("employeeId", employeeId);

  if (error) throw error;

  return data;
}