
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShowDataFilter from './ShowDataFilter';

interface FilterButtonsProps {
  showDataOptions: string[];
  selectedDataOptions: string[];
  showDataDropdownOpen: boolean;
  setShowDataDropdownOpen: (isOpen: boolean) => void;
  toggleDataOption: (option: string) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  showDataOptions,
  selectedDataOptions,
  showDataDropdownOpen,
  setShowDataDropdownOpen,
  toggleDataOption
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-2 sm:gap-3 mb-6 md:mb-8">
      <ShowDataFilter 
        showDataOptions={showDataOptions}
        selectedDataOptions={selectedDataOptions}
        showDataDropdownOpen={showDataDropdownOpen}
        setShowDataDropdownOpen={setShowDataDropdownOpen}
        toggleDataOption={toggleDataOption}
      />

      <Select>
        <SelectTrigger className="w-full sm:w-auto bg-transparent border border-purple-500/30 text-white focus:ring-purple-600 hover:bg-purple-600/20">
          <SelectValue placeholder="Select Mode" />
        </SelectTrigger>
        <SelectContent className="bg-background/95 backdrop-blur-sm border border-purple-500/30">
          <SelectItem value="simple" className="hover:bg-purple-600/20">Simple Mode</SelectItem>
          <SelectItem value="advanced" className="hover:bg-purple-600/20">Advanced Mode</SelectItem>
          <SelectItem value="expert" className="hover:bg-purple-600/20">Expert Mode</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto bg-transparent border border-purple-500/30 text-white justify-between hover:bg-purple-600/20"
          >
            More Action
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-purple-500/30">
          <DropdownMenuItem className="hover:bg-purple-600/20">Export Data</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-purple-600/20">Share Report</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-purple-600/20">Schedule Analysis</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterButtons;
