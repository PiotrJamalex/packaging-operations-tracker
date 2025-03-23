
import React, { useMemo } from 'react';
import { Operation } from '@/context/OperationsContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OperationsStatsProps {
  operations: Operation[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OperationsStats: React.FC<OperationsStatsProps> = ({ operations }) => {
  const employeeStats = useMemo(() => {
    const stats: Record<string, { quantity: number, operations: number, totalTimeMinutes: number }> = {};
    
    operations.forEach(op => {
      if (!stats[op.employee]) {
        stats[op.employee] = { quantity: 0, operations: 0, totalTimeMinutes: 0 };
      }
      
      const durationMinutes = (op.endTime.getTime() - op.startTime.getTime()) / 60000;
      
      stats[op.employee].quantity += op.quantity;
      stats[op.employee].operations += 1;
      stats[op.employee].totalTimeMinutes += durationMinutes;
    });
    
    return Object.entries(stats).map(([name, data]) => ({
      name,
      ilość: data.quantity,
      operacje: data.operations,
      czas: Math.round(data.totalTimeMinutes / 60 * 10) / 10, // convert to hours with 1 decimal
    }));
  }, [operations]);
  
  const machineStats = useMemo(() => {
    const stats: Record<string, { quantity: number, operations: number, totalTimeMinutes: number }> = {};
    
    operations.forEach(op => {
      if (!stats[op.machine]) {
        stats[op.machine] = { quantity: 0, operations: 0, totalTimeMinutes: 0 };
      }
      
      const durationMinutes = (op.endTime.getTime() - op.startTime.getTime()) / 60000;
      
      stats[op.machine].quantity += op.quantity;
      stats[op.machine].operations += 1;
      stats[op.machine].totalTimeMinutes += durationMinutes;
    });
    
    return Object.entries(stats).map(([name, data]) => ({
      name,
      value: data.quantity,
      operations: data.operations,
      time: Math.round(data.totalTimeMinutes / 60 * 10) / 10, // convert to hours with 1 decimal
    }));
  }, [operations]);

  const totalItems = useMemo(() => {
    return operations.reduce((sum, op) => sum + op.quantity, 0);
  }, [operations]);

  const totalTime = useMemo(() => {
    const minutes = operations.reduce((sum, op) => {
      return sum + (op.endTime.getTime() - op.startTime.getTime()) / 60000;
    }, 0);
    return Math.round(minutes / 60 * 10) / 10; // convert to hours with 1 decimal
  }, [operations]);

  const avgItemsPerHour = useMemo(() => {
    if (totalTime === 0) return 0;
    return Math.round(totalItems / totalTime);
  }, [totalItems, totalTime]);

  if (operations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Brak danych do wyświetlenia statystyk
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Łączna ilość produktów</div>
          <div className="text-3xl font-bold mt-1">{totalItems}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Całkowity czas pracy</div>
          <div className="text-3xl font-bold mt-1">{totalTime} h</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Średnia wydajność</div>
          <div className="text-3xl font-bold mt-1">{avgItemsPerHour} szt/h</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Produkcja według pracowników</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={employeeStats}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip formatter={(value, name) => {
                if (name === 'czas') return [`${value} h`, 'Czas pracy'];
                if (name === 'operacje') return [value, 'Liczba operacji'];
                return [`${value} szt`, 'Ilość produktów'];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="ilość" name="Ilość produktów" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="czas" name="Czas pracy (h)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Wykorzystanie maszyn</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={machineStats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {machineStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} szt`, 'Ilość']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Czasy pracy maszyn</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={machineStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value, name) => {
                  if (name === 'time') return [`${value} h`, 'Czas pracy'];
                  return [value, name];
                }} />
                <Legend />
                <Bar dataKey="time" name="Czas pracy (h)" fill="#8884d8" />
                <Bar dataKey="operations" name="Liczba operacji" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsStats;
