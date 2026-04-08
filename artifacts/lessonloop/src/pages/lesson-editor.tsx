import { useEffect, useCallback, useState, useRef } from "react";
import Layout from "@/components/layout";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetLesson,
  useCreateLesson,
  useUpdateLesson,
  getGetLessonQueryKey,
  getListLessonsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentLessonsQueryKey,
  getGetLessonsBySubjectQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Eye, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  status: z.enum(["draft", "complete", "archived"]).default("draft"),
  learningObjectives: z.string().optional(),
  materials: z.string().optional(),
  lessonSequence: z.string().optional(),
  assessment: z.string().optional(),
  curriculumOutcomes: z.string().optional(),
  differentiationSupports: z.string().optional(),
  differentiationExtensions: z.string().optional(),
  differentiationAccommodations: z.string().optional(),
  engagementStrategies: z.string().optional(),
  reflectionNotes: z.string().optional(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonEditorProps {
  id?: number;
}

function SectionLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <FormLabel className="text-sm font-medium text-foreground">
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </FormLabel>
  );
}

export default function LessonEditorPage({ id }: LessonEditorProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [lessonId, setLessonId] = useState<number | undefined>(id);
  const isInitializedRef = useRef(false);

  const { data: lesson, isLoading } = useGetLesson(lessonId!, {
    query: {
      enabled: !!lessonId,
      queryKey: getGetLessonQueryKey(lessonId!),
    },
  });

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      subject: "",
      gradeLevel: "",
      duration: 60,
      status: "draft",
      learningObjectives: "",
      materials: "",
      lessonSequence: "",
      assessment: "",
      curriculumOutcomes: "",
      differentiationSupports: "",
      differentiationExtensions: "",
      differentiationAccommodations: "",
      engagementStrategies: "",
      reflectionNotes: "",
    },
  });

  useEffect(() => {
    if (lesson && !isInitializedRef.current) {
      isInitializedRef.current = true;
      form.reset({
        title: lesson.title,
        subject: lesson.subject,
        gradeLevel: lesson.gradeLevel,
        duration: lesson.duration,
        status: lesson.status as "draft" | "complete" | "archived",
        learningObjectives: lesson.learningObjectives ?? "",
        materials: lesson.materials ?? "",
        lessonSequence: lesson.lessonSequence ?? "",
        assessment: lesson.assessment ?? "",
        curriculumOutcomes: lesson.curriculumOutcomes ?? "",
        differentiationSupports: lesson.differentiationSupports ?? "",
        differentiationExtensions: lesson.differentiationExtensions ?? "",
        differentiationAccommodations: lesson.differentiationAccommodations ?? "",
        engagementStrategies: lesson.engagementStrategies ?? "",
        reflectionNotes: lesson.reflectionNotes ?? "",
      });
    }
  }, [lesson, form]);

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentLessonsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLessonsBySubjectQueryKey() });
  }

  const createLesson = useCreateLesson({
    mutation: {
      onSuccess: (created) => {
        setLessonId(created.id);
        invalidateAll();
        setLocation(`/lessons/${created.id}`);
      },
    },
  });

  const updateLesson = useUpdateLesson({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        toast({ title: "Lesson saved" });
      },
    },
  });

  const doSave = useCallback(
    (data: LessonFormData) => {
      if (lessonId) {
        updateLesson.mutate({ id: lessonId, data });
      } else {
        createLesson.mutate({ data });
      }
    },
    [lessonId, updateLesson, createLesson]
  );

  function onSaveNow() {
    form.handleSubmit((data) => doSave(data))();
  }

  if (lessonId && isLoading) {
    return (
      <Layout>
        <div className="p-8 max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const isSaving = createLesson.isPending || updateLesson.isPending;

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/lessons")}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {lessonId ? "Edit Lesson" : "New Lesson"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lessonId && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setLocation(`/lessons/${lessonId}/preview`)}
              >
                <Eye className="w-4 h-4" /> Preview
              </Button>
            )}
            <Button size="sm" className="gap-2" onClick={onSaveNow} disabled={isSaving} data-testid="button-save">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(doSave)} className="space-y-8">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border">
                Lesson Basics
              </h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <SectionLabel required>Lesson Title</SectionLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Introduction to Fractions"
                          data-testid="input-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel required>Subject</SectionLabel>
                        <FormControl>
                          <Input placeholder="e.g. Mathematics" data-testid="input-subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel required>Grade Level</SectionLabel>
                        <FormControl>
                          <Input placeholder="e.g. 4" data-testid="input-grade-level" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel required>Duration (minutes)</SectionLabel>
                        <FormControl>
                          <Input type="number" min={1} data-testid="input-duration" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel>Status</SectionLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border">
                Learning Objectives <span className="text-destructive">*</span>
              </h2>
              <FormField
                control={form.control}
                name="learningObjectives"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="What will students know or be able to do by the end of this lesson?"
                        className="min-h-[100px] resize-none"
                        data-testid="textarea-learning-objectives"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border">
                Materials
              </h2>
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="List all materials, resources, and technology needed for this lesson..."
                        className="min-h-[100px] resize-none"
                        data-testid="textarea-materials"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border">
                Lesson Sequence <span className="text-destructive">*</span>
              </h2>
              <p className="text-xs text-muted-foreground mb-3">Describe the introduction, development, and closure of your lesson</p>
              <FormField
                control={form.control}
                name="lessonSequence"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Introduction (hook, prior knowledge)...&#10;Development (main activities, instruction)...&#10;Closure (consolidation, exit activity)..."
                        className="min-h-[160px] resize-none"
                        data-testid="textarea-lesson-sequence"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border">
                Assessment
              </h2>
              <FormField
                control={form.control}
                name="assessment"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="How will you assess student learning during and after this lesson?"
                        className="min-h-[100px] resize-none"
                        data-testid="textarea-assessment"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border">
                Curriculum Alignment
              </h2>
              <FormField
                control={form.control}
                name="curriculumOutcomes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Curriculum outcomes or standards this lesson addresses
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. CCSS.MATH.CONTENT.4.NF.A.1 — Explain equivalence of fractions..."
                        className="min-h-[100px] resize-none"
                        data-testid="textarea-curriculum-outcomes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border">
                Differentiation Planner
              </h2>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="differentiationSupports"
                  render={({ field }) => (
                    <FormItem>
                      <SectionLabel>Supports for Struggling Learners</SectionLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Scaffolds, simplified instructions, additional support strategies..."
                          className="min-h-[90px] resize-none"
                          data-testid="textarea-supports"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="differentiationExtensions"
                  render={({ field }) => (
                    <FormItem>
                      <SectionLabel>Extensions for Advanced Learners</SectionLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Challenge tasks, enrichment activities, deeper exploration..."
                          className="min-h-[90px] resize-none"
                          data-testid="textarea-extensions"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="differentiationAccommodations"
                  render={({ field }) => (
                    <FormItem>
                      <SectionLabel>Accommodations</SectionLabel>
                      <FormControl>
                        <Textarea
                          placeholder="IEP accommodations, ELL supports, accessibility modifications..."
                          className="min-h-[90px] resize-none"
                          data-testid="textarea-accommodations"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engagementStrategies"
                  render={({ field }) => (
                    <FormItem>
                      <SectionLabel>Engagement Strategies</SectionLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Multiple means of engagement, student choice, collaborative structures..."
                          className="min-h-[90px] resize-none"
                          data-testid="textarea-engagement"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border">
                Reflection Notes
              </h2>
              <FormField
                control={form.control}
                name="reflectionNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Post-lesson reflections, what worked well, what to adjust next time..."
                        className="min-h-[100px] resize-none"
                        data-testid="textarea-reflection"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pb-8">
              {lessonId && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setLocation(`/lessons/${lessonId}/preview`)}
                >
                  <Eye className="w-4 h-4" /> Preview & Export
                </Button>
              )}
              <Button type="submit" disabled={isSaving} className="gap-2" data-testid="button-save-bottom">
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Lesson</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
