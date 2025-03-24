
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowLeft, Download, FileText, Package, Trash2, User } from "lucide-react";
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

const History = () => {
  const { operations, clearOperations, employees, machines } = useOperations();
  const [projectFilter, setProjectFilter] = useState("");

  // Pobierz nazwy pracowników na podstawie ID
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : employeeId;
  };

  // Pobierz nazwy maszyn na podstawie ID
  const getMachineName = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : machineId;
  };

  // Filtrowanie operacji na podstawie projektu
  const filteredOperations = projectFilter
    ? operations.filter(op => 
        op.project?.toLowerCase().includes(projectFilter.toLowerCase())
      )
    : operations;

  // Sortowanie operacji - najnowsze pierwsze
  const sortedOperations = [...filteredOperations].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Eksport do Excela
  const handleExport = () => {
    // Przygotuj dane do eksportu
    const exportData = sortedOperations.map(op => ({
      "Data utworzenia": format(new Date(op.createdAt), 'dd.MM.yyyy HH:mm', { locale: pl }),
      "Pracownik": getEmployeeName(op.employee),
      "Maszyna": getMachineName(op.machine),
      "Projekt": op.project || "",
      "Data rozpoczęcia": format(new Date(op.startTime), 'dd.MM.yyyy HH:mm', { locale: pl }),
      "Data zakończenia": format(new Date(op.endTime), 'dd.MM.yyyy HH:mm', { locale: pl }),
      "Ilość": op.quantity
    }));

    // Utwórz arkusz
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Operacje");

    // Zapisz plik
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
                <FileText className="h-4 w-4 text-primary" />
                <span>Filtrowanie</span>
              </span>
              <span className="text-sm text-muted-foreground">
                Łącznie: {sortedOperations.length} operacji
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col space-y-4">
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
                  onClick={() => setProjectFilter("")}
                >
                  <span>Wyczyść filtr</span>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px]">Data</TableHead>
                      <TableHead className="w-[100px]">Pracownik</TableHead>
                      <TableHead className="w-[100px]">Maszyna</TableHead>
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
