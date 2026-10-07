import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ title, value, hint, icon: Icon }: { title: string; value: React.ReactNode; hint?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <Card size="sm">
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

// A titled box for a list or chart on a dashboard.
export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
