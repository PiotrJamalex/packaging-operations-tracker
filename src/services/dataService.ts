
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
    // Check if the response starts with HTML (suggesting it's not a valid JSON response)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('Received HTML instead of JSON:', text.substring(0, 100));
      return false;
    }
    
    // If empty, treat as empty array
    if (!text.trim()) {
      return true;
    }
    
    // Try to parse as JSON
    JSON.parse(text);
    return true;
  } catch (error) {
    console.error('Invalid JSON response:', error);
    return false;
  }
};

// Helper to safely parse JSON
const safelyParseJson = async (response: Response): Promise<any> => {
  const text = await response.text();
  if (!text.trim()) {
    return [];
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return [];
  }
};

export const fetchOperations = async (): Promise<Operation[]> => {
  try {
    console.log('Fetching operations from API...');
    const response = await fetch(`${API_URL}/operations`);
    console.log('Operations response status:', response.status);
    
    if (!response.ok) {
      console.error('Failed to fetch operations with status:', response.status);
      return operationsCache;
    }
    
    const isValidJson = await isValidJsonResponse(response.clone());
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
    const response = await fetch(`${API_URL}/operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operations)
    });
    
    console.log('Save operations response status:', response.status);
    if (!response.ok) {
      console.error('Failed to save operations with status:', response.status);
      return false;
    }
    
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
    const response = await fetch(`${API_URL}/employees`);
    console.log('Employees response status:', response.status);
    
    if (!response.ok) {
      console.error('Failed to fetch employees with status:', response.status);
      return employeesCache;
    }
    
    const isValidJson = await isValidJsonResponse(response.clone());
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
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employees)
    });
    
    console.log('Save employees response status:', response.status);
    if (!response.ok) {
      console.error('Failed to save employees with status:', response.status);
      return false;
    }
    
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
    const response = await fetch(`${API_URL}/machines`);
    console.log('Machines response status:', response.status);
    
    if (!response.ok) {
      console.error('Failed to fetch machines with status:', response.status);
      return machinesCache;
    }
    
    const isValidJson = await isValidJsonResponse(response.clone());
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
    const response = await fetch(`${API_URL}/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machines)
    });
    
    console.log('Save machines response status:', response.status);
    if (!response.ok) {
      console.error('Failed to save machines with status:', response.status);
      return false;
    }
    
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
    const response = await fetch(`${API_URL}/projects`);
    console.log('Projects response status:', response.status);
    
    if (!response.ok) {
      console.error('Failed to fetch projects with status:', response.status);
      return projectsCache;
    }
    
    const isValidJson = await isValidJsonResponse(response.clone());
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
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projects)
    });
    
    console.log('Save projects response status:', response.status);
    if (!response.ok) {
      console.error('Failed to save projects with status:', response.status);
      return false;
    }
    
    projectsCache = projects;
    return true;
  } catch (error) {
    console.error('Error saving projects:', error);
    return false;
  }
};
