import { GuidesList } from "@/components/GuidesList";
import { BackgroundSprites } from "@/components/BackgroundSprites";
import { TechBackground } from "@/components/TechBackground";

export const metadata = {
  title: "Learning Guides - SPEAK MVP",
  description: "Recursos estructurados para aprender inglés",
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-midnight p-6 relative overflow-hidden">
      <TechBackground />
      <BackgroundSprites />
      <div className="max-w-7xl mx-auto relative z-10 pt-4">
        <GuidesList />
      </div>
    </div>
  );
}
