'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const weeklyData = [
  { name: 'Completado', value: 75, fill: 'var(--color-primary)' },
  { name: 'Pendiente', value: 25, fill: 'var(--color-muted)' },
];

const monthlyData = [
  { name: 'Completado', value: 60, fill: 'var(--color-accent)' },
  { name: 'Pendiente', value: 40, fill: 'var(--color-muted)' },
];

const chartConfig = {
  value: {
    label: 'Progreso',
  },
  primary: {
    label: 'Primario',
    color: 'hsl(var(--primary))',
  },
  accent: {
    label: 'Acento',
    color: 'hsl(var(--accent))',
  },
  muted: {
    label: 'Muted',
    color: 'hsl(var(--muted))',
  },
};

function ProgressChart({
  data,
  title,
  primaryColor,
}: {
  data: any[];
  title: string;
  primaryColor: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-40"
      >
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator="dot" />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={65}
            strokeWidth={2}
            startAngle={90}
            endAngle={450}
            cy="50%"
            cx="50%"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="text-center">
        <p className="font-semibold text-lg" style={{ color: primaryColor }}>
          {data[0].value}%
        </p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}

export function ProgressOverview() {
  return (
    <Card className="rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
      <CardHeader>
        <CardTitle>Seguimiento de Progreso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <ProgressChart
            data={weeklyData}
            title="Progreso Semanal"
            primaryColor="hsl(var(--primary))"
          />
          <ProgressChart
            data={monthlyData}
            title="Progreso Mensual"
            primaryColor="hsl(var(--accent))"
          />
        </div>
      </CardContent>
    </Card>
  );
}
