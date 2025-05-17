
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
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
  return (
    <DropdownMenu 
      open={showDataDropdownOpen}
      onOpenChange={setShowDataDropdownOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button 
          variant="newPurple" 
          className="w-full sm:w-auto text-white justify-between"
        >
          Show Data
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-gray-700">
        {showDataOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selectedDataOptions.includes(option)}
            onCheckedChange={() => toggleDataOption(option)}
            className="hover:bg-purple-600/20 flex items-center"
          >
            <div className="flex items-center">
              <div className={`h-4 w-4 mr-2 flex items-center justify-center rounded-sm border ${selectedDataOptions.includes(option) ? 'bg-[#8c52ff] border-[#8c52ff]' : 'border-gray-500'}`}>
                {selectedDataOptions.includes(option) && <Check className="h-3 w-3 text-white" />}
              </div>
              {option}
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShowDataFilter;
