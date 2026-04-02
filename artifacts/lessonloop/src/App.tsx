import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import LessonsPage from "@/pages/lessons";
import LessonEditorPage from "@/pages/lesson-editor";
import LessonPreviewPage from "@/pages/lesson-preview";
import TemplatesPage from "@/pages/templates";
import { useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error: unknown) => {
        const err = error as { status?: number };
        if (err?.status === 401) return false;
        return count < 2;
      },
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/">
        <AuthGuard>
          <DashboardPage />
        </AuthGuard>
      </Route>
      <Route path="/lessons">
        <AuthGuard>
          <LessonsPage />
        </AuthGuard>
      </Route>
      <Route path="/lessons/new">
        <AuthGuard>
          <LessonEditorPage />
        </AuthGuard>
      </Route>
      <Route path="/lessons/:id/preview">
        {(params) => (
          <AuthGuard>
            <LessonPreviewPage id={Number(params.id)} />
          </AuthGuard>
        )}
      </Route>
      <Route path="/lessons/:id">
        {(params) => (
          <AuthGuard>
            <LessonEditorPage id={Number(params.id)} />
          </AuthGuard>
        )}
      </Route>
      <Route path="/templates">
        <AuthGuard>
          <TemplatesPage />
        </AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
