
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShowDataFilterProps {
  showDataOptions: string[];
  selectedDataOptions: string[];
  showDataDropdownOpen: boolean;
  setShowDataDropdownOpen: (isOpen: boolean) => void;
  toggleDataOption: (option: string) => void;
}

const ShowDataFilter: React.FC<ShowDataFilterProps> = ({
  showDataOptions,
  selectedDataOptions,
  showDataDropdownOpen,
  setShowDataDropdownOpen,
  toggleDataOption
}) => {
  // This handler prevents the dropdown from closing when clicking on checkboxes or labels
  const handleOptionClick = (e: React.MouseEvent, option: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDataOption(option);
  };

  return (
    <DropdownMenu 
      open={showDataDropdownOpen}
      onOpenChange={setShowDataDropdownOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-full sm:w-auto text-white justify-between border border-purple-500/30 hover:bg-purple-600/20 focus:ring-purple-600 ${showDataDropdownOpen ? 'bg-[#8c52ff]' : 'bg-transparent'}`}
        >
          Show Data
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-purple-500/30">
        {showDataOptions.map((option) => (
          <div 
            key={option} 
            className="flex items-center hover:bg-purple-600/20 px-2 py-1.5 rounded-sm cursor-pointer"
            onClick={(e) => handleOptionClick(e, option)}
          >
            <Checkbox 
              id={`option-${option}`}
              checked={selectedDataOptions.includes(option)} 
              className="mr-2"
              onCheckedChange={() => toggleDataOption(option)}
              onClick={(e) => e.stopPropagation()}
            />
            <label 
              htmlFor={`option-${option}`} 
              className="text-sm cursor-pointer flex-grow"
              onClick={(e) => e.preventDefault()}
            >
              {option}
            </label>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShowDataFilter;
