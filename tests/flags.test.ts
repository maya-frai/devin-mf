import { beforeEach, expect, test } from "vitest";
import { listApprovals } from "@/core/approvals";
import { getRow, resetStore } from "@/core/store";
import { getUser } from "@/core/users";
import { setFlag, type Flag } from "@/tools/flags/logic";

const eli = getUser("eli")!;

beforeEach(resetStore);

test("prod flag change creates an approval instead of applying", () => {
  const before = getRow<Flag>("flags", "flag_02").prod;
  const result = setFlag(eli, "flag_02", "prod", !before, "Ready to ship");

  expect(result.status).toBe("pending_approval");
  expect(getRow<Flag>("flags", "flag_02").prod).toBe(before);
  expect(listApprovals()[0]).toMatchObject({
    action: "flags.prod_change",
    target: "flags/flag_02/prod",
    status: "pending",
    requestedBy: "eli",
  });
});
