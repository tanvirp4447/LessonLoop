import { Router, type IRouter } from "express";
import { db, lessonsTable } from "@workspace/db";
import { eq, and, ilike, desc } from "drizzle-orm";
import {
  CreateLessonBody,
  UpdateLessonBody,
  GetLessonParams,
  UpdateLessonParams,
  DeleteLessonParams,
  DuplicateLessonParams,
  ArchiveLessonParams,
  ListLessonsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

function lessonToResponse(lesson: any) {
  return {
    id: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    gradeLevel: lesson.gradeLevel,
    duration: lesson.duration,
    status: lesson.status,
    learningObjectives: lesson.learningObjectives,
    materials: lesson.materials,
    lessonSequence: lesson.lessonSequence,
    assessment: lesson.assessment,
    curriculumOutcomes: lesson.curriculumOutcomes,
    differentiationSupports: lesson.differentiationSupports,
    differentiationExtensions: lesson.differentiationExtensions,
    differentiationAccommodations: lesson.differentiationAccommodations,
    engagementStrategies: lesson.engagementStrategies,
    reflectionNotes: lesson.reflectionNotes,
    updatedAt: lesson.updatedAt,
    createdAt: lesson.createdAt,
  };
}

router.get("/lessons", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = ListLessonsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, subject, search } = parsed.data;
  const conditions: any[] = [eq(lessonsTable.userId, userId)];

  if (status) conditions.push(eq(lessonsTable.status, status));
  if (subject) conditions.push(eq(lessonsTable.subject, subject));
  if (search) conditions.push(ilike(lessonsTable.title, `%${search}%`));

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(and(...conditions))
    .orderBy(desc(lessonsTable.updatedAt));

  res.json(lessons.map(lessonToResponse));
});

router.post("/lessons", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = CreateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lesson] = await db
    .insert(lessonsTable)
    .values({ ...parsed.data, userId, status: parsed.data.status ?? "draft" })
    .returning();

  res.status(201).json(lessonToResponse(lesson));
});

router.get("/lessons/:id", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = GetLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(and(eq(lessonsTable.id, params.data.id), eq(lessonsTable.userId, userId)));

  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.json(lessonToResponse(lesson));
});

router.put("/lessons/:id", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = UpdateLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lesson] = await db
    .update(lessonsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(lessonsTable.id, params.data.id), eq(lessonsTable.userId, userId)))
    .returning();

  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.json(lessonToResponse(lesson));
});

router.delete("/lessons/:id", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = DeleteLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(lessonsTable)
    .where(and(eq(lessonsTable.id, params.data.id), eq(lessonsTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.json({ message: "Lesson deleted" });
});

router.post("/lessons/:id/duplicate", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = DuplicateLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [original] = await db
    .select()
    .from(lessonsTable)
    .where(and(eq(lessonsTable.id, params.data.id), eq(lessonsTable.userId, userId)));

  if (!original) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = original;
  const [copy] = await db
    .insert(lessonsTable)
    .values({ ...rest, title: `${original.title} (Copy)`, status: "draft" })
    .returning();

  res.status(201).json(lessonToResponse(copy));
});

router.post("/lessons/:id/archive", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = ArchiveLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [current] = await db
    .select()
    .from(lessonsTable)
    .where(and(eq(lessonsTable.id, params.data.id), eq(lessonsTable.userId, userId)));

  if (!current) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const newStatus = current.status === "archived" ? "draft" : "archived";
  const [updated] = await db
    .update(lessonsTable)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(lessonsTable.id, params.data.id))
    .returning();

  res.json(lessonToResponse(updated));
});

export default router;
