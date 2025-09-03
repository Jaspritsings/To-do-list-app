import { type User, type InsertUser, type Task, type InsertTask, type Project, type InsertProject, type Streak, type InsertStreak, type Priority } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getTasksByProject(projectId: string): Promise<Task[]>;
  getOverdueTasks(userId: string): Promise<Task[]>;
  getTodayTasks(userId: string): Promise<Task[]>;
  getTasksByPriority(userId: string, priority: Priority): Promise<Task[]>;
  searchTasks(userId: string, query: string): Promise<Task[]>;

  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Streak operations
  getStreaks(userId: string): Promise<Streak[]>;
  createStreak(streak: InsertStreak): Promise<Streak>;
  getStreakByDate(userId: string, date: Date): Promise<Streak | undefined>;
  getCurrentStreak(userId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private projects: Map<string, Project>;
  private streaks: Map<string, Streak>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.projects = new Map();
    this.streaks = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create a default user
    const defaultUserId = randomUUID();
    const defaultUser: User = {
      id: defaultUserId,
      username: "demo",
      email: "demo@tasksahead.com",
      password: "demo123",
      currentStreak: 7,
      longestStreak: 15,
      totalTasksCompleted: 42,
      simpleMode: false,
      theme: "light",
      createdAt: new Date(),
    };
    this.users.set(defaultUserId, defaultUser);

    // Create default projects
    const personalProject: Project = {
      id: randomUUID(),
      name: "Personal",
      color: "#3b82f6",
      userId: defaultUserId,
      createdAt: new Date(),
    };
    const workProject: Project = {
      id: randomUUID(),
      name: "Work",
      color: "#ef4444",
      userId: defaultUserId,
      createdAt: new Date(),
    };
    const homeProject: Project = {
      id: randomUUID(),
      name: "Home",
      color: "#22c55e",
      userId: defaultUserId,
      createdAt: new Date(),
    };

    this.projects.set(personalProject.id, personalProject);
    this.projects.set(workProject.id, workProject);
    this.projects.set(homeProject.id, homeProject);

    // Create sample tasks
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const sampleTasks: Task[] = [
      {
        id: randomUUID(),
        title: "Complete quarterly report",
        description: "Finish Q4 performance analysis and submit to management",
        completed: false,
        priority: "high",
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        dueTime: "17:00",
        tags: ["work", "urgent"],
        projectId: workProject.id,
        userId: defaultUserId,
        overdue: true,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Call dentist for appointment",
        description: "",
        completed: false,
        priority: "medium",
        dueDate: yesterday,
        dueTime: "10:00",
        tags: ["health"],
        projectId: personalProject.id,
        userId: defaultUserId,
        overdue: true,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Review presentation slides",
        description: "Final review before tomorrow's client meeting",
        completed: false,
        priority: "high",
        dueDate: now,
        dueTime: "18:00",
        tags: ["presentation", "work"],
        projectId: workProject.id,
        userId: defaultUserId,
        overdue: false,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Grocery shopping",
        description: "",
        completed: false,
        priority: "medium",
        dueDate: now,
        dueTime: "20:00",
        tags: ["shopping"],
        projectId: personalProject.id,
        userId: defaultUserId,
        overdue: false,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Water plants",
        description: "",
        completed: true,
        priority: "low",
        dueDate: now,
        dueTime: "14:30",
        tags: ["routine"],
        projectId: homeProject.id,
        userId: defaultUserId,
        overdue: false,
        completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleTasks.forEach(task => this.tasks.set(task.id, task));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      currentStreak: 0,
      longestStreak: 0,
      totalTasksCompleted: 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const task: Task = {
      ...insertTask,
      id,
      completed: false,
      overdue: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    // Check if task is overdue
    if (task.dueDate && new Date(task.dueDate) < now) {
      task.overdue = true;
    }

    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { 
      ...task, 
      ...updates, 
      updatedAt: new Date()
    };

    // Handle completion
    if (updates.completed === true && !task.completed) {
      updatedTask.completedAt = new Date();
    } else if (updates.completed === false) {
      updatedTask.completedAt = null;
    }

    // Check overdue status
    if (updatedTask.dueDate && new Date(updatedTask.dueDate) < new Date() && !updatedTask.completed) {
      updatedTask.overdue = true;
    } else {
      updatedTask.overdue = false;
    }

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.projectId === projectId);
  }

  async getOverdueTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId && task.overdue && !task.completed);
  }

  async getTodayTasks(userId: string): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return Array.from(this.tasks.values())
      .filter(task => {
        if (task.userId !== userId) return false;
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      });
  }

  async getTasksByPriority(userId: string, priority: Priority): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId && task.priority === priority);
  }

  async searchTasks(userId: string, query: string): Promise<Task[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tasks.values())
      .filter(task => 
        task.userId === userId && (
          task.title.toLowerCase().includes(lowercaseQuery) ||
          task.description?.toLowerCase().includes(lowercaseQuery) ||
          task.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        )
      );
  }

  // Project operations
  async getProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Streak operations
  async getStreaks(userId: string): Promise<Streak[]> {
    return Array.from(this.streaks.values())
      .filter(streak => streak.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createStreak(insertStreak: InsertStreak): Promise<Streak> {
    const id = randomUUID();
    const streak: Streak = {
      ...insertStreak,
      id,
      createdAt: new Date(),
    };
    this.streaks.set(id, streak);
    return streak;
  }

  async getStreakByDate(userId: string, date: Date): Promise<Streak | undefined> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return Array.from(this.streaks.values())
      .find(streak => {
        if (streak.userId !== userId) return false;
        const streakDate = new Date(streak.date);
        streakDate.setHours(0, 0, 0, 0);
        return streakDate.getTime() === targetDate.getTime();
      });
  }

  async getCurrentStreak(userId: string): Promise<number> {
    const user = this.users.get(userId);
    return user?.currentStreak || 0;
  }
}

export const storage = new MemStorage();
