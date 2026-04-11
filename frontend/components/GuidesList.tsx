"use client";

import React, { useEffect, useState, useCallback } from "react";
import { GuideCard } from "./GuideCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Guide {
  id: string;
  title: string;
  description: string;
  cover_emoji: string;
  cefr_level: string;
  concept_tags: string[];
  estimated_minutes: number;
  progress?: any;
}

export function GuidesList() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const fetchGuides = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/guides");
      if (!response.ok) throw new Error("Failed to fetch guides");

      const data = await response.json();
      setGuides(data.guides);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading guides");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const filterGuides = useCallback(() => {
    let results = guides;

    if (searchTerm) {
      results = results.filter(
        (guide) =>
          guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== "all") {
      results = results.filter((guide) => guide.cefr_level === selectedLevel);
    }

    if (activeTab !== "all") {
      results = results.filter((guide) => {
        if (activeTab === "in_progress") return guide.progress?.status === "in_progress";
        if (activeTab === "completed") return guide.progress?.status === "completed";
        return true;
      });
    }

    setFilteredGuides(results);
  }, [guides, searchTerm, selectedLevel, activeTab]);

  useEffect(() => {
    filterGuides();
  }, [filterGuides]);

  

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">⚙️</div>
        <span className="ml-2 text-cyan-300">Cargando guías...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error: {error}</p>
        <button
          onClick={fetchGuides}
          className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-smooth-entrance relative">
      {/* Background ambient effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Gamified Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 glass-effect-light p-6 rounded-xl border border-cyan-500/20">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest shadow-neon-cyan/20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-neon" />
            MODULE DATABASE
          </div>
          <h1 className="text-4xl md:text-5xl font-body font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] tracking-tight">
            LEARNING GUIDES
          </h1>
          <p className="text-slate-400 font-mono text-sm max-w-xl">
            &gt; SELECT A MODULE TO INITIATE LEARNING SEQUENCE AND EARN XP.
          </p>
        </div>
        
        {/* User stats summary (mocked visually for gamification) */}
        <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-lg border border-slate-700">
          <div className="text-center px-4 border-r border-slate-700">
            <div className="text-xs text-slate-500 font-tech">TOTAL XP</div>
            <div className="text-xl font-bold text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
              {guides.reduce((acc, g) => acc + (g.progress?.status === 'completed' ? (g as any).xp_reward || 150 : 0), 0)}
            </div>
          </div>
          <div className="text-center px-4">
            <div className="text-xs text-slate-500 font-tech">MASTERED</div>
            <div className="text-xl font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
              {guides.filter(g => g.progress?.status === 'completed').length} / {guides.length}
            </div>
          </div>
        </div>
      </div>

      {/* Controles de filtro */}
      <div className="relative z-50 glass-effect p-4 rounded-xl border border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-cyan-500">🔍</span>
            </div>
            <Input
              placeholder="Search databanks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border-cyan-500/30 text-cyan-300 placeholder:text-slate-600 pl-10 focus-visible:ring-cyan-500/50 font-mono"
            />
          </div>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="bg-slate-900/50 border-cyan-500/30 text-cyan-300 font-mono">
              <SelectValue placeholder="FILTER BY LEVEL" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-cyan-500/30 font-mono">
              <SelectItem value="all" className="text-slate-300 focus:bg-cyan-950 focus:text-cyan-300">ALL LEVELS</SelectItem>
              <SelectItem value="A1" className="text-slate-300 focus:bg-cyan-950 focus:text-cyan-300">A1 - BEGINNER</SelectItem>
              <SelectItem value="A2" className="text-slate-300 focus:bg-cyan-950 focus:text-cyan-300">A2 - ELEMENTARY</SelectItem>
              <SelectItem value="B1" className="text-slate-300 focus:bg-cyan-950 focus:text-cyan-300">B1 - INTERMEDIATE</SelectItem>
              <SelectItem value="B2" className="text-slate-300 focus:bg-cyan-950 focus:text-cyan-300">B2 - UPPER INTERMEDIATE</SelectItem>
              <SelectItem value="C1" className="text-slate-300 focus:bg-cyan-950 focus:text-cyan-300">C1 - ADVANCED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs de estado */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="relative z-10"
      >
        <TabsList className="bg-slate-900/60 border border-cyan-500/20 p-1 font-sans font-semibold h-auto mb-6 rounded-lg inline-flex max-w-full overflow-x-auto">
          <TabsTrigger
            value="all"
            className="py-2.5 px-6 data-[state=active]:bg-cyan-950/50 data-[state=active]:text-cyan-300 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none transition-all duration-300 text-slate-400"
          >
            ALL_MODULES [{guides.length}]
          </TabsTrigger>
          <TabsTrigger
            value="in_progress"
            className="py-2.5 px-6 data-[state=active]:bg-amber-950/50 data-[state=active]:text-amber-300 data-[state=active]:border-b-2 data-[state=active]:border-amber-400 rounded-none transition-all duration-300 text-slate-400"
          >
            IN_PROGRESS [{guides.filter((g) => g.progress?.status === "in_progress").length}]
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="py-2.5 px-6 data-[state=active]:bg-emerald-950/50 data-[state=active]:text-emerald-300 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 rounded-none transition-all duration-300 text-slate-400"
          >
            MASTERED [{guides.filter((g) => g.progress?.status === "completed").length}]
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-2 focus-visible:outline-none focus-visible:ring-0">
          {filteredGuides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 glass-effect border border-slate-800 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 grid-background opacity-20" />
              <div className="text-4xl mb-4 text-slate-600 font-tech">ERROR_404</div>
              <p className="text-slate-400 font-mono relative z-10">
                NO MODULES FOUND MATCHING QUERY PARAMETERS.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 min-h-[690px]">
              {filteredGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
