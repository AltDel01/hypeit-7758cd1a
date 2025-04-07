
import React from 'react';
import ActionCard, { ActionCardProps } from './ActionCard';
import { 
  Image, 
  MessageSquare, 
  FileText, 
  TrendingUp
} from 'lucide-react';

const QuickActions = () => {
  const actionCards: Omit<ActionCardProps, 'onClick'>[] = [
    {
      title: "Generate Images", 
      description: "Create social media visuals",
      icon: <Image className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Write Captions", 
      description: "Craft engaging social media text",
      icon: <MessageSquare className="h-5 w-5 text-[#8c52ff]" />,
    },
    {
      title: "Build Moodboard", 
      description: "Design your brand identity",
      icon: <FileText className="h-5 w-5 text-amber-500" />,
    },
    {
      title: "Create Strategy", 
      description: "Plan your social media approach",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      disabled: true,
      upgradeBadge: true,
    }
  ];

  const handleAction = (title: string) => {
    console.log(`Navigate to ${title}`);
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Create Something New</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actionCards.map((card, index) => (
          <ActionCard
            key={index}
            {...card}
            onClick={() => handleAction(card.title)}
          />
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
