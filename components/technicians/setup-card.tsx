import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  title: string;
  description: string;
  dirty: boolean;
  pending: boolean;
  onSave: () => void;
  children: React.ReactNode;
};

// Frame for the skills, areas and hours editors: content plus one Save button.
export function SetupCard({ title, description, dirty, pending, onSave, children }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <Button onClick={onSave} disabled={!dirty || pending} aria-busy={pending}>
          {pending && <Spinner />}
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
