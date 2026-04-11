"use client";

import { useEffect } from "react";

export default function Home({ company }: any) {
  useEffect(() => {
    if (company?.id) {
      localStorage.setItem("company", JSON.stringify(company));
    }
  }, [company]);

  return (
    <div>
      <h1>{company.name}</h1>
    </div>
  );
}