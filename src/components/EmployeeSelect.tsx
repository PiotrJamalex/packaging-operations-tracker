
import React from 'react';
import { Check, User, Plus, Settings } from "lucide-react";
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
import { useRouter } from 'react-router-dom';

interface EmployeeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({ value, onChange, className }) => {
  const { employees } = useOperations();
  const router = useRouter();

  const handleManage = () => {
    router.navigate('/zarzadzanie/pracownicy');
  };

  return (
    <FormField
      label="Pracownik"
      htmlFor="employee"
      className={className}
    >
      <div className="relative">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="employee" className="w-full focus:ring-2 focus:ring-primary/25">
            <SelectValue placeholder="Wybierz pracownika" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border border-border/50">
            <SelectGroup>
              <div className="flex items-center justify-between px-2 py-1.5">
                <SelectLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <User size={14} />
                  <span>Pracownicy produkcji</span>
                </SelectLabel>
                <Button variant="ghost" size="icon" onClick={handleManage} className="h-6 w-6">
                  <Settings size={14} className="text-muted-foreground" />
                </Button>
              </div>
              {employees.map((employee) => (
                <SelectItem 
                  key={employee.id} 
                  value={employee.id}
                  className="cursor-pointer transition-colors data-[highlighted]:bg-primary/10"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{employee.name}</span>
                    {value === employee.id && <Check size={16} className="text-primary" />}
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

export default EmployeeSelect;
