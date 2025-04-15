
import { Operation, Employee, Machine, Project } from '@/context/OperationsContext';
import { toast } from "sonner";

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

// Flag to track first load and show errors appropriately
let isFirstLoad = true;

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

// Debug log function that doesn't log in production
const debugLog = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

// Function to fetch all data with retry mechanism
export const fetchData = async (retryCount = 3): Promise<AppData> => {
  let lastError: Error | null = null;
  
  // Try multiple times if needed
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      debugLog(`Fetching all data from API... (attempt ${attempt + 1}/${retryCount})`);
      
      const response = await fetch(`${API_URL}/data`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'same-origin' // Include cookies if any
      });
      
      debugLog(`API response status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`API Error: Status ${response.status}`);
        
        if (response.status === 404) {
          throw new Error(`API endpoint not found. Please check server configuration.`);
        } else {
          throw new Error(`HTTP error ${response.status}`);
        }
      }
      
      // Get response text for debugging
      const responseText = await response.text();
      debugLog(`Raw API response (first 100 chars): ${responseText.substring(0, 100)}...`);
      
      // Parse JSON from text
      let data: AppData;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      debugLog('Data received:', data);
      
      // Validate and normalize data structure
      const validatedData: AppData = {
        operations: Array.isArray(data.operations) ? parseDates(data.operations) : [],
        employees: Array.isArray(data.employees) ? data.employees : [],
        machines: Array.isArray(data.machines) ? data.machines : [],
        projects: Array.isArray(data.projects) ? data.projects : []
      };
      
      // Only show success toast on retry
      if (attempt > 0 && !isFirstLoad) {
        toast.success("Dane zostały załadowane", {
          description: "Połączenie z serwerem nawiązane pomyślnie"
        });
      }
      
      // Update cache
      dataCache = validatedData;
      isFirstLoad = false;
      return validatedData;
    } catch (error) {
      console.error(`Error fetching data (attempt ${attempt + 1}/${retryCount}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this wasn't the last attempt, wait before retrying
      if (attempt < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Wait longer on each retry
      }
    }
  }
  
  console.warn('All fetch attempts failed, using cached or default data');
  
  // Show error toast only if not first load (don't show on initial app load)
  if (!isFirstLoad) {
    toast.error("Błąd podczas ładowania danych", { 
      description: lastError?.message || "Nie udało się połączyć z serwerem"
    });
  }
  
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
  
  // After first load, subsequent failures should show errors
  isFirstLoad = false;
  
  // Return cached data on error
  return dataCache;
};

// Simple function to save all data with retry mechanism
export const saveData = async (data: AppData, retryCount = 3): Promise<boolean> => {
  let lastError: Error | null = null;
  
  // Make a deep copy of data to prevent race conditions
  const dataCopy = JSON.parse(JSON.stringify(data));
  
  // Try multiple times if needed
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      debugLog(`Saving all data to API... (attempt ${attempt + 1}/${retryCount})`, dataCopy);
      
      const response = await fetch(`${API_URL}/data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'same-origin', // Include cookies if any
        body: JSON.stringify(dataCopy)
      });
      
      debugLog(`API save response status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`API Error: Status ${response.status}`);
        
        if (response.status === 404) {
          throw new Error(`API endpoint not found. Please check server configuration.`);
        } else {
          throw new Error(`HTTP error ${response.status}`);
        }
      }
      
      // Get response text for debugging
      const responseText = await response.text();
      debugLog(`Raw API save response: ${responseText}`);
      
      // Parse response JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error on save response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      if (!responseData.success) {
        throw new Error('Server returned error: ' + (responseData.error || 'Unknown error'));
      }
      
      debugLog('Data saved successfully');
      
      // Only show success toast on retry
      if (attempt > 0) {
        toast.success("Dane zostały zapisane", {
          description: "Połączenie z serwerem nawiązane pomyślnie"
        });
      }
      
      // Update cache on successful save
      dataCache = dataCopy;
      return true;
    } catch (error) {
      console.error(`Error saving data (attempt ${attempt + 1}/${retryCount}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this wasn't the last attempt, wait before retrying
      if (attempt < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Wait longer on each retry
      }
    }
  }
  
  console.error('All save attempts failed');
  
  toast.error("Błąd podczas zapisywania danych", { 
    description: lastError?.message || "Nie udało się połączyć z serwerem" 
  });
  
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
