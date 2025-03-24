
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

export interface Employee {
  id: string;
  name: string;
}

export interface Machine {
  id: string;
  name: string;
  icon?: string;
}

export interface Project {
  id: string;
  name: string;
}

interface OperationsContextType {
  operations: Operation[];
  employees: Employee[];
  machines: Machine[];
  projects: Project[];
  addOperation: (operation: Omit<Operation, 'id' | 'createdAt'>) => void;
  clearOperations: () => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  removeEmployee: (id: string) => void;
  addMachine: (machine: Omit<Machine, 'id'>) => void;
  removeMachine: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  removeProject: (id: string) => void;
  importProjects: (projects: Omit<Project, 'id'>[]) => void;
}

const STORAGE_KEY_OPERATIONS = 'production-operations';
const STORAGE_KEY_EMPLOYEES = 'production-employees';
const STORAGE_KEY_MACHINES = 'production-machines';
const STORAGE_KEY_PROJECTS = 'production-projects';

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

// Domyślni pracownicy
const defaultEmployees: Employee[] = [
  { id: "aneta", name: "Aneta" },
  { id: "ewa", name: "Ewa" },
  { id: "adam", name: "Adam" },
  { id: "piotr", name: "Piotr" },
];

// Domyślne maszyny
const defaultMachines: Machine[] = [
  { id: "drukarka", name: "Drukarka", icon: "printer" },
  { id: "autobox", name: "Autobox", icon: "package" },
  { id: "bigówka", name: "Bigówka", icon: "scissors" },
];

export const OperationsProvider: React.FC<OperationsProviderProps> = ({ children }) => {
  const [operations, setOperations] = useState<Operation[]>(() => {
    const savedOperations = localStorage.getItem(STORAGE_KEY_OPERATIONS);
    if (savedOperations) {
      try {
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

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const savedEmployees = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    if (savedEmployees) {
      try {
        return JSON.parse(savedEmployees);
      } catch (error) {
        console.error('Error parsing saved employees:', error);
        return defaultEmployees;
      }
    }
    return defaultEmployees;
  });

  const [machines, setMachines] = useState<Machine[]>(() => {
    const savedMachines = localStorage.getItem(STORAGE_KEY_MACHINES);
    if (savedMachines) {
      try {
        return JSON.parse(savedMachines);
      } catch (error) {
        console.error('Error parsing saved machines:', error);
        return defaultMachines;
      }
    }
    return defaultMachines;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (savedProjects) {
      try {
        return JSON.parse(savedProjects);
      } catch (error) {
        console.error('Error parsing saved projects:', error);
        return [];
      }
    }
    return [];
  });

  // Zapisz operacje do localStorage gdy się zmienią
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPERATIONS, JSON.stringify(operations));
  }, [operations]);

  // Zapisz pracowników do localStorage gdy się zmienią
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  // Zapisz maszyny do localStorage gdy się zmienią
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(machines));
  }, [machines]);

  // Zapisz projekty do localStorage gdy się zmienią
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);

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
    localStorage.removeItem(STORAGE_KEY_OPERATIONS);
    toast.info("Wszystkie operacje zostały usunięte");
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: employee.name.toLowerCase().replace(/\s+/g, '-'),
    };

    // Sprawdź czy pracownik o podanym ID już istnieje
    if (employees.some(emp => emp.id === newEmployee.id)) {
      toast.error("Pracownik o tej nazwie już istnieje");
      return;
    }

    setEmployees(prev => [...prev, newEmployee]);
    toast.success("Dodano nowego pracownika", {
      description: `${employee.name} został(a) dodany(a) do listy`
    });
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    toast.info("Pracownik został usunięty z listy");
  };

  const addMachine = (machine: Omit<Machine, 'id'>) => {
    const newMachine: Machine = {
      ...machine,
      id: machine.name.toLowerCase().replace(/\s+/g, '-'),
    };

    // Sprawdź czy maszyna o podanym ID już istnieje
    if (machines.some(m => m.id === newMachine.id)) {
      toast.error("Maszyna o tej nazwie już istnieje");
      return;
    }

    setMachines(prev => [...prev, newMachine]);
    toast.success("Dodano nową maszynę", {
      description: `${machine.name} została dodana do listy`
    });
  };

  const removeMachine = (id: string) => {
    setMachines(prev => prev.filter(machine => machine.id !== id));
    toast.info("Maszyna została usunięta z listy");
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };

    // Sprawdź czy projekt o podanej nazwie już istnieje
    if (projects.some(p => p.name === project.name)) {
      toast.error("Projekt o tej nazwie już istnieje");
      return;
    }

    setProjects(prev => [...prev, newProject]);
    toast.success("Dodano nowy projekt", {
      description: `${project.name} został dodany do listy`
    });
  };

  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    toast.info("Projekt został usunięty z listy");
  };

  const importProjects = (projectsToImport: Omit<Project, 'id'>[]) => {
    const newProjects = projectsToImport.map(project => ({
      ...project,
      id: Date.now() + Math.random().toString(36).substring(2, 9),
    }));

    setProjects(prev => {
      // Filtruj projekty, które już istnieją
      const filteredNewProjects = newProjects.filter(
        newProject => !prev.some(p => p.name === newProject.name)
      );

      if (filteredNewProjects.length !== newProjects.length) {
        toast.warning(`${newProjects.length - filteredNewProjects.length} projektów pominiętych - już istnieją`);
      }

      return [...prev, ...filteredNewProjects];
    });

    toast.success(`Zaimportowano ${newProjects.length} projektów`);
  };

  return (
    <OperationsContext.Provider value={{ 
      operations, 
      employees, 
      machines, 
      projects,
      addOperation, 
      clearOperations,
      addEmployee,
      removeEmployee,
      addMachine,
      removeMachine,
      addProject,
      removeProject,
      importProjects
    }}>
      {children}
    </OperationsContext.Provider>
  );
};
