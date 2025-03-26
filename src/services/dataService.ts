
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

export const fetchOperations = async (): Promise<Operation[]> => {
  try {
    console.log('Fetching operations from API...');
    const response = await fetch(`${API_URL}/operations`);
    console.log('Operations response status:', response.status);
    
    if (!response.ok) throw new Error('Failed to fetch operations');
    
    const data = await response.json();
    console.log('Operations data received:', data);
    
    operationsCache = parseDates(data);
    return operationsCache;
  } catch (error) {
    console.error('Error fetching operations:', error);
    return [];
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
    if (!response.ok) throw new Error('Failed to save operations');
    
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
    
    if (!response.ok) throw new Error('Failed to fetch employees');
    
    const data = await response.json();
    console.log('Employees data received:', data);
    
    employeesCache = data;
    return employeesCache;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
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
    if (!response.ok) throw new Error('Failed to save employees');
    
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
    
    if (!response.ok) throw new Error('Failed to fetch machines');
    
    const data = await response.json();
    console.log('Machines data received:', data);
    
    machinesCache = data;
    return machinesCache;
  } catch (error) {
    console.error('Error fetching machines:', error);
    return [];
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
    if (!response.ok) throw new Error('Failed to save machines');
    
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
    
    if (!response.ok) throw new Error('Failed to fetch projects');
    
    const data = await response.json();
    console.log('Projects data received:', data);
    
    projectsCache = data;
    return projectsCache;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
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
    if (!response.ok) throw new Error('Failed to save projects');
    
    projectsCache = projects;
    return true;
  } catch (error) {
    console.error('Error saving projects:', error);
    return false;
  }
};
