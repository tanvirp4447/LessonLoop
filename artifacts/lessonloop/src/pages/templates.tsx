import Layout from "@/components/layout";
import { useLocation } from "wouter";
import {
  useListTemplates,
  useUseTemplate,
  getListTemplatesQueryKey,
  getListLessonsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentLessonsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: templates, isLoading } = useListTemplates({
    query: { queryKey: getListTemplatesQueryKey() },
  });

  const useTemplate = useUseTemplate({
    mutation: {
      onSuccess: (lesson) => {
        toast({ title: "Lesson created from template" });
        queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentLessonsQueryKey() });
        setLocation(`/lessons/${lesson.id}`);
      },
    },
  });

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Templates</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Start from a ready-made structure to plan faster
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl p-6">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-9 w-28" />
              </div>
            ))}
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/40 transition-colors"
                data-testid={`template-card-${template.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{template.name}</h3>
                  </div>
                  {template.isBuiltIn && (
                    <Badge variant="secondary" className="text-xs">Built-in</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{template.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {template.subject}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    Grade {template.gradeLevel}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => useTemplate.mutate({ id: template.id })}
                  disabled={useTemplate.isPending}
                  data-testid={`button-use-template-${template.id}`}
                >
                  Use Template <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl py-16 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No templates available</p>
            <p className="text-xs text-muted-foreground mt-1">Check back soon</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
