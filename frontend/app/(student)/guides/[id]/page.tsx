import { GuideDetail } from "@/components/GuideDetail";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ResponsiveBackgroundSprites } from "@/components/ResponsiveBackgroundSprites";
import { TechBackground } from "@/components/TechBackground";

export const metadata = {
  title: "Learning Guide - VOX",
  description: "Detalle de guía de aprendizaje",
};

interface GuidePageProps {
  params: { id: string };
}

export default function GuidePage({ params }: GuidePageProps) {
  return (
    <div className="min-h-screen bg-midnight p-6 relative overflow-hidden">
      <TechBackground />
      <ResponsiveBackgroundSprites />
      <div className="max-w-4xl mx-auto relative z-10 pt-4">
        {/* Back button */}
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-6 transition-colors font-tech uppercase tracking-widest text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          BACK TO DATABASE
        </Link>

        <GuideDetail guideId={params.id} />
      </div>
    </div>
  );
}
