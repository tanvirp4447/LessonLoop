import { Router, type IRouter } from "express";
import { db, lessonsTable, templatesTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [{ total }] = await db
    .select({ total: count() })
    .from(lessonsTable)
    .where(eq(lessonsTable.userId, userId));

  const [{ drafts }] = await db
    .select({ drafts: count() })
    .from(lessonsTable)
    .where(and(eq(lessonsTable.userId, userId), eq(lessonsTable.status, "draft")));

  const [{ complete }] = await db
    .select({ complete: count() })
    .from(lessonsTable)
    .where(and(eq(lessonsTable.userId, userId), eq(lessonsTable.status, "complete")));

  const [{ archived }] = await db
    .select({ archived: count() })
    .from(lessonsTable)
    .where(and(eq(lessonsTable.userId, userId), eq(lessonsTable.status, "archived")));

  const [{ templates }] = await db.select({ templates: count() }).from(templatesTable);

  res.json({
    totalLessons: Number(total),
    drafts: Number(drafts),
    complete: Number(complete),
    archived: Number(archived),
    templatesAvailable: Number(templates),
  });
});

router.get("/dashboard/recent", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.userId, userId))
    .orderBy(desc(lessonsTable.updatedAt))
    .limit(5);

  res.json(
    lessons.map((l) => ({
      id: l.id,
      title: l.title,
      subject: l.subject,
      gradeLevel: l.gradeLevel,
      duration: l.duration,
      status: l.status,
      updatedAt: l.updatedAt,
      createdAt: l.createdAt,
    }))
  );
});

router.get("/dashboard/by-subject", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const rows = await db
    .select({ subject: lessonsTable.subject, count: count() })
    .from(lessonsTable)
    .where(eq(lessonsTable.userId, userId))
    .groupBy(lessonsTable.subject)
    .orderBy(desc(count()));

  res.json(rows.map((r) => ({ subject: r.subject, count: Number(r.count) })));
});

export default router;
