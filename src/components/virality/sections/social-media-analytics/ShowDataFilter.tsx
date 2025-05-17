
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    <DropdownMenu open={showDataDropdownOpen} onOpenChange={setShowDataDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-40 bg-transparent border border-gray-700 text-white justify-between">
          Show Data
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700">
        {showDataOptions.map((option) => (
          <DropdownMenuItem 
            key={option}
            className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
            onSelect={(e) => {
              e.preventDefault(); // Prevent menu from closing
              toggleDataOption(option);
            }}
          >
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`checkbox-${option.replace(/\s+/g, '-').toLowerCase()}`}
                checked={selectedDataOptions.includes(option)}
                onCheckedChange={() => toggleDataOption(option)}
                className="data-[state=checked]:bg-purple-600 border-gray-500"
              />
              <Label htmlFor={`checkbox-${option.replace(/\s+/g, '-').toLowerCase()}`} className="text-white cursor-pointer">
                {option}
              </Label>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShowDataFilter;
