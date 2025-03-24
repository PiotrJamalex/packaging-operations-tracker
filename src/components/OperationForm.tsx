
import React, { useState, useEffect } from 'react';
import { useOperations } from '@/context/OperationsContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, RotateCcw, CheckCircle2 } from "lucide-react";
import EmployeeSelect from './EmployeeSelect';
import MachineSelect from './MachineSelect';
import DateTimeField from './DateTimeField';
import ProductionCounter from './ProductionCounter';
import ProjectSelect from './ProjectSelect';

const OperationForm: React.FC = () => {
  const { addOperation } = useOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee: "",
    machine: "",
    project: "",
    startTime: undefined as Date | undefined,
    endTime: undefined as Date | undefined,
    quantity: 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate duration whenever startTime or endTime changes
  const [duration, setDuration] = useState<string>("");
  
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const diff = formData.endTime.getTime() - formData.startTime.getTime();
      
      if (diff < 0) {
        setDuration("Błąd: czas zakończenia wcześniejszy niż rozpoczęcia");
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setDuration(`${hours}h ${minutes}m`);
    } else {
      setDuration("");
    }
  }, [formData.startTime, formData.endTime]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.employee) newErrors.employee = "Wybierz pracownika";
    if (!formData.machine) newErrors.machine = "Wybierz maszynę";
    if (!formData.project) newErrors.project = "Wprowadź nazwę projektu";
    if (!formData.startTime) newErrors.startTime = "Wybierz datę i czas rozpoczęcia";
    if (!formData.endTime) newErrors.endTime = "Wybierz datę i czas zakończenia";
    if (formData.quantity <= 0) newErrors.quantity = "Ilość musi być większa od 0";
    
    if (formData.startTime && formData.endTime && formData.endTime < formData.startTime) {
      newErrors.endTime = "Czas zakończenia nie może być wcześniejszy niż rozpoczęcia";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Formularz zawiera błędy", {
        description: "Sprawdź wszystkie pola i spróbuj ponownie",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (formData.startTime && formData.endTime) {
        addOperation({
          employee: formData.employee,
          machine: formData.machine,
          project: formData.project,
          startTime: formData.startTime,
          endTime: formData.endTime,
          quantity: formData.quantity,
        });
        
        // Reset form
        setFormData({
          employee: "",
          machine: "",
          project: "",
          startTime: undefined,
          endTime: undefined,
          quantity: 0,
        });
        
        setErrors({});
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Wystąpił błąd", {
        description: "Nie udało się zapisać operacji. Spróbuj ponownie.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      employee: "",
      machine: "",
      project: "",
      startTime: undefined,
      endTime: undefined,
      quantity: 0,
    });
    setErrors({});
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-subtle border border-border/50 overflow-hidden bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="text-xl font-medium tracking-tight flex items-center gap-2">
          <span className="inline-block p-1.5 rounded-full bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </span>
          Rejestracja operacji produkcyjnej
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmployeeSelect 
              value={formData.employee}
              onChange={(value) => {
                setFormData({...formData, employee: value});
                if (errors.employee) setErrors({...errors, employee: ""});
              }}
              className={errors.employee ? "border-destructive" : ""}
            />
            
            <MachineSelect 
              value={formData.machine}
              onChange={(value) => {
                setFormData({...formData, machine: value});
                if (errors.machine) setErrors({...errors, machine: ""});
              }}
              className={errors.machine ? "border-destructive" : ""}
            />
          </div>
          
          <ProjectSelect
            value={formData.project}
            onChange={(value) => {
              setFormData({...formData, project: value});
              if (errors.project) setErrors({...errors, project: ""});
            }}
            className={errors.project ? "border-destructive" : ""}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DateTimeField
              label="Czas rozpoczęcia"
              id="startTime"
              value={formData.startTime}
              onChange={(date) => {
                setFormData({...formData, startTime: date});
                if (errors.startTime) setErrors({...errors, startTime: ""});
              }}
              className={errors.startTime ? "border-destructive" : ""}
            />
            
            <DateTimeField
              label="Czas zakończenia"
              id="endTime"
              value={formData.endTime}
              onChange={(date) => {
                setFormData({...formData, endTime: date});
                if (errors.endTime) setErrors({...errors, endTime: ""});
              }}
              className={errors.endTime ? "border-destructive" : ""}
              minDate={formData.startTime}
            />
          </div>
          
          {duration && (
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50 flex items-center justify-center animate-reveal">
              <Label className="text-sm text-center">
                <span className="text-muted-foreground mr-2">Czas trwania operacji:</span>
                <span className="font-semibold">{duration}</span>
              </Label>
            </div>
          )}
          
          <ProductionCounter
            value={formData.quantity}
            onChange={(value) => {
              setFormData({...formData, quantity: value});
              if (errors.quantity) setErrors({...errors, quantity: ""});
            }}
            className={errors.quantity ? "border-destructive" : ""}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between gap-4 pt-2 pb-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
            className="flex-1 gap-2 focus:ring-2 focus:ring-primary/25"
            disabled={isSubmitting}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Wyczyść</span>
          </Button>
          
          <Button 
            type="submit" 
            className="flex-1 gap-2 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/25"
            disabled={isSubmitting}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Zapisz operację</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OperationForm;
