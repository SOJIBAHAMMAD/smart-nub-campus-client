"use client";

import { useCallback, useState } from "react";
import {
  FolderOpen,
  GraduationCap,
  HelpCircle,
  MessageCircle,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService } from "@/services/admin.service";
import { CoursesTab } from "@/components/admin/course/courses-tab";
import { CategoryTab } from "@/components/admin/course/category-tab";
import { cn } from "@/lib/utils";

// ── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "courses" | "resource-categories" | "discussion-categories" | "question-categories";

interface TabConfig {
  value: Tab;
  label: string;
  addLabel: string;
  icon: LucideIcon;
}

const TABS: TabConfig[] = [
  { value: "courses", label: "Courses", addLabel: "Add Course", icon: GraduationCap },
  { value: "resource-categories", label: "Resource Categories", addLabel: "Add Category", icon: FolderOpen },
  { value: "discussion-categories", label: "Discussion Categories", addLabel: "Add Category", icon: MessageCircle },
  { value: "question-categories", label: "Question Categories", addLabel: "Add Category", icon: HelpCircle },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [counts, setCounts] = useState<Partial<Record<Tab, number>>>({});
  const [createSignals, setCreateSignals] = useState<Record<Tab, number>>({
    courses: 0,
    "resource-categories": 0,
    "discussion-categories": 0,
    "question-categories": 0,
  });

  const activeConfig = TABS.find((tab) => tab.value === activeTab) ?? TABS[0];

  const handleCountChange = useCallback((tab: Tab, count: number) => {
    setCounts((prev) => (prev[tab] === count ? prev : { ...prev, [tab]: count }));
  }, []);

  const handleHeaderCreate = () => {
    setCreateSignals((prev) => ({ ...prev, [activeTab]: prev[activeTab] + 1 }));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Courses &amp; Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage courses, resource categories, discussion categories, and question categories.
          </p>
        </div>
        <Button onClick={handleHeaderCreate} className="w-full sm:w-auto">
          <Plus data-icon="inline-start" />
          {activeConfig.addLabel}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)}>
        <TabsList className="w-full justify-start gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = counts[tab.value];
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="group/tab flex-none gap-1.5 px-3 sm:flex-1"
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none tabular-nums transition-colors",
                      "bg-muted text-muted-foreground",
                      "group-data-[active]/tab:bg-primary group-data-[active]/tab:text-primary-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Tab panels */}
      {activeTab === "courses" && (
        <CoursesTab
          createSignal={createSignals.courses}
          onCountChange={(count) => handleCountChange("courses", count)}
        />
      )}

      {activeTab === "resource-categories" && (
        <CategoryTab
          createSignal={createSignals["resource-categories"]}
          onCountChange={(count) => handleCountChange("resource-categories", count)}
          fetcher={() => adminService.listResourceCategories()}
          creator={(data) => adminService.createResourceCategory(data)}
          deleter={(id) => adminService.deleteResourceCategory(id)}
          countKey="resources"
          countLabel="resources"
          itemLabel="Resource Category"
          icon={FolderOpen}
          showDescription
        />
      )}

      {activeTab === "discussion-categories" && (
        <CategoryTab
          createSignal={createSignals["discussion-categories"]}
          onCountChange={(count) => handleCountChange("discussion-categories", count)}
          fetcher={() => adminService.listDiscussionCategories()}
          creator={(data) => adminService.createDiscussionCategory({ name: data.name })}
          deleter={(id) => adminService.deleteDiscussionCategory(id)}
          countKey="discussions"
          countLabel="discussions"
          itemLabel="Discussion Category"
          icon={MessageCircle}
        />
      )}

      {activeTab === "question-categories" && (
        <CategoryTab
          createSignal={createSignals["question-categories"]}
          onCountChange={(count) => handleCountChange("question-categories", count)}
          fetcher={() => adminService.listQuestionCategories()}
          creator={(data) => adminService.createQuestionCategory({ name: data.name })}
          deleter={(id) => adminService.deleteQuestionCategory(id)}
          countKey="questions"
          countLabel="questions"
          itemLabel="Question Category"
          icon={HelpCircle}
        />
      )}
    </div>
  );
}
