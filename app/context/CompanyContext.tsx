"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { Search, Menu } from "lucide-react";

// 1. Define the context type
type CompanyContextType = {
  company: {
    name: string;
  };
  setCompany: (company: { name: string }) => void;
};

// 2. Create context with proper default (undefined)
const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// 3. Type the props
type CompanyProviderProps = {
  children: ReactNode;
};

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [company, setCompany] = useState({ name: "" });

  // Load from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("company") || "{name: ''}");
    async function fetchCompany() {
      if (data) {
        setCompany(data || { name: "" });
      } else {
        console.error("No company name found in localStorage");
      }
    }
    fetchCompany();
  }, []);

  return (
    <CompanyContext.Provider value={{ company: company, setCompany }}>
      <div className="flex h-[50px] flex items-center gap-2 bg-[#213F71] text-white pl-[10px] pr-[10px] justify-between">
        <h1>{company.name}</h1>
        <div className="flex gap-2">
          <Search size={18} />
          <Menu size={18} />
        </div>
      </div>
      {children}
    </CompanyContext.Provider>
  );
}

// 4. Safe custom hook
export function useCompany() {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error("useCompany must be used within CompanyProvider");
  }

  return context;
}
