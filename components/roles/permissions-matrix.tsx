import { Check, Minus, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSIONS, ROLE_INFO, ROLE_ORDER, type Permission } from "@/lib/permissions";

function Cell({ p }: { p: Permission }) {
  if (p.access === "none") {
    return (
      <span className="text-muted-foreground" aria-label="Not allowed">
        <Minus className="size-4" />
      </span>
    );
  }
  const Icon = p.access === "full" ? Check : UserRound;
  return (
    <div className="flex items-start gap-1.5">
      <Icon className={p.access === "full" ? "mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-500" : "mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400"} />
      <span className="text-sm">
        {p.access === "full" ? "Yes" : "Own only"}
        {p.note && <span className="block text-xs text-muted-foreground">{p.note}</span>}
      </span>
    </div>
  );
}

// Read-only overview of what each role can do. The backend enforces these rules on every request.
export function PermissionsMatrix() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLE_ORDER.map((r) => (
          <Card key={r} size="sm">
            <CardHeader>
              <CardTitle>{ROLE_INFO[r].label}</CardTitle>
              <CardDescription>{ROLE_INFO[r].summary}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><Check className="size-4 text-green-600 dark:text-green-500" /> Yes</span>
        <span className="flex items-center gap-1.5"><UserRound className="size-4 text-blue-600 dark:text-blue-400" /> Only their own records</span>
        <span className="flex items-center gap-1.5"><Minus className="size-4" /> Not allowed</span>
      </div>

      {PERMISSIONS.map((m) => (
        <Card key={m.module}>
          <CardHeader>
            <CardTitle>{m.module}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-48">Action</TableHead>
                    {ROLE_ORDER.map((r) => (
                      <TableHead key={r} className="min-w-32">{ROLE_INFO[r].label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.rows.map((row) => (
                    <TableRow key={row.action}>
                      <TableCell className="font-medium whitespace-normal">{row.action}</TableCell>
                      {ROLE_ORDER.map((r) => (
                        <TableCell key={r} className="align-top whitespace-normal">
                          <Cell p={row.roles[r]} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
