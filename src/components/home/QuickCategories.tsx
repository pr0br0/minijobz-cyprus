"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function QuickCategories() {
  const router = useRouter();
  const categories = ["Technology", "Healthcare", "Finance", "Tourism", "Education", "Construction"];
  const handleCategory = (c: string) => router.push(`/jobs?q=${encodeURIComponent(c)}`);
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12" aria-label="Popular categories">
      {categories.map(c => (
        <Button key={c} variant="outline" size="sm" onClick={() => handleCategory(c)} className="hover:bg-blue-50 hover:border-blue-300">
          {c}
        </Button>
      ))}
    </div>
  );
}
