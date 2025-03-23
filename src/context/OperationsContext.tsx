
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";

export interface Operation {
  id: string;
  employee: string;
  machine: string;
  project?: string;
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

const STORAGE_KEY = 'production-operations';

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
  const [operations, setOperations] = useState<Operation[]>(() => {
    // Load operations from localStorage during initialization
    const savedOperations = localStorage.getItem(STORAGE_KEY);
    if (savedOperations) {
      try {
        // Convert dates back to Date objects
        const parsed = JSON.parse(savedOperations);
        return parsed.map((op: any) => ({
          ...op,
          startTime: new Date(op.startTime),
          endTime: new Date(op.endTime),
          createdAt: new Date(op.createdAt)
        }));
      } catch (error) {
        console.error('Error parsing saved operations:', error);
        return [];
      }
    }
    return [];
  });

  // Save operations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
  }, [operations]);

  const addOperation = (operation: Omit<Operation, 'id' | 'createdAt'>) => {
    const newOperation: Operation = {
      ...operation,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setOperations(prevOperations => {
      const updatedOperations = [...prevOperations, newOperation];
      return updatedOperations;
    });
    
    toast.success("Operacja została dodana", {
      description: `${operation.employee} wykonał(a) ${operation.quantity} sztuk na maszynie ${operation.machine}`,
    });
  };

  const clearOperations = () => {
    setOperations([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.info("Wszystkie operacje zostały usunięte");
  };

  return (
    <OperationsContext.Provider value={{ operations, addOperation, clearOperations }}>
      {children}
    </OperationsContext.Provider>
  );
};
