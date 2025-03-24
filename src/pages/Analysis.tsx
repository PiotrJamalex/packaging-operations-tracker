
import React, { useMemo } from 'react';
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
import { ArrowLeft, BarChart, Package, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ProductionRate {
  project: string;
  machine: string;
  totalHours: number;
  totalQuantity: number;
  ratePerHour: number;
}

const Analysis = () => {
  const { operations, machines, projects } = useOperations();

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

  // Get machine name by ID
  const getMachineName = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : machineId;
  };

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
                    {productionRates
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
