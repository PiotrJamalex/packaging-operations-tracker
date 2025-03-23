
import React from 'react';
import { OperationsProvider } from '@/context/OperationsContext';
import OperationForm from '@/components/OperationForm';

const Index = () => {
  return (
    <OperationsProvider>
      <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 md:p-8 bg-gradient-to-b from-white to-blue-50">
        <div className="w-full max-w-6xl mx-auto">
          <header className="text-center mb-8 animate-reveal" style={{ animationDelay: '50ms' }}>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 mb-2">
              System Rejestracji Operacji Produkcyjnych
            </h1>
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
    </OperationsProvider>
  );
};

export default Index;
