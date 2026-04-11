import { getCompanyByName } from "@/lib/api/company";
import Home from "../components/home/home";

export default async function HomePage() {
  const company = await getCompanyByName("DAP Construction and Services");
  console.log("Fetched company:", company);
  return <Home company={company} />;
}