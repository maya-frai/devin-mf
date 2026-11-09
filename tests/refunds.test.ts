import { beforeEach, expect, test } from "vitest";
import { getPayment } from "@/adapters/payments";
import { listApprovals } from "@/core/approvals";
import { resetStore } from "@/core/store";
import { getUser } from "@/core/users";
import { requestRefund } from "@/tools/refunds/logic";

const ana = getUser("ana")!;

beforeEach(resetStore);

test("$500.00 refunds immediately", async () => {
  expect(getPayment("pay_1005").amountCents).toBe(50_000);
  const result = await requestRefund(ana, "pay_1005", "Duplicate charge");
  expect(result.status).toBe("refunded");
  expect(getPayment("pay_1005").status).toBe("refunded");
  expect(listApprovals()).toHaveLength(0);
});

test("$500.01 needs an ops lead's approval", async () => {
  expect(getPayment("pay_1006").amountCents).toBe(50_001);
  const result = await requestRefund(ana, "pay_1006", "Duplicate charge");
  expect(result.status).toBe("pending_approval");
  expect(getPayment("pay_1006").status).toBe("settled");
  expect(listApprovals()[0]).toMatchObject({ permission: "refunds.approve", requestedBy: "ana" });
});
