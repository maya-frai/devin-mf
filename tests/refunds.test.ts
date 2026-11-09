import { beforeEach, expect, test } from "vitest";
import { getPayment } from "@/adapters/payments";
import { listApprovals, pendingApprovalFor } from "@/core/approvals";
import { resetStore } from "@/core/store";
import { getUser } from "@/core/users";
import { refundedToday, requestRefund } from "@/tools/refunds/logic";

const ana = getUser("ana")!;
const refund = (paymentId: string, reason = "Duplicate charge") => requestRefund(ana, { paymentId, reason });

beforeEach(resetStore);

test("$500.00 refunds immediately", async () => {
  expect(getPayment("pay_1005").amountCents).toBe(50_000);
  const result = await refund("pay_1005");
  expect(result.status).toBe("refunded");
  expect(getPayment("pay_1005").status).toBe("refunded");
  expect(pendingApprovalFor("payments/pay_1005")).toBeUndefined();
});

test("$500.01 needs an ops lead's approval", async () => {
  expect(getPayment("pay_1006").amountCents).toBe(50_001);
  const result = await refund("pay_1006");
  expect(result.status).toBe("pending_approval");
  expect(getPayment("pay_1006").status).toBe("settled");
  expect(listApprovals()[0]).toMatchObject({ permission: "refunds.approve", requestedBy: "ana" });
});

test("an analyst's instant refunds stop at $2,000 a day", async () => {
  for (const id of ["pay_1005", "pay_1016", "pay_1021", "pay_1010", "pay_1024"]) {
    expect((await refund(id, "Customer request")).status).toBe("refunded");
  }
  expect(refundedToday(ana)).toBe(188_500);
  const result = await refund("pay_1015", "Customer request"); // $187.50 would make $2,072.50
  expect(result).toMatchObject({ status: "pending_approval", overDailyLimit: true });
});
