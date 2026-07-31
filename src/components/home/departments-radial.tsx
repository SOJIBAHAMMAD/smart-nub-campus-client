"use client";

import { RadialFlow, type Topic } from "@/components/ui/radialflow";

const departments: Topic[] = [
  {
    id: "cse",
    name: "Computer Science & Engineering",
    position: { x: 75, y: 15 },
    color: "#7c3aed",
    highlighted: true,
  },
  {
    id: "eee",
    name: "Electrical & Electronic Engineering",
    position: { x: 88, y: 40 },
    color: "#2563eb",
    highlighted: false,
  },
  {
    id: "bba",
    name: "Business Administration",
    position: { x: 78, y: 70 },
    color: "#059669",
    highlighted: false,
  },
  {
    id: "english",
    name: "English Department",
    position: { x: 52, y: 85 },
    color: "#d97706",
    highlighted: false,
  },
  {
    id: "law",
    name: "Department of Law",
    position: { x: 25, y: 72 },
    color: "#dc2626",
    highlighted: false,
  },
  {
    id: "economics",
    name: "Economics & Banking",
    position: { x: 12, y: 42 },
    color: "#0891b2",
    highlighted: false,
  },
  {
    id: "civil",
    name: "Civil Engineering",
    position: { x: 22, y: 15 },
    color: "#ca8a04",
    highlighted: false,
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    position: { x: 48, y: 4 },
    color: "#db2777",
    highlighted: false,
  },
];

export function DepartmentsRadial() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-screen-2xl px-6 xl:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Academic Departments
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore resources by department
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
          <div className="h-80 md:h-96">
            <RadialFlow
              topics={departments}
              badgeName="NUB"
              centralDotColor="#7c3aed"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
