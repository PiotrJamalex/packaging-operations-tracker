
import React, { useState } from 'react';
import { Check, FileText, Plus, Settings, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import FormField from './FormField';
import { useOperations } from '@/context/OperationsContext';
import { useNavigate } from 'react-router-dom';

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ProjectSelect: React.FC<ProjectSelectProps> = ({ value, onChange, className }) => {
  const { projects, addProject } = useOperations();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  
  const handleManage = () => {
    navigate('/zarzadzanie/projekty');
  };

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
  };

  const handleAddCustomProject = () => {
    if (inputValue.trim()) {
      // Sprawdź, czy projekt już istnieje
      const projectExists = projects.some(p => p.name.toLowerCase() === inputValue.trim().toLowerCase());
      
      if (!projectExists) {
        // Dodaj nowy projekt
        addProject({ name: inputValue.trim() });
        // Użyj nowej wartości (nazwa projektu)
        onChange(inputValue.trim());
      } else {
        // Znajdź projekt i użyj jego ID
        const existingProject = projects.find(p => 
          p.name.toLowerCase() === inputValue.trim().toLowerCase()
        );
        if (existingProject) {
          onChange(existingProject.name);
        }
      }
      setOpen(false);
    }
  };

  return (
    <FormField
      label="Nazwa projektu"
      htmlFor="project"
      className={className}
    >
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between focus:ring-2 focus:ring-primary/25"
            >
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="truncate">
                  {value ? value : "Wybierz lub wprowadź projekt"}
                </span>
              </div>
              <div className="flex gap-1">
                {projects.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManage();
                    }}
                    className="h-6 w-6 ml-auto"
                  >
                    <Settings size={14} className="text-muted-foreground" />
                  </Button>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-sm border border-border/50">
            <Command>
              <CommandInput 
                placeholder="Szukaj lub wprowadź nowy projekt" 
                value={inputValue}
                onValueChange={setInputValue}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="flex flex-col items-center justify-center py-3">
                    <p className="text-sm text-muted-foreground mb-2">Brak wyników</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddCustomProject}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Dodaj {inputValue.trim()}</span>
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup heading="Projekty">
                  {projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => handleSelect(project.name)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>{project.name}</span>
                      {value === project.name && <Check size={16} className="text-primary" />}
                    </CommandItem>
                  ))}
                  {inputValue.trim() && 
                    !projects.some(p => p.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
                    <CommandItem 
                      value={`add-${inputValue.trim()}`}
                      onSelect={handleAddCustomProject}
                      className="flex items-center gap-2 border-t"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                      <span>Dodaj <span className="font-medium">{inputValue.trim()}</span></span>
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </FormField>
  );
};

export default ProjectSelect;
