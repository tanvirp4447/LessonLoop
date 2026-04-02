import { Router, type IRouter } from "express";
import { db, templatesTable, lessonsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UseTemplateParams } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/templates", async (_req, res): Promise<void> => {
  const templates = await db.select().from(templatesTable);
  res.json(
    templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      subject: t.subject,
      gradeLevel: t.gradeLevel,
      isBuiltIn: t.isBuiltIn,
    }))
  );
});

router.post("/templates/:id/use", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = UseTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, params.data.id));
  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  const [lesson] = await db
    .insert(lessonsTable)
    .values({
      userId,
      title: `${template.name} — ${template.gradeLevel}`,
      subject: template.subject,
      gradeLevel: template.gradeLevel,
      duration: 60,
      status: "draft",
      learningObjectives: template.learningObjectives,
      materials: template.materials,
      lessonSequence: template.lessonSequence,
      assessment: template.assessment,
      curriculumOutcomes: template.curriculumOutcomes,
      differentiationSupports: template.differentiationSupports,
      differentiationExtensions: template.differentiationExtensions,
      differentiationAccommodations: template.differentiationAccommodations,
      engagementStrategies: template.engagementStrategies,
    })
    .returning();

  res.status(201).json({
    id: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    gradeLevel: lesson.gradeLevel,
    duration: lesson.duration,
    status: lesson.status,
    updatedAt: lesson.updatedAt,
    createdAt: lesson.createdAt,
  });
});

export default router;
