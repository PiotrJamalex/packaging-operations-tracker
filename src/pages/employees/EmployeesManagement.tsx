
import React, { useState } from 'react';
import { useOperations } from '@/context/OperationsContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, UserPlus, Trash2 } from "lucide-react";
import { Link } from 'react-router-dom';
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

const EmployeesManagement = () => {
  const { employees, operations, addEmployee, removeEmployee } = useOperations();
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [error, setError] = useState('');

  const handleAddEmployee = () => {
    if (!newEmployeeName.trim()) {
      setError('Wprowadź imię pracownika');
      return;
    }

    // Sprawdź czy pracownik już istnieje
    if (employees.some(emp => emp.name.toLowerCase() === newEmployeeName.trim().toLowerCase())) {
      setError('Pracownik o tym imieniu już istnieje');
      return;
    }

    addEmployee({ name: newEmployeeName.trim() });
    setNewEmployeeName('');
    setError('');
  };

  const handleRemoveEmployee = (id: string) => {
    removeEmployee(id);
  };

  // Sprawdź, czy pracownik ma jakieś operacje
  const hasOperations = (employeeId: string) => {
    return operations.some(op => op.employee === employeeId);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center p-4 md:p-8 bg-gradient-to-b from-white to-blue-50">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 flex items-center">
          <Button asChild variant="ghost" className="mr-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Powrót</span>
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            Zarządzanie pracownikami
          </h1>
        </div>

        <Card className="w-full shadow-subtle border border-border/50 mb-8">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="inline-block p-1.5 rounded-full bg-primary/10">
                <UserPlus className="h-4 w-4 text-primary" />
              </span>
              Dodaj nowego pracownika
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col space-y-4">
              <div>
                <Label htmlFor="employeeName">Imię pracownika</Label>
                <div className="flex mt-1.5">
                  <div className="relative flex-grow">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employeeName"
                      value={newEmployeeName}
                      onChange={(e) => {
                        setNewEmployeeName(e.target.value);
                        setError('');
                      }}
                      className="pl-10"
                      placeholder="Wprowadź imię pracownika"
                    />
                  </div>
                  <Button
                    onClick={handleAddEmployee}
                    className="ml-2 whitespace-nowrap gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Dodaj</span>
                  </Button>
                </div>
                {error && <p className="text-destructive text-sm mt-1.5">{error}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full shadow-subtle border border-border/50">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="inline-block p-1.5 rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </span>
              Lista pracowników
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Brak pracowników. Dodaj pierwszego pracownika powyżej.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imię</TableHead>
                    <TableHead className="w-[100px] text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {hasOperations(employee.id) ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Usuń pracownika</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Pracownik <span className="font-semibold">{employee.name}</span> ma 
                                  zarejestrowane operacje w systemie. Usunięcie go z listy nie wpłynie na 
                                  zapisane operacje, ale pracownik nie będzie dostępny do wyboru przy nowych operacjach.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRemoveEmployee(employee.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Usuń
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeesManagement;
