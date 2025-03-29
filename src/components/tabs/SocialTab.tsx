
import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";

interface SocialTabProps {
  value: string;
  icon: React.ReactNode;
  label: string;
}

const SocialTab = ({ value, icon, label }: SocialTabProps) => {
  return (
    <TabsTrigger 
      value={value}
      className="flex items-center gap-2 py-2 data-[state=active]:bg-gray-800"
    >
      {icon}
      {label ? <span>{label}</span> : null}
    </TabsTrigger>
  );
};

export default SocialTab;
