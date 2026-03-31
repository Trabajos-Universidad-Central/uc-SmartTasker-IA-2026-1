import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { categories } from '@/lib/data';

export function Categories() {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary" />
          <CardTitle>Categorías</CardTitle>
        </div>
        <CardDescription>
          Organiza tus tareas y eventos por etiquetas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              className="text-sm border-transparent"
              style={{
                backgroundColor: category.color,
                color: category.textColor,
              }}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
