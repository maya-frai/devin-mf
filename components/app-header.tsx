import { resetData } from "@/core/actions";
import { getCurrentUser } from "@/core/session";
import { USERS } from "@/core/users";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "./role-switcher";

export async function AppHeader() {
  const user = await getCurrentUser();
  return (
    <header className="flex items-center justify-end gap-3 border-b bg-background px-6 py-3">
      <form action={resetData}>
        <Button type="submit" variant="outline" size="sm">
          Reset demo data
        </Button>
      </form>
      <RoleSwitcher users={USERS} currentId={user.id} />
    </header>
  );
}
