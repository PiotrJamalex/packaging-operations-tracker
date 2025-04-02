import { Operation, Employee, Machine, Project } from '@/context/OperationsContext';

const API_URL = '/api';

// Local cache
let operationsCache: Operation[] = [];
let employeesCache: Employee[] = [];
let machinesCache: Machine[] = [];
let projectsCache: Project[] = [];

// Helper function to convert date strings back to Date objects
const parseDates = (operations: any[]): Operation[] => {
  return operations.map(op => ({
    ...op,
    startTime: new Date(op.startTime),
    endTime: new Date(op.endTime),
    createdAt: new Date(op.createdAt)
  }));
};

// Helper to check if the response is valid JSON
const isValidJsonResponse = async (response: Response): Promise<boolean> => {
  try {
    const text = await response.text();
    console.log('Response text:', text.substring(0, 100)); // Log beginning of response
    
    // Check if the response starts with HTML (suggesting it's not a valid JSON response)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('Received HTML instead of JSON:', text.substring(0, 100));
      return false;
    }
    
    // If empty, treat as empty array
    if (!text.trim()) {
      console.log('Empty response, treating as empty array');
      return true;
    }
    
    // Try to parse as JSON
    JSON.parse(text);
    console.log('Valid JSON response');
    return true;
  } catch (error) {
    console.error('Invalid JSON response:', error);
    return false;
  }
};

// Helper to safely parse JSON
const safelyParseJson = async (response: Response): Promise<any> => {
  try {
    const text = await response.text();
    console.log('Parsing JSON, text length:', text.length);
    
    if (!text.trim()) {
      console.log('Empty response, returning empty array');
      return [];
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return [];
  }
};

// Helper to fetch data with retry
const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3): Promise<Response> => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to fetch ${url}`);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        console.error(`Attempt ${i + 1} failed with status:`, response.status);
        lastError = new Error(`HTTP error ${response.status}`);
        continue;
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed with error:`, error);
      lastError = error;
    }
    
    // Wait before retrying (exponential backoff)
    if (i < retries - 1) {
      const delay = Math.pow(2, i) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts`);
};

export const fetchOperations = async (): Promise<Operation[]> => {
  try {
    console.log('Fetching operations from API...');
    const response = await fetchWithRetry(`${API_URL}/operations`);
    console.log('Operations response status:', response.status);
    
    const clone = response.clone();
    const isValidJson = await isValidJsonResponse(clone);
    if (!isValidJson) {
      console.error('Invalid JSON response for operations');
      return operationsCache;
    }
    
    const data = await safelyParseJson(response);
    console.log('Operations data received:', data);
    
    operationsCache = Array.isArray(data) ? parseDates(data) : [];
    return operationsCache;
  } catch (error) {
    console.error('Error fetching operations:', error);
    return operationsCache;
  }
};

export const saveOperations = async (operations: Operation[]): Promise<boolean> => {
  try {
    console.log('Saving operations to API...', operations);
    const response = await fetchWithRetry(`${API_URL}/operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operations)
    });
    
    console.log('Save operations response status:', response.status);
    operationsCache = operations;
    return true;
  } catch (error) {
    console.error('Error saving operations:', error);
    return false;
  }
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    console.log('Fetching employees from API...');
    const response = await fetchWithRetry(`${API_URL}/employees`);
    console.log('Employees response status:', response.status);
    
    const clone = response.clone();
    const isValidJson = await isValidJsonResponse(clone);
    if (!isValidJson) {
      console.error('Invalid JSON response for employees');
      return employeesCache;
    }
    
    const data = await safelyParseJson(response);
    console.log('Employees data received:', data);
    
    employeesCache = Array.isArray(data) ? data : [];
    return employeesCache;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return employeesCache;
  }
};

export const saveEmployees = async (employees: Employee[]): Promise<boolean> => {
  try {
    console.log('Saving employees to API...', employees);
    const response = await fetchWithRetry(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employees)
    });
    
    console.log('Save employees response status:', response.status);
    employeesCache = employees;
    return true;
  } catch (error) {
    console.error('Error saving employees:', error);
    return false;
  }
};

export const fetchMachines = async (): Promise<Machine[]> => {
  try {
    console.log('Fetching machines from API...');
    const response = await fetchWithRetry(`${API_URL}/machines`);
    console.log('Machines response status:', response.status);
    
    const clone = response.clone();
    const isValidJson = await isValidJsonResponse(clone);
    if (!isValidJson) {
      console.error('Invalid JSON response for machines');
      return machinesCache;
    }
    
    const data = await safelyParseJson(response);
    console.log('Machines data received:', data);
    
    machinesCache = Array.isArray(data) ? data : [];
    return machinesCache;
  } catch (error) {
    console.error('Error fetching machines:', error);
    return machinesCache;
  }
};

export const saveMachines = async (machines: Machine[]): Promise<boolean> => {
  try {
    console.log('Saving machines to API...', machines);
    const response = await fetchWithRetry(`${API_URL}/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machines)
    });
    
    console.log('Save machines response status:', response.status);
    machinesCache = machines;
    return true;
  } catch (error) {
    console.error('Error saving machines:', error);
    return false;
  }
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    console.log('Fetching projects from API...');
    const response = await fetchWithRetry(`${API_URL}/projects`);
    console.log('Projects response status:', response.status);
    
    const clone = response.clone();
    const isValidJson = await isValidJsonResponse(clone);
    if (!isValidJson) {
      console.error('Invalid JSON response for projects');
      return projectsCache;
    }
    
    const data = await safelyParseJson(response);
    console.log('Projects data received:', data);
    
    projectsCache = Array.isArray(data) ? data : [];
    return projectsCache;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return projectsCache;
  }
};

export const saveProjects = async (projects: Project[]): Promise<boolean> => {
  try {
    console.log('Saving projects to API...', projects);
    const response = await fetchWithRetry(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projects)
    });
    
    console.log('Save projects response status:', response.status);
    projectsCache = projects;
    return true;
  } catch (error) {
    console.error('Error saving projects:', error);
    return false;
  }
};
