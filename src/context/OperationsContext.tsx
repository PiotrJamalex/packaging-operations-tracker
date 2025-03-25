
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";
import {
  fetchOperations,
  saveOperations,
  fetchEmployees,
  saveEmployees,
  fetchMachines,
  saveMachines,
  fetchProjects,
  saveProjects
} from '@/services/dataService';

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
  loading: boolean;
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Załaduj dane z serwera przy pierwszym renderowaniu
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Załaduj operacje
        const fetchedOperations = await fetchOperations();
        setOperations(fetchedOperations);

        // Załaduj pracowników lub użyj domyślnych
        const fetchedEmployees = await fetchEmployees();
        setEmployees(fetchedEmployees.length > 0 ? fetchedEmployees : defaultEmployees);

        // Załaduj maszyny lub użyj domyślnych
        const fetchedMachines = await fetchMachines();
        setMachines(fetchedMachines.length > 0 ? fetchedMachines : defaultMachines);

        // Załaduj projekty
        const fetchedProjects = await fetchProjects();
        setProjects(fetchedProjects);

        // Jeśli to pierwszy start aplikacji, zapisz domyślne dane
        if (fetchedEmployees.length === 0) {
          await saveEmployees(defaultEmployees);
        }
        if (fetchedMachines.length === 0) {
          await saveMachines(defaultMachines);
        }

        setInitialized(true);
      } catch (error) {
        console.error("Błąd podczas ładowania danych:", error);
        toast.error("Błąd podczas ładowania danych", {
          description: "Spróbuj odświeżyć stronę"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Zapisz operacje do serwera gdy się zmienią
  useEffect(() => {
    if (initialized && operations.length >= 0) {
      saveOperations(operations).catch(error => {
        console.error("Błąd podczas zapisywania operacji:", error);
        toast.error("Błąd podczas zapisywania operacji", {
          description: "Zmiany mogą nie zostać zapisane"
        });
      });
    }
  }, [operations, initialized]);

  // Zapisz pracowników do serwera gdy się zmienią
  useEffect(() => {
    if (initialized && employees.length > 0) {
      saveEmployees(employees).catch(error => {
        console.error("Błąd podczas zapisywania pracowników:", error);
        toast.error("Błąd podczas zapisywania pracowników", {
          description: "Zmiany mogą nie zostać zapisane"
        });
      });
    }
  }, [employees, initialized]);

  // Zapisz maszyny do serwera gdy się zmienią
  useEffect(() => {
    if (initialized && machines.length > 0) {
      saveMachines(machines).catch(error => {
        console.error("Błąd podczas zapisywania maszyn:", error);
        toast.error("Błąd podczas zapisywania maszyn", {
          description: "Zmiany mogą nie zostać zapisane"
        });
      });
    }
  }, [machines, initialized]);

  // Zapisz projekty do serwera gdy się zmienią
  useEffect(() => {
    if (initialized && projects.length >= 0) {
      saveProjects(projects).catch(error => {
        console.error("Błąd podczas zapisywania projektów:", error);
        toast.error("Błąd podczas zapisywania projektów", {
          description: "Zmiany mogą nie zostać zapisane"
        });
      });
    }
  }, [projects, initialized]);

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
      importProjects,
      loading
    }}>
      {children}
    </OperationsContext.Provider>
  );
};
