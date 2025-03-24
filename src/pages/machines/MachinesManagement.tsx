
import React, { useState } from 'react';
import { useOperations } from '@/context/OperationsContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, Package, Scissors, Settings, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MachinesManagement = () => {
  const { machines, operations, addMachine, removeMachine } = useOperations();
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineIcon, setNewMachineIcon] = useState('package');
  const [error, setError] = useState('');

  const handleAddMachine = () => {
    if (!newMachineName.trim()) {
      setError('Wprowadź nazwę maszyny');
      return;
    }

    // Sprawdź czy maszyna już istnieje
    if (machines.some(m => m.name.toLowerCase() === newMachineName.trim().toLowerCase())) {
      setError('Maszyna o tej nazwie już istnieje');
      return;
    }

    addMachine({ 
      name: newMachineName.trim(),
      icon: newMachineIcon 
    });
    setNewMachineName('');
    setError('');
  };

  const handleRemoveMachine = (id: string) => {
    removeMachine(id);
  };

  // Sprawdź, czy maszyna ma jakieś operacje
  const hasOperations = (machineId: string) => {
    return operations.some(op => op.machine === machineId);
  };

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'printer':
        return <Printer className="h-4 w-4" />;
      case 'package':
        return <Package className="h-4 w-4" />;
      case 'scissors':
        return <Scissors className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
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
            Zarządzanie maszynami
          </h1>
        </div>

        <Card className="w-full shadow-subtle border border-border/50 mb-8">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="inline-block p-1.5 rounded-full bg-primary/10">
                <Settings className="h-4 w-4 text-primary" />
              </span>
              Dodaj nową maszynę
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="machineName">Nazwa maszyny</Label>
                  <div className="relative mt-1.5">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="machineName"
                      value={newMachineName}
                      onChange={(e) => {
                        setNewMachineName(e.target.value);
                        setError('');
                      }}
                      className="pl-10"
                      placeholder="Wprowadź nazwę maszyny"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="machineIcon">Ikona</Label>
                  <Select
                    value={newMachineIcon}
                    onValueChange={setNewMachineIcon}
                  >
                    <SelectTrigger id="machineIcon" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-border/50">
                      <SelectItem value="printer" className="flex items-center gap-2">
                        <Printer className="h-4 w-4 inline-block mr-2" />
                        <span>Drukarka</span>
                      </SelectItem>
                      <SelectItem value="package" className="flex items-center gap-2">
                        <Package className="h-4 w-4 inline-block mr-2" />
                        <span>Pudełko</span>
                      </SelectItem>
                      <SelectItem value="scissors" className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 inline-block mr-2" />
                        <span>Nożyce</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {error && <p className="text-destructive text-sm">{error}</p>}
              
              <Button
                onClick={handleAddMachine}
                className="self-start whitespace-nowrap gap-1"
              >
                <Settings className="h-4 w-4" />
                <span>Dodaj maszynę</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full shadow-subtle border border-border/50">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="inline-block p-1.5 rounded-full bg-primary/10">
                <Settings className="h-4 w-4 text-primary" />
              </span>
              Lista maszyn
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {machines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Brak maszyn. Dodaj pierwszą maszynę powyżej.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ikona</TableHead>
                    <TableHead>Nazwa</TableHead>
                    <TableHead className="w-[100px] text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {getIconComponent(machine.icon)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {machine.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {hasOperations(machine.id) ? (
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
                                <AlertDialogTitle>Usuń maszynę</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Maszyna <span className="font-semibold">{machine.name}</span> ma 
                                  zarejestrowane operacje w systemie. Usunięcie jej z listy nie wpłynie na 
                                  zapisane operacje, ale maszyna nie będzie dostępna do wyboru przy nowych operacjach.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRemoveMachine(machine.id)}
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
                            onClick={() => handleRemoveMachine(machine.id)}
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

export default MachinesManagement;
