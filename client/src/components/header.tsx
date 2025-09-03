import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useUserStats } from '@/hooks/use-streaks';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  onSearch?: (query: string) => void;
  currentView?: 'list' | 'board';
  onViewChange?: (view: 'list' | 'board') => void;
}

export function Header({ 
  title, 
  subtitle, 
  onMenuClick, 
  onSearch,
  currentView = 'list',
  onViewChange 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: stats } = useUserStats();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between" data-testid="header">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuClick}
          data-testid="button-menu"
        >
          <Bars3Icon className="w-5 h-5" />
        </Button>
        
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Input
            type="text"
            placeholder="Search tasks..."
            className="w-64 pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
            data-testid="input-search"
          />
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        
        {/* View Toggle */}
        {onViewChange && (
          <div className="flex bg-secondary rounded-lg p-1">
            <Button
              size="sm"
              variant={currentView === 'list' ? 'default' : 'ghost'}
              onClick={() => onViewChange('list')}
              data-testid="button-view-list"
            >
              List
            </Button>
            <Button
              size="sm"
              variant={currentView === 'board' ? 'default' : 'ghost'}
              onClick={() => onViewChange('board')}
              data-testid="button-view-board"
            >
              Board
            </Button>
          </div>
        )}
        
        {/* Profile */}
        <Avatar data-testid="avatar-profile">
          <AvatarFallback className="bg-primary text-primary-foreground">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
