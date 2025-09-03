import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import { formatDueDateTime, isOverdue, getDaysOverdue } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { 
  PencilIcon, 
  TrashIcon, 
  FolderIcon, 
  PaperClipIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import type { Task, Priority } from '@shared/schema';

interface TaskItemProps {
  task: Task & { project?: { id: string; name: string; color: string } | null };
  onEdit?: (task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-orange-500 bg-orange-500/5',
  low: 'border-l-green-500 bg-green-500/5',
};

const priorityLabels: Record<Priority, { label: string; color: string }> = {
  high: { label: 'HIGH', color: 'text-destructive' },
  medium: { label: 'MEDIUM', color: 'text-orange-600' },
  low: { label: 'LOW', color: 'text-green-600' },
};

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleToggleComplete = async () => {
    if (updateTask.isPending) return;
    
    setIsCompleting(true);
    try {
      await updateTask.mutateAsync({
        id: task.id,
        updates: { completed: !task.completed }
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = () => {
    if (deleteTask.isPending) return;
    deleteTask.mutate(task.id);
  };

  const isTaskOverdue = isOverdue(task.dueDate, task.completed);
  const daysOverdue = getDaysOverdue(task.dueDate);
  const priorityStyle = priorityColors[task.priority as Priority];
  const priorityLabel = priorityLabels[task.priority as Priority];

  return (
    <Card 
      className={cn(
        "p-4 mb-3 shadow-sm border-l-4",
        priorityStyle,
        task.completed && "opacity-60",
        isTaskOverdue && !task.completed && "border-l-destructive bg-destructive/5"
      )}
      data-testid={`task-item-${task.id}`}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          disabled={isCompleting || updateTask.isPending}
          className="mt-1"
          data-testid={`checkbox-task-${task.id}`}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Badge 
              variant="outline" 
              className={priorityLabel.color}
              data-testid={`badge-priority-${task.priority}`}
            >
              {priorityLabel.label}
            </Badge>
            
            {task.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <ClockIcon className="w-3 h-3 mr-1" />
                <span data-testid={`text-due-date-${task.id}`}>
                  {isTaskOverdue && !task.completed
                    ? `Due ${daysOverdue === 1 ? 'yesterday' : `${daysOverdue} days ago`}`
                    : task.completed && task.completedAt
                    ? `Completed at ${new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : `Due ${formatDueDateTime(task.dueDate, task.dueTime || undefined)}`
                  }
                </span>
              </div>
            )}
          </div>
          
          <h4 
            className={cn(
              "font-medium text-foreground mb-1",
              task.completed && "line-through"
            )}
            data-testid={`text-task-title-${task.id}`}
          >
            {task.title}
          </h4>
          
          {task.description && (
            <p 
              className="text-sm text-muted-foreground mb-2"
              data-testid={`text-task-description-${task.id}`}
            >
              {task.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4">
            {task.project && (
              <div className="flex items-center text-xs text-muted-foreground">
                <FolderIcon className="w-3 h-3 mr-1" />
                <span data-testid={`text-project-${task.id}`}>{task.project.name}</span>
              </div>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {task.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs"
                    data-testid={`badge-tag-${tag}`}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(task)}
            disabled={updateTask.isPending || deleteTask.isPending}
            data-testid={`button-edit-${task.id}`}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={updateTask.isPending || deleteTask.isPending}
            className="text-muted-foreground hover:text-destructive"
            data-testid={`button-delete-${task.id}`}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
