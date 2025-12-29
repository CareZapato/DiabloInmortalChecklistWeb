import { ActivityPriority } from '../types';

export const getPriorityClass = (priority: ActivityPriority): string => {
  const priorityMap: Record<ActivityPriority, string> = {
    'S+': 'priority-s-plus',
    'S': 'priority-s',
    'A+': 'priority-a-plus',
    'A': 'priority-a',
    'B+': 'priority-b-plus',
    'B': 'priority-b',
    'C': 'priority-c',
  };
  return priorityMap[priority] || 'bg-gray-500';
};

export const getPriorityBadgeClass = (priority: ActivityPriority): string => {
  return `${getPriorityClass(priority)} px-2 py-1 rounded text-xs font-bold`;
};
