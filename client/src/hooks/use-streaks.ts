import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalTasks: number;
  overdueTasks: number;
  todayTasks: number;
  completedTasks: number;
  currentBadge?: {
    name: string;
    emoji: string;
  } | null;
}

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: { theme?: string; simpleMode?: boolean }) => {
      const response = await apiRequest('PUT', '/api/user/settings', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    },
  });
}

export function useStreaks() {
  return useQuery({
    queryKey: ['/api/streaks'],
  });
}
