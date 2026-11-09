import { beforeEach, expect, test } from "vitest";
import { approve, listApprovals } from "@/core/approvals";
import { resetStore } from "@/core/store";
import { getUser } from "@/core/users";
import { requestRefund } from "@/tools/refunds/logic";

const luis = getUser("luis")!;

beforeEach(resetStore);

test("self-approval is blocked", async () => {
  const result = await requestRefund(luis, "pay_1003", "Customer dispute"); // $899.00
  expect(result.status).toBe("pending_approval");
  if (result.status !== "pending_approval") return;

  expect(() => approve(luis, result.approvalId)).toThrow("You can't approve your own request");
  expect(listApprovals()[0].status).toBe("pending");
});
