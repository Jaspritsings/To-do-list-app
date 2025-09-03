import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertProjectSchema, type Priority, PRIORITY_LEVELS, STREAK_BADGES } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = Array.from((storage as any).users.keys())[0]; // Get first user ID

  // Tasks endpoints
  app.get("/api/tasks", async (req, res) => {
    try {
      const { filter, priority, search } = req.query;
      let tasks;

      if (search && typeof search === 'string') {
        tasks = await storage.searchTasks(DEFAULT_USER_ID, search);
      } else if (priority && typeof priority === 'string' && PRIORITY_LEVELS.includes(priority as Priority)) {
        tasks = await storage.getTasksByPriority(DEFAULT_USER_ID, priority as Priority);
      } else if (filter === 'overdue') {
        tasks = await storage.getOverdueTasks(DEFAULT_USER_ID);
      } else if (filter === 'today') {
        tasks = await storage.getTodayTasks(DEFAULT_USER_ID);
      } else {
        tasks = await storage.getTasks(DEFAULT_USER_ID);
      }

      // Get projects for each task
      const projects = await storage.getProjects(DEFAULT_USER_ID);
      const projectsMap = new Map(projects.map(p => [p.id, p]));

      const tasksWithProjects = tasks.map(task => ({
        ...task,
        project: task.projectId ? projectsMap.get(task.projectId) : null
      }));

      res.json(tasksWithProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedTask = insertTaskSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const task = await storage.createTask(validatedTask);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const task = await storage.updateTask(id, updates);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Update streak if task was completed
      if (updates.completed === true) {
        const user = await storage.getUser(DEFAULT_USER_ID);
        if (user) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayStreak = await storage.getStreakByDate(DEFAULT_USER_ID, today);
          if (todayStreak) {
            await storage.createStreak({
              userId: DEFAULT_USER_ID,
              date: today,
              tasksCompleted: todayStreak.tasksCompleted + 1,
              streakDay: user.currentStreak + 1,
              badgeEarned: STREAK_BADGES[user.currentStreak + 1 as keyof typeof STREAK_BADGES]?.name || null
            });
          } else {
            const newStreak = user.currentStreak + 1;
            await storage.createStreak({
              userId: DEFAULT_USER_ID,
              date: today,
              tasksCompleted: 1,
              streakDay: newStreak,
              badgeEarned: STREAK_BADGES[newStreak as keyof typeof STREAK_BADGES]?.name || null
            });
            
            await storage.updateUser(DEFAULT_USER_ID, {
              currentStreak: newStreak,
              longestStreak: Math.max(user.longestStreak, newStreak),
              totalTasksCompleted: user.totalTasksCompleted + 1
            });
          }
        }
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects(DEFAULT_USER_ID);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedProject = insertProjectSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const project = await storage.createProject(validatedProject);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  });

  // User/Stats endpoints
  app.get("/api/user/stats", async (req, res) => {
    try {
      const user = await storage.getUser(DEFAULT_USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const tasks = await storage.getTasks(DEFAULT_USER_ID);
      const overdueTasks = await storage.getOverdueTasks(DEFAULT_USER_ID);
      const todayTasks = await storage.getTodayTasks(DEFAULT_USER_ID);

      const stats = {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalTasksCompleted: user.totalTasksCompleted,
        totalTasks: tasks.length,
        overdueTasks: overdueTasks.length,
        todayTasks: todayTasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        currentBadge: user.currentStreak > 0 ? STREAK_BADGES[user.currentStreak as keyof typeof STREAK_BADGES] : null
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.put("/api/user/settings", async (req, res) => {
    try {
      const { theme, simpleMode } = req.body;
      const user = await storage.updateUser(DEFAULT_USER_ID, {
        theme,
        simpleMode
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  // Streak endpoints
  app.get("/api/streaks", async (req, res) => {
    try {
      const streaks = await storage.getStreaks(DEFAULT_USER_ID);
      res.json(streaks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streaks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
