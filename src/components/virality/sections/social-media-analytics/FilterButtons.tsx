
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
    <div className="flex flex-wrap gap-3 mb-8">
      <ShowDataFilter 
        showDataOptions={showDataOptions}
        selectedDataOptions={selectedDataOptions}
        showDataDropdownOpen={showDataDropdownOpen}
        setShowDataDropdownOpen={setShowDataDropdownOpen}
        toggleDataOption={toggleDataOption}
      />

      <Select>
        <SelectTrigger className="w-36 bg-transparent border border-gray-700 text-white">
          <SelectValue placeholder="Select Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="simple">Simple Mode</SelectItem>
          <SelectItem value="advanced">Advanced Mode</SelectItem>
          <SelectItem value="expert">Expert Mode</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-36 bg-transparent border-gray-700 text-white justify-between">
            More Action
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Export Data</DropdownMenuItem>
          <DropdownMenuItem>Share Report</DropdownMenuItem>
          <DropdownMenuItem>Schedule Analysis</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="newPurple" className="w-36 justify-between">
            Compare
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>With Previous Month</DropdownMenuItem>
          <DropdownMenuItem>With Competitors</DropdownMenuItem>
          <DropdownMenuItem>Industry Average</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterButtons;
