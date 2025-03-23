
import React from 'react';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
  description?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  htmlFor, 
  className, 
  children,
  description
}) => {
  return (
    <div className={cn("space-y-2 animate-reveal", className)} style={{ animationDelay: '100ms' }}>
      <Label 
        htmlFor={htmlFor} 
        className="text-sm font-medium leading-none tracking-tight"
      >
        {label}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default FormField;
