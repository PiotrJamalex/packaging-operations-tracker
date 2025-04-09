
import { Operation, Employee, Machine, Project } from '@/context/OperationsContext';

const API_URL = '/api';

// Struktura całej aplikacji
interface AppData {
  operations: Operation[];
  employees: Employee[];
  machines: Machine[];
  projects: Project[];
}

// Lokalna pamięć podręczna
let dataCache: AppData = {
  operations: [],
  employees: [],
  machines: [],
  projects: []
};

// Konwersja dat w operacjach
const parseDates = (operations: any[]): Operation[] => {
  return operations.map(op => ({
    ...op,
    startTime: new Date(op.startTime),
    endTime: new Date(op.endTime),
    createdAt: new Date(op.createdAt)
  }));
};

// Funkcja do pobierania wszystkich danych
export const fetchData = async (): Promise<AppData> => {
  try {
    console.log('Fetching all data from API...');
    const response = await fetch(`${API_URL}/data`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const text = await response.text();
    
    // Obsługa pustej odpowiedzi
    if (!text.trim()) {
      console.log('Empty response, using initial data structure');
      return dataCache;
    }
    
    try {
      const data = JSON.parse(text);
      console.log('Data received:', data);
      
      // Upewnij się, że dane mają prawidłową strukturę
      const validatedData: AppData = {
        operations: Array.isArray(data.operations) ? parseDates(data.operations) : [],
        employees: Array.isArray(data.employees) ? data.employees : [],
        machines: Array.isArray(data.machines) ? data.machines : [],
        projects: Array.isArray(data.projects) ? data.projects : []
      };
      
      dataCache = validatedData;
      return validatedData;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return dataCache;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return dataCache;
  }
};

// Funkcja do zapisywania wszystkich danych
export const saveData = async (data: AppData): Promise<boolean> => {
  try {
    console.log('Saving all data to API...', data);
    const response = await fetch(`${API_URL}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    console.log('Data saved successfully');
    dataCache = data;
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// Dotychczasowe funkcje dla kompatybilności
export const fetchOperations = async (): Promise<Operation[]> => {
  const data = await fetchData();
  return data.operations;
};

export const saveOperations = async (operations: Operation[]): Promise<boolean> => {
  dataCache.operations = operations;
  return saveData(dataCache);
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  const data = await fetchData();
  return data.employees;
};

export const saveEmployees = async (employees: Employee[]): Promise<boolean> => {
  dataCache.employees = employees;
  return saveData(dataCache);
};

export const fetchMachines = async (): Promise<Machine[]> => {
  const data = await fetchData();
  return data.machines;
};

export const saveMachines = async (machines: Machine[]): Promise<boolean> => {
  dataCache.machines = machines;
  return saveData(dataCache);
};

export const fetchProjects = async (): Promise<Project[]> => {
  const data = await fetchData();
  return data.projects;
};

export const saveProjects = async (projects: Project[]): Promise<boolean> => {
  dataCache.projects = projects;
  return saveData(dataCache);
};
