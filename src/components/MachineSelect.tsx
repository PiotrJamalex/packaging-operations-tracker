
import React from 'react';
import { Check, Printer, Package, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormField from './FormField';

const machines = [
  { id: "drukarka", name: "Drukarka", icon: <Printer size={14} /> },
  { id: "autobox", name: "Autobox", icon: <Package size={14} /> },
  { id: "bigówka", name: "Bigówka", icon: <Scissors size={14} /> },
];

interface MachineSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const MachineSelect: React.FC<MachineSelectProps> = ({ value, onChange, className }) => {
  return (
    <FormField
      label="Maszyna"
      htmlFor="machine"
      className={className}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="machine" className="w-full focus:ring-2 focus:ring-primary/25">
          <SelectValue placeholder="Wybierz maszynę" />
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-sm border border-border/50">
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Dostępne maszyny</span>
            </SelectLabel>
            {machines.map((machine) => (
              <SelectItem 
                key={machine.id} 
                value={machine.id}
                className="cursor-pointer transition-colors data-[highlighted]:bg-primary/10"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {machine.icon}
                    <span>{machine.name}</span>
                  </div>
                  {value === machine.id && <Check size={16} className="text-primary" />}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default MachineSelect;
