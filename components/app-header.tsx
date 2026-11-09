import { BRANDS } from "@/config/brand";
import { resetData } from "@/core/actions";
import { can } from "@/core/permissions";
import { getCurrentBrand, getCurrentUser, getTerms } from "@/core/session";
import { USERS } from "@/core/users";
import { Button } from "@/components/ui/button";
import { BrandSwitcher } from "./brand-switcher";
import { RoleSwitcher } from "./role-switcher";

export async function AppHeader() {
  const [user, brand, terms] = await Promise.all([getCurrentUser(), getCurrentBrand(), getTerms()]);
  return (
    <header className="flex items-center justify-end gap-3 border-b bg-card px-6 py-3">
      {can(user, "brand.switch") ? <BrandSwitcher brands={BRANDS.map(({ id, name }) => ({ id, name }))} current={brand.id} label={terms.brand} /> : null}
      <form action={resetData}>
        <Button type="submit" variant="outline" size="sm">{terms.resetData}</Button>
      </form>
      <RoleSwitcher users={USERS} currentId={user.id} label={terms.signedInAs} />
    </header>
  );
}
