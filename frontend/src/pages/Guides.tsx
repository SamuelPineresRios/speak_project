import { GuidesList } from "@/components/GuidesList";
import { ResponsiveBackgroundSprites } from "@/components/ResponsiveBackgroundSprites";
import { TechBackground } from "@/components/TechBackground";

export const metadata = {
  title: "Learning Guides - VOX",
  description: "Recursos estructurados para aprender inglés",
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-midnight p-6 relative overflow-hidden">
      <TechBackground />
      <ResponsiveBackgroundSprites />
      <div className="max-w-7xl mx-auto relative z-10 pt-4">
        <GuidesList />
      </div>
    </div>
  );
}
