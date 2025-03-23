
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from "sonner";

export interface Operation {
  id: string;
  employee: string;
  machine: string;
  startTime: Date;
  endTime: Date;
  quantity: number;
  createdAt: Date;
}

interface OperationsContextType {
  operations: Operation[];
  addOperation: (operation: Omit<Operation, 'id' | 'createdAt'>) => void;
  clearOperations: () => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};

interface OperationsProviderProps {
  children: ReactNode;
}

export const OperationsProvider: React.FC<OperationsProviderProps> = ({ children }) => {
  const [operations, setOperations] = useState<Operation[]>([]);

  const addOperation = (operation: Omit<Operation, 'id' | 'createdAt'>) => {
    const newOperation: Operation = {
      ...operation,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setOperations([...operations, newOperation]);
    toast.success("Operacja została dodana", {
      description: `${operation.employee} wykonał(a) ${operation.quantity} sztuk na maszynie ${operation.machine}`,
    });
  };

  const clearOperations = () => {
    setOperations([]);
    toast.info("Wszystkie operacje zostały usunięte");
  };

  return (
    <OperationsContext.Provider value={{ operations, addOperation, clearOperations }}>
      {children}
    </OperationsContext.Provider>
  );
};
