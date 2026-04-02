import Layout from "@/components/layout";
import { useLocation } from "wouter";
import { useGetLesson, getGetLessonQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Printer, FileText, Pencil } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface LessonPreviewProps {
  id: number;
}

function Section({ title, content }: { title: string; content?: string | null }) {
  if (!content) return null;
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1">{title}</h3>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

export default function LessonPreviewPage({ id }: LessonPreviewProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: lesson, isLoading } = useGetLesson(id, {
    query: { enabled: !!id, queryKey: getGetLessonQueryKey(id) },
  });

  function handlePrint() {
    window.print();
  }

  function handleDocx() {
    toast({ title: "DOCX export coming soon", description: "PDF export via print is available now." });
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Lesson not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={() => setLocation(`/lessons/${id}`)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Editor
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setLocation(`/lessons/${id}`)}
            >
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDocx}
              data-testid="button-export-docx"
            >
              <FileText className="w-4 h-4" /> Export DOCX
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={handlePrint}
              data-testid="button-export-pdf"
            >
              <Printer className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none">
          <div className="bg-primary px-8 py-6 print:bg-slate-800">
            <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">{lesson.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="text-primary-foreground/80 text-sm">Subject: {lesson.subject}</span>
              <span className="text-primary-foreground/80 text-sm">Grade {lesson.gradeLevel}</span>
              <span className="text-primary-foreground/80 text-sm">{lesson.duration} minutes</span>
              <span className="text-primary-foreground/80 text-sm capitalize">{lesson.status}</span>
            </div>
            <p className="text-primary-foreground/60 text-xs mt-2">
              Last updated {format(new Date(lesson.updatedAt), "MMMM d, yyyy")}
            </p>
          </div>

          <div className="px-8 py-6">
            <Section title="Learning Objectives" content={lesson.learningObjectives} />
            <Section title="Materials" content={lesson.materials} />
            <Section title="Lesson Sequence" content={lesson.lessonSequence} />
            <Section title="Assessment" content={lesson.assessment} />
            <Section title="Curriculum Alignment" content={lesson.curriculumOutcomes} />

            {(lesson.differentiationSupports || lesson.differentiationExtensions || lesson.differentiationAccommodations || lesson.engagementStrategies) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">
                  Differentiation Planner
                </h3>
                {lesson.differentiationSupports && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Supports</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lesson.differentiationSupports}</p>
                  </div>
                )}
                {lesson.differentiationExtensions && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Extensions</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lesson.differentiationExtensions}</p>
                  </div>
                )}
                {lesson.differentiationAccommodations && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Accommodations</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lesson.differentiationAccommodations}</p>
                  </div>
                )}
                {lesson.engagementStrategies && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Engagement Strategies</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lesson.engagementStrategies}</p>
                  </div>
                )}
              </div>
            )}

            <Section title="Reflection Notes" content={lesson.reflectionNotes} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
