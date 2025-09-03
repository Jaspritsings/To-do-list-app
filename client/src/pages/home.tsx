import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/header';
import { TaskItem } from '@/components/task-item';
import { TaskForm } from '@/components/task-form';
import { StreakModal } from '@/components/streak-modal';
import { useTasks } from '@/hooks/use-tasks';
import { useUserStats } from '@/hooks/use-streaks';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Task, Priority } from '@shared/schema';

interface HomeProps {
  onMenuClick: () => void;
}

export default function Home({ onMenuClick }: HomeProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: stats } = useUserStats();
  const { data: tasks = [], isLoading, error } = useTasks(
    activeFilter === 'all' ? undefined : activeFilter,
    undefined,
    searchQuery || undefined
  );

  // Show streak celebration for new achievements
  useEffect(() => {
    if (stats?.currentStreak && stats.currentStreak > 0) {
      // Simple demo: show celebration randomly for demo purposes
      const shouldShow = Math.random() > 0.95; // 5% chance for demo
      if (shouldShow) {
        const timer = setTimeout(() => setStreakModalOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [stats?.currentStreak]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleKeyboardShortcut = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      setTaskFormOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  // Group tasks by status
  const overdueTasks = tasks.filter(task => task.overdue && !task.completed);
  const todayTasks = tasks.filter(task => !task.overdue && !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const filters = [
    { id: 'all', label: 'All', count: tasks.length },
    { id: 'high', label: 'High Priority', count: tasks.filter(t => t.priority === 'high').length },
    { id: 'medium', label: 'Medium Priority', count: tasks.filter(t => t.priority === 'medium').length },
    { id: 'low', label: 'Low Priority', count: tasks.filter(t => t.priority === 'low').length },
    { id: 'completed', label: 'Completed', count: completedTasks.length },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen" data-testid="page-home">
      <Header
        title="Inbox"
        subtitle={`${stats?.totalTasks || 0} tasks • ${stats?.overdueTasks || 0} overdue`}
        onMenuClick={onMenuClick}
        onSearch={handleSearch}
      />

      {/* Task Filters */}
      <div className="bg-card border-b border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-3" data-testid="task-filters">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className="text-sm"
              data-testid={`filter-${filter.id}`}
            >
              {filter.label}
              {filter.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3" data-testid="loading-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12" data-testid="error-message">
            <div className="text-destructive mb-2">Failed to load tasks</div>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-state">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No tasks found' : 'Ready to get started?'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No tasks match "${searchQuery}"`
                : 'Create your first task and start building productive habits!'}
            </p>
            <Button onClick={() => setTaskFormOpen(true)} data-testid="button-add-first-task">
              Add Your First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
              <div data-testid="section-overdue">
                <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3" />
                  Overdue ({overdueTasks.length})
                </h3>
                <div className="space-y-3">
                  {overdueTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
                  ))}
                </div>
              </div>
            )}

            {/* Today/Active Section */}
            {todayTasks.length > 0 && (
              <div data-testid="section-active">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3" />
                  {activeFilter === 'all' ? 'Active Tasks' : 'Tasks'} ({todayTasks.length})
                </h3>
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (activeFilter === 'all' || activeFilter === 'completed') && (
              <div data-testid="section-completed">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Completed ({completedTasks.length})
                </h3>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
                  ))}
                </div>
              </div>
            )}

            {/* All caught up message */}
            {overdueTasks.length === 0 && todayTasks.length === 0 && completedTasks.length > 0 && (
              <div className="text-center py-12" data-testid="all-caught-up">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground mb-4">You've completed all your tasks. Great work!</p>
                <Button onClick={() => setTaskFormOpen(true)} data-testid="button-add-new-task">
                  Add New Task
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {isMobile && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-40"
          onClick={() => setTaskFormOpen(true)}
          data-testid="fab-add-task"
        >
          <PlusIcon className="w-6 h-6" />
        </Button>
      )}

      {/* Modals */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={handleCloseTaskForm}
        task={editingTask}
      />

      <StreakModal
        open={streakModalOpen}
        onOpenChange={setStreakModalOpen}
        streakDay={stats?.currentStreak}
      />
    </div>
  );
}
