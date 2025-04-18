
import React from 'react';
import { Check, Printer, Package, Scissors, Settings } from "lucide-react";
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
import { useOperations } from '@/context/OperationsContext';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface OperationSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'printer':
      return <Printer size={14} />;
    case 'package':
      return <Package size={14} />;
    case 'scissors':
      return <Scissors size={14} />;
    default:
      return <Package size={14} />;
  }
};

const OperationSelect: React.FC<OperationSelectProps> = ({ value, onChange, className }) => {
  const { machines } = useOperations();
  const navigate = useNavigate();

  const handleManage = () => {
    navigate('/zarzadzanie/maszyny');
  };

  return (
    <FormField
      label="Operacja"
      htmlFor="machine"
      className={className}
    >
      <div className="relative">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="machine" className="w-full focus:ring-2 focus:ring-primary/25">
            <SelectValue placeholder="Wybierz operację" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border border-border/50">
            <SelectGroup>
              <div className="flex items-center justify-between px-2 py-1.5">
                <SelectLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>Dostępne operacje</span>
                </SelectLabel>
                <Button variant="ghost" size="icon" onClick={handleManage} className="h-6 w-6">
                  <Settings size={14} className="text-muted-foreground" />
                </Button>
              </div>
              {machines.map((machine) => (
                <SelectItem 
                  key={machine.id} 
                  value={machine.id}
                  className="cursor-pointer transition-colors data-[highlighted]:bg-primary/10"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {getIconComponent(machine.icon)}
                      <span>{machine.name}</span>
                    </div>
                    {value === machine.id && <Check size={16} className="text-primary" />}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </FormField>
  );
};

export default OperationSelect;
