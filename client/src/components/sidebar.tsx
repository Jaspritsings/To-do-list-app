import { Link, useLocation } from 'wouter';
import { useUserStats } from '@/hooks/use-streaks';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, InboxIcon, CalendarIcon, ExclamationTriangleIcon, CalendarDaysIcon, FolderIcon, MoonIcon, SunIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { data: stats } = useUserStats();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { 
      name: 'Inbox', 
      href: '/', 
      icon: InboxIcon, 
      count: stats?.totalTasks || 0,
      active: location === '/'
    },
    { 
      name: 'My Day', 
      href: '/today', 
      icon: CalendarIcon, 
      count: stats?.todayTasks || 0,
      active: location === '/today'
    },
    { 
      name: 'Overdue', 
      href: '/overdue', 
      icon: ExclamationTriangleIcon, 
      count: stats?.overdueTasks || 0,
      active: location === '/overdue',
      urgent: true
    },
    { 
      name: 'Upcoming', 
      href: '/upcoming', 
      icon: CalendarDaysIcon,
      active: location === '/upcoming'
    },
    { 
      name: 'Projects', 
      href: '/projects', 
      icon: FolderIcon,
      active: location === '/projects'
    },
  ];

  const currentBadge = stats?.currentBadge;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:relative w-64 h-full bg-card border-r border-border shadow-lg z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        data-testid="sidebar"
      >
        <div className="p-6 border-b border-border">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Tasks Ahead</h1>
              <p className="text-sm text-muted-foreground">Your friendly companion</p>
            </div>
          </div>

          {/* Streak Display */}
          {stats && stats.currentStreak > 0 && (
            <div className="streak-badge rounded-xl p-4 text-center text-white mb-6" data-testid="streak-display">
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-sm opacity-90">Day Streak</div>
              {currentBadge && (
                <div className="text-xs mt-1">
                  {currentBadge.emoji} {currentBadge.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <a 
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  item.active 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-secondary"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                onClick={() => onClose()}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.count !== undefined && (
                  <Badge 
                    variant={item.urgent ? "destructive" : item.active ? "secondary" : "outline"}
                    className="ml-auto"
                  >
                    {item.count}
                  </Badge>
                )}
              </a>
            </Link>
          ))}
        </nav>

        {/* Footer Controls */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={toggleTheme}
            data-testid="button-toggle-theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 mr-3" />
            ) : (
              <MoonIcon className="w-5 h-5 mr-3" />
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>
          
          <Link href="/settings">
            <Button
              variant="ghost"
              className="w-full justify-start"
              data-testid="button-settings"
              onClick={() => onClose()}
            >
              <Cog6ToothIcon className="w-5 h-5 mr-3" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
