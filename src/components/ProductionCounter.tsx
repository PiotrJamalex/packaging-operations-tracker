
import React from 'react';
import { Plus, Minus, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormField from './FormField';

interface ProductionCounterProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const ProductionCounter: React.FC<ProductionCounterProps> = ({ 
  value, 
  onChange, 
  className 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10) || 0;
    onChange(newValue >= 0 ? newValue : 0);
  };

  const increment = () => onChange(value + 1);
  const decrement = () => onChange(value > 0 ? value - 1 : 0);
  
  // Larger increment/decrement
  const incrementBy10 = () => onChange(value + 10);
  const decrementBy10 = () => onChange(value > 10 ? value - 10 : 0);

  return (
    <FormField
      label="Ilość sztuk"
      htmlFor="quantity"
      className={className}
      description="Liczba wyprodukowanych opakowań"
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="quantity"
            type="number"
            value={value}
            onChange={handleInputChange}
            className="pl-10 focus:ring-2 focus:ring-primary/25"
            min={0}
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={decrement}
              className="h-8 w-8 focus:ring-2 focus:ring-primary/25"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={increment}
              className="h-8 w-8 focus:ring-2 focus:ring-primary/25"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button 
              type="button" 
              variant="outline" 
              onClick={decrementBy10}
              className="h-6 px-2 text-xs focus:ring-2 focus:ring-primary/25"
            >
              -10
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={incrementBy10}
              className="h-6 px-2 text-xs focus:ring-2 focus:ring-primary/25"
            >
              +10
            </Button>
          </div>
        </div>
      </div>
    </FormField>
  );
};

export default ProductionCounter;
