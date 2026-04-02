import Layout from "@/components/layout";
import { Link } from "wouter";
import {
  useGetDashboardSummary,
  useGetRecentLessons,
  useGetLessonsBySubject,
  useGetMe,
  getGetDashboardSummaryQueryKey,
  getGetRecentLessonsQueryKey,
  getGetLessonsBySubjectQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, BookOpen, Clock, CheckCircle, Archive, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  if (status === "complete") return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Complete</Badge>;
  if (status === "archived") return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Archived</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Draft</Badge>;
}

export default function DashboardPage() {
  const { data: user } = useGetMe({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });
  const { data: recent, isLoading: recentLoading } = useGetRecentLessons({
    query: { queryKey: getGetRecentLessonsQueryKey() },
  });
  const { data: bySubject, isLoading: subjectLoading } = useGetLessonsBySubject({
    query: { queryKey: getGetLessonsBySubjectQueryKey() },
  });

  const firstName = (user as { name?: string })?.name?.split(" ")[0] ?? "Teacher";

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Here's what's happening with your lesson plans</p>
          </div>
          <Link href="/lessons/new">
            <Button className="gap-2" data-testid="button-create-lesson-main">
              <Plus className="w-4 h-4" />
              Create Lesson
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl p-5">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-card border border-card-border rounded-xl p-5" data-testid="stat-total">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  Total Lessons
                </div>
                <div className="text-3xl font-bold text-foreground">{summary?.totalLessons ?? 0}</div>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-5" data-testid="stat-drafts">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  Drafts
                </div>
                <div className="text-3xl font-bold text-blue-600">{summary?.drafts ?? 0}</div>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-5" data-testid="stat-complete">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Complete
                </div>
                <div className="text-3xl font-bold text-green-600">{summary?.complete ?? 0}</div>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-5" data-testid="stat-archived">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
                  <Archive className="w-3.5 h-3.5" />
                  Archived
                </div>
                <div className="text-3xl font-bold text-muted-foreground">{summary?.archived ?? 0}</div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground text-sm">Recent Lessons</h2>
                <Link href="/lessons">
                  <span className="text-primary text-xs hover:underline flex items-center gap-1 cursor-pointer">
                    View all <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
              {recentLoading ? (
                <div className="p-5 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : recent && recent.length > 0 ? (
                <div className="divide-y divide-border">
                  {recent.map((lesson) => (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                      <div
                        className="px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        data-testid={`lesson-recent-${lesson.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-foreground truncate">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {lesson.subject} · Grade {lesson.gradeLevel} · {lesson.duration} min ·{" "}
                              {formatDistanceToNow(new Date(lesson.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <StatusBadge status={lesson.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No lessons yet</p>
                  <Link href="/lessons/new">
                    <Button variant="link" size="sm" className="mt-2 text-primary">
                      Create your first lesson
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground text-sm">Lessons by Subject</h2>
              </div>
              {subjectLoading ? (
                <div className="p-5 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                  ))}
                </div>
              ) : bySubject && bySubject.length > 0 ? (
                <div className="p-5 space-y-2">
                  {bySubject.map((item) => (
                    <div key={item.subject} className="flex items-center justify-between" data-testid={`subject-${item.subject}`}>
                      <span className="text-sm text-foreground">{item.subject}</span>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-xs text-muted-foreground">No data yet</p>
                </div>
              )}
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground text-sm">Templates</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Start faster with {summary?.templatesAvailable ?? 0} ready-made templates
              </p>
              <Link href="/templates">
                <Button variant="outline" size="sm" className="w-full">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
