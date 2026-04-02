import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level").notNull(),
  duration: integer("duration").notNull().default(60),
  status: text("status").notNull().default("draft"),
  learningObjectives: text("learning_objectives"),
  materials: text("materials"),
  lessonSequence: text("lesson_sequence"),
  assessment: text("assessment"),
  curriculumOutcomes: text("curriculum_outcomes"),
  differentiationSupports: text("differentiation_supports"),
  differentiationExtensions: text("differentiation_extensions"),
  differentiationAccommodations: text("differentiation_accommodations"),
  engagementStrategies: text("engagement_strategies"),
  reflectionNotes: text("reflection_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
