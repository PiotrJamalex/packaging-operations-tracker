
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowLeft, Download, FileText, Package, Trash2, User, CalendarIcon, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useOperations } from "@/context/OperationsContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { utils, writeFile } from 'xlsx';
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const History = () => {
  const { operations, clearOperations, employees, machines } = useOperations();
  const [projectFilter, setProjectFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [machineFilter, setMachineFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);

  // Get employee names by ID
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : employeeId;
  };

  // Get machine names by ID
  const getMachineName = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : machineId;
  };

  // Filter operations based on all filters
  const filteredOperations = operations.filter(op => {
    // Project filter
    if (projectFilter && !op.project?.toLowerCase().includes(projectFilter.toLowerCase())) {
      return false;
    }
    
    // Employee filter
    if (employeeFilter && employeeFilter !== "all" && op.employee !== employeeFilter) {
      return false;
    }
    
    // Machine filter
    if (machineFilter && machineFilter !== "all" && op.machine !== machineFilter) {
      return false;
    }
    
    // End date filter
    if (endDateFilter) {
      const opEndDate = new Date(op.endTime);
      if (
        opEndDate.getDate() !== endDateFilter.getDate() ||
        opEndDate.getMonth() !== endDateFilter.getMonth() ||
        opEndDate.getFullYear() !== endDateFilter.getFullYear()
      ) {
        return false;
      }
    }
    
    return true;
  });

  // Sort operations - newest first
  const sortedOperations = [...filteredOperations].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Reset all filters
  const resetFilters = () => {
    setProjectFilter("");
    setEmployeeFilter("");
    setMachineFilter("");
    setEndDateFilter(undefined);
  };

  // Export to Excel
  const handleExport = () => {
    // Prepare data for export
    const exportData = sortedOperations.map(op => ({
      "Data utworzenia": format(new Date(op.createdAt), 'dd.MM.yyyy HH:mm', { locale: pl }),
      "Pracownik": getEmployeeName(op.employee),
      "Operacja": getMachineName(op.machine),
      "Projekt": op.project || "",
      "Data rozpoczęcia": format(new Date(op.startTime), 'dd.MM.yyyy HH:mm', { locale: pl }),
      "Data zakończenia": format(new Date(op.endTime), 'dd.MM.yyyy HH:mm', { locale: pl }),
      "Ilość": op.quantity
    }));

    // Create spreadsheet
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Operacje");

    // Save file
    writeFile(wb, "operacje_produkcyjne.xlsx");
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
              Historia operacji
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              className="gap-1"
              disabled={sortedOperations.length === 0}
            >
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </Button>
            
            {operations.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 border-destructive/50 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                    <span>Wyczyść</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Czy na pewno chcesz usunąć wszystkie operacje?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ta akcja usunie wszystkie zarejestrowane operacje i nie będzie można ich odzyskać.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={clearOperations}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Usuń wszystko
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
                Łącznie: {sortedOperations.length} operacji
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectFilter">Filtruj po nazwie projektu</Label>
                  <div className="relative mt-1.5">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="projectFilter"
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                      className="pl-10"
                      placeholder="Wpisz nazwę projektu..."
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="employeeFilter">Filtruj po pracowniku</Label>
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger id="employeeFilter" className="mt-1.5">
                      <SelectValue placeholder="Wszyscy pracownicy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszyscy pracownicy</SelectItem>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div>
                  <Label>Filtruj po dacie zakończenia</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1.5 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDateFilter ? (
                          format(endDateFilter, 'dd.MM.yyyy', { locale: pl })
                        ) : (
                          <span>Wybierz datę</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDateFilter}
                        onSelect={(date) => setEndDateFilter(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {(projectFilter || employeeFilter || machineFilter || endDateFilter) && (
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
        
        <Card className="w-full shadow-subtle border border-border/50">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="inline-block p-1.5 rounded-full bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </span>
              Lista operacji produkcyjnych
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {operations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Brak zarejestrowanych operacji.</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Wróć do formularza</span>
                  </Link>
                </Button>
              </div>
            ) : sortedOperations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Brak operacji spełniających kryteria wyszukiwania.</p>
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
                      <TableHead className="w-[130px]">Data</TableHead>
                      <TableHead className="w-[100px]">Pracownik</TableHead>
                      <TableHead className="w-[100px]">Operacja</TableHead>
                      <TableHead>Projekt</TableHead>
                      <TableHead className="w-[120px]">Czas rozpoczęcia</TableHead>
                      <TableHead className="w-[120px]">Czas zakończenia</TableHead>
                      <TableHead className="text-right w-[80px]">Ilość</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOperations.map((op) => (
                      <TableRow key={op.id}>
                        <TableCell className="font-medium">
                          {format(new Date(op.createdAt), 'dd.MM.yyyy', { locale: pl })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{getEmployeeName(op.employee)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{getMachineName(op.machine)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{op.project}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(op.startTime), 'HH:mm dd.MM', { locale: pl })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(op.endTime), 'HH:mm dd.MM', { locale: pl })}
                        </TableCell>
                        <TableCell className="text-right">{op.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={6}>Suma sztuk</TableCell>
                      <TableCell className="text-right">
                        {sortedOperations.reduce((sum, op) => sum + op.quantity, 0)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
