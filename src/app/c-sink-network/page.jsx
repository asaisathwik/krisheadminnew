"use client";
import ArtisanProSection from "./sections/ArtisanProSection";
import BioCharProducerSection from "./sections/BioCharProducerSection";
import SupervisorSection from "./sections/SupervisorSection";
import FarmSection from "./sections/FarmSection";
import KontikkiSection from "./sections/KontikkiSection";
import TrainingsSection from "./sections/TrainingsSection";

export default function CSinkNetworkPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Page header */}
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
            C-Sink Network
          </h1>
        </header>

        <div className="space-y-4">
          <ArtisanProSection />
          <SupervisorSection />
          <BioCharProducerSection />
          
          <FarmSection />
          <KontikkiSection />
          <TrainingsSection />
        </div>
      </div>
    </div>
  );
}
