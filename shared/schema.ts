import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  simpleMode: boolean("simple_mode").default(false),
  theme: varchar("theme", { length: 10 }).default("light"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  priority: varchar("priority", { length: 10 }).default("medium"), // low, medium, high
  dueDate: timestamp("due_date"),
  dueTime: text("due_time"), // stored as HH:MM format
  tags: text("tags").array().default([]),
  projectId: varchar("project_id").references(() => projects.id),
  userId: varchar("user_id").references(() => users.id),
  overdue: boolean("overdue").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  date: timestamp("date").notNull(),
  tasksCompleted: integer("tasks_completed").default(0),
  streakDay: integer("streak_day").notNull(),
  badgeEarned: text("badge_earned"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  currentStreak: true,
  longestStreak: true,
  totalTasksCompleted: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  completed: true,
  overdue: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStreakSchema = createInsertSchema(streaks).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Streak = typeof streaks.$inferSelect;

export const PRIORITY_LEVELS = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITY_LEVELS)[number];

export const STREAK_BADGES = {
  1: { name: "Trailblazer", emoji: "🚀" },
  4: { name: "Consistent", emoji: "📍" },
  7: { name: "Warrior of the Week", emoji: "⚔" },
  14: { name: "Momentum Builder", emoji: "🔥" },
  21: { name: "Unstoppable", emoji: "⚡" },
  28: { name: "Elite", emoji: "🏆" },
  60: { name: "Momentum Master", emoji: "🎯" },
  120: { name: "Champion", emoji: "🥇" },
  180: { name: "The Iron Mind", emoji: "🛡" },
  365: { name: "The Invincible", emoji: "👑" },
} as const;
