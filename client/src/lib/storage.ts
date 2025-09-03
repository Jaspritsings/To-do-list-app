// Local storage utilities for offline support
export const LocalStorage = {
  getTasks: (): any[] => {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  },

  saveTasks: (tasks: any[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },

  getProjects: (): any[] => {
    const projects = localStorage.getItem('projects');
    return projects ? JSON.parse(projects) : [];
  },

  saveProjects: (projects: any[]) => {
    localStorage.setItem('projects', JSON.stringify(projects));
  },

  getUserSettings: () => {
    const settings = localStorage.getItem('userSettings');
    return settings ? JSON.parse(settings) : { theme: 'light', simpleMode: false };
  },

  saveUserSettings: (settings: any) => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  },

  getOnboardingCompleted: (): boolean => {
    return localStorage.getItem('onboardingCompleted') === 'true';
  },

  setOnboardingCompleted: () => {
    localStorage.setItem('onboardingCompleted', 'true');
  }
};
