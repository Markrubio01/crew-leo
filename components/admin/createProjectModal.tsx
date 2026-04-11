"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { createProject } from "@/lib/api/projects";

export default function ProjectModal({
  open,
  setOpen,
  companyName,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  companyName: string;
}) {
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!projectName) return;

    try {
      setLoading(true);

      const companyId = localStorage.getItem("companyId");

      if (!companyId) {
        console.error("No companyId found in localStorage");
        return;
      }

      await createProject(projectName, projectLocation, companyId);

      // reset form
      setProjectName("");
      setProjectLocation("");

      // close modal
      setOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input
              value={companyName}
              disabled
            />
          </div>

          <div className="grid gap-2">
            <Label>Project Name</Label>
            <Input
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Location</Label>
            <Input
              placeholder="Enter project location"
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
