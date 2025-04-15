
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
  if (!operations || !Array.isArray(operations)) return [];
  
  return operations.map(op => ({
    ...op,
    startTime: op.startTime ? new Date(op.startTime) : new Date(),
    endTime: op.endTime ? new Date(op.endTime) : new Date(),
    createdAt: op.createdAt ? new Date(op.createdAt) : new Date()
  }));
};

// Function to fetch all data with retry mechanism
export const fetchData = async (retryCount = 3): Promise<AppData> => {
  let lastError: Error | null = null;
  
  // Try multiple times if needed
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      console.log(`Fetching all data from API... (attempt ${attempt + 1}/${retryCount})`);
      const response = await fetch(`${API_URL}/data`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.error(`API Error: Status ${response.status}`);
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type, expected JSON but got:', contentType);
        // If we're not on the last attempt, try again
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retrying
          continue;
        }
        throw new Error('Invalid content type, expected JSON');
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
      console.error(`Error fetching data (attempt ${attempt + 1}/${retryCount}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this wasn't the last attempt, wait before retrying
      if (attempt < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }
  
  console.warn('All fetch attempts failed, using cached or default data');
  
  // If cache is empty, use default data
  if (dataCache.employees.length === 0) {
    dataCache = {
      operations: [],
      employees: [
        { id: "aneta", name: "Aneta" },
        { id: "ewa", name: "Ewa" },
        { id: "adam", name: "Adam" },
        { id: "piotr", name: "Piotr" }
      ],
      machines: [
        { id: "drukarka", name: "Drukarka", icon: "printer" },
        { id: "autobox", name: "Autobox", icon: "package" },
        { id: "bigówka", name: "Bigówka", icon: "scissors" }
      ],
      projects: []
    };
  }
  
  // Return cached data on error
  return dataCache;
};

// Simple function to save all data with retry mechanism
export const saveData = async (data: AppData, retryCount = 3): Promise<boolean> => {
  let lastError: Error | null = null;
  
  // Try multiple times if needed
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      console.log(`Saving all data to API... (attempt ${attempt + 1}/${retryCount})`, data);
      const response = await fetch(`${API_URL}/data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        console.error(`API Error: Status ${response.status}`);
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // Check for proper JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type, expected JSON but got:', contentType);
        // If we're not on the last attempt, try again
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retrying
          continue;
        }
        throw new Error('Invalid content type, expected JSON');
      }
      
      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error('Server returned error: ' + (responseData.error || 'Unknown error'));
      }
      
      console.log('Data saved successfully');
      // Update cache on successful save
      dataCache = data;
      return true;
    } catch (error) {
      console.error(`Error saving data (attempt ${attempt + 1}/${retryCount}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this wasn't the last attempt, wait before retrying
      if (attempt < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }
  
  console.error('All save attempts failed');
  return false;
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
