
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOperations } from '@/context/OperationsContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, BarChart, Package, FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductionRate {
  project: string;
  machine: string;
  totalHours: number;
  totalQuantity: number;
  ratePerHour: number;
}

const Analysis = () => {
  const { operations, machines, projects } = useOperations();
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [machineFilter, setMachineFilter] = useState<string>("");

  // Calculate production rates for each project/machine combination
  const productionRates = useMemo(() => {
    const rates: Record<string, Record<string, ProductionRate>> = {};

    operations.forEach(op => {
      const projectKey = op.project || 'Brak projektu';
      const machineKey = op.machine;
      
      // Calculate duration in hours
      const startTime = new Date(op.startTime);
      const endTime = new Date(op.endTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      if (!rates[projectKey]) {
        rates[projectKey] = {};
      }
      
      if (!rates[projectKey][machineKey]) {
        rates[projectKey][machineKey] = {
          project: projectKey,
          machine: machineKey,
          totalHours: 0,
          totalQuantity: 0,
          ratePerHour: 0
        };
      }
      
      rates[projectKey][machineKey].totalHours += durationHours;
      rates[projectKey][machineKey].totalQuantity += op.quantity;
    });
    
    // Calculate rate per hour for each combination
    Object.keys(rates).forEach(projectKey => {
      Object.keys(rates[projectKey]).forEach(machineKey => {
        const data = rates[projectKey][machineKey];
        data.ratePerHour = data.totalHours > 0 ? data.totalQuantity / data.totalHours : 0;
      });
    });
    
    // Flatten to array for easier rendering
    const result: ProductionRate[] = [];
    Object.keys(rates).forEach(projectKey => {
      Object.keys(rates[projectKey]).forEach(machineKey => {
        result.push(rates[projectKey][machineKey]);
      });
    });
    
    return result;
  }, [operations]);

  // Filter production rates based on selected filters
  const filteredRates = useMemo(() => {
    return productionRates.filter(rate => {
      // Project filter
      if (projectFilter && projectFilter !== "all" && rate.project !== projectFilter) {
        return false;
      }
      
      // Machine filter
      if (machineFilter && machineFilter !== "all" && rate.machine !== machineFilter) {
        return false;
      }
      
      return true;
    });
  }, [productionRates, projectFilter, machineFilter]);

  // Get machine name by ID
  const getMachineName = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : machineId;
  };

  // Reset filters
  const resetFilters = () => {
    setProjectFilter("");
    setMachineFilter("");
  };

  // Get unique project names from operations
  const uniqueProjects = useMemo(() => {
    const projectSet = new Set<string>();
    operations.forEach(op => {
      if (op.project) {
        projectSet.add(op.project);
      }
    });
    return Array.from(projectSet);
  }, [operations]);

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center p-4 md:p-8 bg-gradient-to-b from-white to-blue-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Button asChild variant="ghost" className="mr-4">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Powrót</span>
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              Analiza produkcji
            </h1>
          </div>
        </div>

        <Card className="w-full shadow-subtle border border-border/50 mb-8">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-medium tracking-tight flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span>Filtrowanie</span>
              </span>
              <span className="text-sm text-muted-foreground">
                Łącznie: {filteredRates.length} wyników
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectFilter">Filtruj po projekcie</Label>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger id="projectFilter" className="mt-1.5">
                      <SelectValue placeholder="Wszystkie projekty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie projekty</SelectItem>
                      {uniqueProjects.map(project => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                      <SelectItem value="Brak projektu">Brak projektu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="machineFilter">Filtruj po operacji</Label>
                  <Select value={machineFilter} onValueChange={setMachineFilter}>
                    <SelectTrigger id="machineFilter" className="mt-1.5">
                      <SelectValue placeholder="Wszystkie operacje" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie operacje</SelectItem>
                      {machines.map(machine => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {(projectFilter || machineFilter) && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Wyczyść filtry</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full shadow-subtle border border-border/50 mb-8">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="inline-block p-1.5 rounded-full bg-primary/10">
                <BarChart className="h-4 w-4 text-primary" />
              </span>
              Wydajność produkcji (sztuk/godzinę)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {productionRates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Brak danych do analizy.</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Dodaj operacje</span>
                  </Link>
                </Button>
              </div>
            ) : filteredRates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Brak wyników dla wybranych filtrów.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetFilters}
                >
                  <span>Wyczyść filtry</span>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projekt</TableHead>
                      <TableHead>Operacja</TableHead>
                      <TableHead className="text-right">Łączny czas (h)</TableHead>
                      <TableHead className="text-right">Ilość sztuk</TableHead>
                      <TableHead className="text-right">Wydajność (szt/h)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRates
                      .sort((a, b) => b.ratePerHour - a.ratePerHour)
                      .map((rate, index) => (
                      <TableRow key={`${rate.project}-${rate.machine}`}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{rate.project}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{getMachineName(rate.machine)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {rate.totalHours.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {rate.totalQuantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {rate.ratePerHour.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
