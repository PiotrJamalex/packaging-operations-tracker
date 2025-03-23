
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2, SortAsc, SortDesc, Search } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useOperations, Operation } from '@/context/OperationsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OperationsStats from '@/components/OperationsStats';

type SortField = 'employee' | 'machine' | 'project' | 'startTime' | 'endTime' | 'quantity';
type SortOrder = 'asc' | 'desc';

const History = () => {
  const { operations } = useOperations();
  const [sortField, setSortField] = useState<SortField>('startTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('');

  const uniqueEmployees = useMemo(() => {
    const employees = operations.map(op => op.employee);
    return ['all', ...Array.from(new Set(employees))];
  }, [operations]);

  const uniqueMachines = useMemo(() => {
    const machines = operations.map(op => op.machine);
    return ['all', ...Array.from(new Set(machines))];
  }, [operations]);

  const uniqueProjects = useMemo(() => {
    const projects = operations.map(op => op.project).filter(Boolean);
    return Array.from(new Set(projects));
  }, [operations]);

  const sortedAndFilteredOperations = useMemo(() => {
    return [...operations]
      .filter(op => employeeFilter === 'all' || op.employee === employeeFilter)
      .filter(op => machineFilter === 'all' || op.machine === machineFilter)
      .filter(op => !projectFilter || (op.project && op.project.toLowerCase().includes(projectFilter.toLowerCase())))
      .sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'employee') {
          comparison = a.employee.localeCompare(b.employee);
        } else if (sortField === 'machine') {
          comparison = a.machine.localeCompare(b.machine);
        } else if (sortField === 'project') {
          comparison = (a.project || '').localeCompare(b.project || '');
        } else if (sortField === 'startTime') {
          comparison = a.startTime.getTime() - b.startTime.getTime();
        } else if (sortField === 'endTime') {
          comparison = a.endTime.getTime() - b.endTime.getTime();
        } else if (sortField === 'quantity') {
          comparison = a.quantity - b.quantity;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [operations, sortField, sortOrder, employeeFilter, machineFilter, projectFilter]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, 'dd MMM yyyy HH:mm', { locale: pl });
  };

  const calculateDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
  };

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) return <SortAsc className="ml-1 h-4 w-4 opacity-30" />;
    return sortOrder === 'asc' ? 
      <SortAsc className="ml-1 h-4 w-4" /> : 
      <SortDesc className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50 p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              Historia operacji
            </h1>
            <p className="text-muted-foreground">
              Przeglądaj i analizuj zapisane operacje produkcyjne
            </p>
          </div>
        </header>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="history">Historia</TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span>Statystyki</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
              <div>
                <label htmlFor="employeeFilter" className="text-sm font-medium block mb-1">
                  Pracownik
                </label>
                <select
                  id="employeeFilter"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-input rounded-md w-full max-w-[200px]"
                >
                  {uniqueEmployees.map(employee => (
                    <option key={employee} value={employee}>
                      {employee === 'all' ? 'Wszyscy' : employee}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="machineFilter" className="text-sm font-medium block mb-1">
                  Maszyna
                </label>
                <select
                  id="machineFilter"
                  value={machineFilter}
                  onChange={(e) => setMachineFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-input rounded-md w-full max-w-[200px]"
                >
                  {uniqueMachines.map(machine => (
                    <option key={machine} value={machine}>
                      {machine === 'all' ? 'Wszystkie' : machine}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="projectFilter" className="text-sm font-medium block mb-1">
                  Projekt
                </label>
                <div className="relative max-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="projectFilter"
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    placeholder="Wyszukaj projekt..."
                    className="pl-10 focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>
            </div>
            
            <div className="rounded-md border shadow-sm bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="w-[150px] cursor-pointer"
                      onClick={() => handleSort('employee')}
                    >
                      <div className="flex items-center">
                        Pracownik {renderSortIcon('employee')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="w-[150px] cursor-pointer"
                      onClick={() => handleSort('machine')}
                    >
                      <div className="flex items-center">
                        Maszyna {renderSortIcon('machine')}
                      </div>
                    </TableHead>

                    <TableHead 
                      className="w-[150px] cursor-pointer"
                      onClick={() => handleSort('project')}
                    >
                      <div className="flex items-center">
                        Projekt {renderSortIcon('project')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('startTime')}
                    >
                      <div className="flex items-center">
                        Początek {renderSortIcon('startTime')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('endTime')}
                    >
                      <div className="flex items-center">
                        Koniec {renderSortIcon('endTime')}
                      </div>
                    </TableHead>
                    
                    <TableHead>Czas trwania</TableHead>
                    
                    <TableHead 
                      className="text-right cursor-pointer"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center justify-end">
                        Ilość {renderSortIcon('quantity')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {sortedAndFilteredOperations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                        Brak zarejestrowanych operacji
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedAndFilteredOperations.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell className="font-medium">{operation.employee}</TableCell>
                        <TableCell>{operation.machine}</TableCell>
                        <TableCell>{operation.project || '-'}</TableCell>
                        <TableCell>{formatDateTime(operation.startTime)}</TableCell>
                        <TableCell>{formatDateTime(operation.endTime)}</TableCell>
                        <TableCell>{calculateDuration(operation.startTime, operation.endTime)}</TableCell>
                        <TableCell className="text-right">{operation.quantity}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="statistics">
            <OperationsStats operations={sortedAndFilteredOperations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;
