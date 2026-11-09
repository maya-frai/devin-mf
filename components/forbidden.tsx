import type { User } from "@/core/users";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Forbidden({ user, action }: { user: User; action: string }) {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Not permitted</CardTitle>
        <CardDescription>
          {user.name} ({user.role}) does not have <code>{action}</code>. Switch user in the header,
          or change the policy in <code>core/permissions.ts</code>.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
