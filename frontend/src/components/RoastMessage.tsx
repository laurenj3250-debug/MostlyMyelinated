interface RoastMessageProps {
  nodeName: string;
  strength: number;
}

export default function RoastMessage({ nodeName, strength }: RoastMessageProps) {
  // Generate roast message based on strength
  const generateRoast = () => {
    const roastTemplates = {
      brainDead: [
        `${nodeName} – ${strength}%. This node is clinically deceased. Time for CPR (Cramming, Practice, Repetition).`,
        `${nodeName} at ${strength}%? Even a lissencephalic brain has more wrinkles than your knowledge here.`,
        `${nodeName} – ${strength}%. The only thing flatter than this score is an EEG reading.`,
      ],
      lmnTetraplegic: [
        `${nodeName} – ${strength}%. The lower motor neurons are filing a formal complaint.`,
        `${nodeName} at ${strength}%? Non-ambulatory in every sense. Get this to physical therapy ASAP.`,
        `${nodeName} – ${strength}%. Even C6-T2 would be embarrassed by this level of dysfunction.`,
      ],
      nonAmbulatoryAtaxic: [
        `${nodeName} – ${strength}%. The vestibular system is crying. The inner ears have given up.`,
        `${nodeName} at ${strength}%? Proprioception has left the building.`,
        `${nodeName} – ${strength}%. This node is stumbling worse than cerebellar abiotrophy.`,
      ],
      ambulatoryAtaxic: [
        `${nodeName} – ${strength}%. Functional but wobbly. Like a Wobbler on a good day.`,
        `${nodeName} at ${strength}%? You can get there, but you're definitely weaving.`,
        `${nodeName} – ${strength}%. The CSF absorption is questionable at best.`,
      ],
      mildParesis: [
        `${nodeName} – ${strength}%. Compensating nicely, but don't get cocky.`,
        `${nodeName} at ${strength}%? Almost there. The neurologic exam is almost normal.`,
        `${nodeName} – ${strength}%. Subtle deficits remain. Keep pushing.`,
      ],
      barSubtle: [
        `${nodeName} – ${strength}%. BAR with only subtle deficits. You're almost a textbook case.`,
        `${nodeName} at ${strength}%? Looking good! Just a few proprioceptive deficits.`,
        `${nodeName} – ${strength}%. The attending would approve. Mostly.`,
      ],
      hyperreflexic: [
        `${nodeName} – ${strength}%. You could teach this to De Lahunta and he'd take notes.`,
        `${nodeName} at ${strength}%? Hyperreflexic professor status achieved. UMN excellence.`,
        `${nodeName} – ${strength}%. This is cortical overlord territory. Well done.`,
      ],
    };

    let templates: string[];
    if (strength < 20) templates = roastTemplates.brainDead;
    else if (strength < 40) templates = roastTemplates.lmnTetraplegic;
    else if (strength < 60) templates = roastTemplates.nonAmbulatoryAtaxic;
    else if (strength < 75) templates = roastTemplates.ambulatoryAtaxic;
    else if (strength < 85) templates = roastTemplates.mildParesis;
    else if (strength < 95) templates = roastTemplates.barSubtle;
    else templates = roastTemplates.hyperreflexic;

    // Return a random roast from the appropriate category
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const getBackgroundColor = () => {
    if (strength < 60) return 'bg-red-50 border-red-200 text-red-900';
    if (strength < 75) return 'bg-orange-50 border-orange-200 text-orange-900';
    if (strength < 85) return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    return 'bg-blue-50 border-blue-200 text-blue-900';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getBackgroundColor()} italic`}>
      <p className="text-sm font-medium">{generateRoast()}</p>
    </div>
  );
}
