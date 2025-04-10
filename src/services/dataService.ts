
import { Operation, Employee, Machine, Project } from '@/context/OperationsContext';

const API_URL = '/api';

// Application data structure
interface AppData {
  operations: Operation[];
  employees: Employee[];
  machines: Machine[];
  projects: Project[];
}

// Local cache to prevent data loss during API errors
let dataCache: AppData = {
  operations: [],
  employees: [],
  machines: [],
  projects: []
};

// Convert dates in operations
const parseDates = (operations: any[]): Operation[] => {
  return operations.map(op => ({
    ...op,
    startTime: new Date(op.startTime),
    endTime: new Date(op.endTime),
    createdAt: new Date(op.createdAt)
  }));
};

// Simple function to fetch all data
export const fetchData = async (): Promise<AppData> => {
  try {
    console.log('Fetching all data from API...');
    const response = await fetch(`${API_URL}/data`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Data received:', data);
    
    // Validate and normalize data structure
    const validatedData: AppData = {
      operations: Array.isArray(data.operations) ? parseDates(data.operations) : [],
      employees: Array.isArray(data.employees) ? data.employees : [],
      machines: Array.isArray(data.machines) ? data.machines : [],
      projects: Array.isArray(data.projects) ? data.projects : []
    };
    
    // Update cache
    dataCache = validatedData;
    return validatedData;
  } catch (error) {
    console.error('Error fetching data:', error);
    // Return cached data on error
    return dataCache;
  }
};

// Simple function to save all data
export const saveData = async (data: AppData): Promise<boolean> => {
  try {
    console.log('Saving all data to API...', data);
    const response = await fetch(`${API_URL}/data`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    console.log('Data saved successfully');
    // Update cache on successful save
    dataCache = data;
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// Legacy functions for compatibility
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
