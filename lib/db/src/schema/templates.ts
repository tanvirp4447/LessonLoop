import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level").notNull(),
  isBuiltIn: boolean("is_built_in").notNull().default(false),
  learningObjectives: text("learning_objectives"),
  materials: text("materials"),
  lessonSequence: text("lesson_sequence"),
  assessment: text("assessment"),
  curriculumOutcomes: text("curriculum_outcomes"),
  differentiationSupports: text("differentiation_supports"),
  differentiationExtensions: text("differentiation_extensions"),
  differentiationAccommodations: text("differentiation_accommodations"),
  engagementStrategies: text("engagement_strategies"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({ id: true, createdAt: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;
