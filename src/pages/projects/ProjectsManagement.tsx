
import React, { useState, useRef } from 'react';
import { useOperations } from '@/context/OperationsContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Upload, Trash2, X, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { Link } from 'react-router-dom';
import { read, utils } from 'xlsx';
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
import { toast } from "sonner";

const ProjectsManagement = () => {
  const { projects, operations, addProject, removeProject, importProjects } = useOperations();
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      setError('Wprowadź nazwę projektu');
      return;
    }

    // Sprawdź czy projekt już istnieje
    if (projects.some(p => p.name.toLowerCase() === newProjectName.trim().toLowerCase())) {
      setError('Projekt o tej nazwie już istnieje');
      return;
    }

    addProject({ name: newProjectName.trim() });
    setNewProjectName('');
    setError('');
  };

  const handleRemoveProject = (id: string) => {
    removeProject(id);
  };

  // Sprawdź, czy projekt ma jakieś operacje
  const hasOperations = (projectName: string) => {
    return operations.some(op => op.project === projectName);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = e.target.files && e.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        
        // Zakładamy, że pierwszy arkusz zawiera projekty
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Konwertuj arkusz na JSON
        const jsonData = utils.sheet_to_json<{ nazwa?: string, Nazwa?: string, name?: string, Name?: string }>(worksheet);
        
        if (jsonData.length === 0) {
          setImportError('Plik nie zawiera żadnych danych.');
          return;
        }
        
        // Sprawdź strukturę danych - szukamy kolumny z nazwą projektu
        const projectsList = jsonData.map(row => {
          const projectName = row.nazwa || row.Nazwa || row.name || row.Name;
          if (!projectName) {
            throw new Error('Nieprawidłowy format pliku. Brak kolumny z nazwą projektu.');
          }
          return { name: String(projectName).trim() };
        }).filter(p => p.name); // Usuń puste nazwy
        
        if (projectsList.length === 0) {
          setImportError('Nie znaleziono żadnych projektów w pliku.');
          return;
        }
        
        // Zaimportuj projekty
        importProjects(projectsList);
        
        // Wyczyść input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        console.error('Błąd importu:', error);
        setImportError('Błąd podczas importu pliku. Sprawdź format pliku i upewnij się, że zawiera kolumnę "nazwa", "Nazwa", "name" lub "Name".');
      }
    };
    
    reader.readAsArrayBuffer(file);
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
            Zarządzanie projektami
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="w-full shadow-subtle border border-border/50">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
                <span className="inline-block p-1.5 rounded-full bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </span>
                Dodaj nowy projekt
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col space-y-4">
                <div>
                  <Label htmlFor="projectName">Nazwa projektu</Label>
                  <div className="flex mt-1.5">
                    <div className="relative flex-grow">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => {
                          setNewProjectName(e.target.value);
                          setError('');
                        }}
                        className="pl-10"
                        placeholder="Wprowadź nazwę projektu"
                      />
                    </div>
                    <Button
                      onClick={handleAddProject}
                      className="ml-2 whitespace-nowrap gap-1"
                    >
                      <FileText className="h-4 w-4" />
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
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                </span>
                Import projektów z Excela
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col space-y-4">
                <div>
                  <Label htmlFor="projectFile">Plik Excel (.xlsx)</Label>
                  <div className="mt-1.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Input
                          id="projectFile"
                          type="file"
                          accept=".xlsx, .xls"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                      </div>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Importuj</span>
                      </Button>
                    </div>
                  </div>

                  {importError && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <span>{importError}</span>
                    </div>
                  )}

                  <div className="mt-3 p-3 bg-muted/50 border border-border/40 rounded-md text-sm text-muted-foreground">
                    <p><strong>Wskazówka:</strong> Plik Excel powinien zawierać kolumnę o nazwie "nazwa", "Nazwa", "name" lub "Name" z listą projektów.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full shadow-subtle border border-border/50">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="inline-block p-1.5 rounded-full bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </span>
              Lista projektów ({projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Brak projektów. Dodaj pierwszy projekt powyżej lub zaimportuj z pliku Excel.
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa projektu</TableHead>
                      <TableHead className="w-[100px] text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          {project.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {hasOperations(project.name) ? (
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
                                  <AlertDialogTitle>Usuń projekt</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Projekt <span className="font-semibold">{project.name}</span> ma 
                                    zarejestrowane operacje w systemie. Usunięcie go z listy nie wpłynie na 
                                    zapisane operacje, ale projekt nie będzie dostępny do wyboru przy nowych operacjach.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveProject(project.id)}
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
                              onClick={() => handleRemoveProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

export default ProjectsManagement;
