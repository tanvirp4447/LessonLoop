import { useState } from "react";
import Layout from "@/components/layout";
import { Link, useLocation } from "wouter";
import {
  useListLessons,
  useDeleteLesson,
  useDuplicateLesson,
  useArchiveLesson,
  getListLessonsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentLessonsQueryKey,
  getGetLessonsBySubjectQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, MoreHorizontal, Pencil, Copy, Archive, Trash2, Eye, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

function StatusBadge({ status }: { status: string }) {
  if (status === "complete") return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Complete</Badge>;
  if (status === "archived") return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Archived</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Draft</Badge>;
}

export default function LessonsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = {
    search: search || undefined,
    status: (statusFilter !== "all" ? statusFilter : undefined) as "draft" | "complete" | "archived" | undefined,
  };

  const { data: lessons, isLoading } = useListLessons(params, {
    query: { queryKey: getListLessonsQueryKey(params) },
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentLessonsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLessonsBySubjectQueryKey() });
  }

  const deleteLesson = useDeleteLesson({
    mutation: {
      onSuccess: () => {
        toast({ title: "Lesson deleted" });
        invalidateAll();
        setDeleteId(null);
      },
    },
  });

  const duplicate = useDuplicateLesson({
    mutation: {
      onSuccess: (lesson) => {
        toast({ title: "Lesson duplicated" });
        invalidateAll();
        setLocation(`/lessons/${lesson.id}`);
      },
    },
  });

  const archive = useArchiveLesson({
    mutation: {
      onSuccess: () => {
        toast({ title: "Lesson archived" });
        invalidateAll();
      },
    },
  });

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Lessons</h1>
            <p className="text-muted-foreground text-sm mt-0.5">All your lesson plans in one place</p>
          </div>
          <Link href="/lessons/new">
            <Button className="gap-2" data-testid="button-new-lesson">
              <Plus className="w-4 h-4" />
              New Lesson
            </Button>
          </Link>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="select-status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : lessons && lessons.length > 0 ? (
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-card border border-card-border rounded-xl px-5 py-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                data-testid={`lesson-row-${lesson.id}`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lesson.subject} · Grade {lesson.gradeLevel} · {lesson.duration} min ·{" "}
                      {formatDistanceToNow(new Date(lesson.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <StatusBadge status={lesson.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8" data-testid={`menu-lesson-${lesson.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setLocation(`/lessons/${lesson.id}`)}>
                        <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation(`/lessons/${lesson.id}/preview`)}>
                        <Eye className="w-3.5 h-3.5 mr-2" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicate.mutate({ id: lesson.id })}>
                        <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archive.mutate({ id: lesson.id })}>
                        <Archive className="w-3.5 h-3.5 mr-2" />
                        {lesson.status === "archived" ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(lesson.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl py-16 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No lessons found</p>
            <p className="text-xs text-muted-foreground mb-4">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first lesson to get started"}
            </p>
            {!search && statusFilter === "all" && (
              <Link href="/lessons/new">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Lesson
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The lesson plan will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && deleteLesson.mutate({ id: deleteId })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
