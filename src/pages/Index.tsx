
import React from 'react';
import { Link } from 'react-router-dom';
import { History, Settings, User, Package, FileText } from 'lucide-react';
import OperationForm from '@/components/OperationForm';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 md:p-8 bg-gradient-to-b from-white to-blue-50">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8 animate-reveal" style={{ animationDelay: '50ms' }}>
          <div className="flex justify-center items-center mb-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 mb-2">
              System Rejestracji Operacji Produkcyjnych
            </h1>
            <div className="flex gap-2 ml-4">
              <Button asChild variant="outline" className="mr-2" size="sm">
                <Link to="/historia">
                  <History className="mr-2 h-4 w-4" />
                  Historia
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Zarządzanie
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white">
                  <DropdownMenuLabel>Opcje zarządzania</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/zarzadzanie/pracownicy" className="w-full flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Pracownicy</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/zarzadzanie/maszyny" className="w-full flex items-center cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Maszyny</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/zarzadzanie/projekty" className="w-full flex items-center cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Projekty</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Precyzyjne rejestrowanie czasu pracy i ilości wyprodukowanych opakowań tekturowych
          </p>
        </header>
        
        <div className="form-container transition-all duration-500 animate-reveal" style={{ animationDelay: '150ms' }}>
          <OperationForm />
        </div>
        
        <footer className="mt-12 text-center text-sm text-muted-foreground animate-reveal" style={{ animationDelay: '250ms' }}>
          <p className="opacity-70">
            System rejestracji operacji produkcyjnych © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
