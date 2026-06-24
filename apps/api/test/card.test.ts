import assert from "node:assert/strict";
import test from "node:test";
import { isCardExpired, isLuhnValid, paymentCardSchema } from "../src/shared/card.js";

test("accepts a valid demo card and normalizes separators", () => {
  const result = paymentCardSchema.safeParse({
    number: "4242 4242 4242 4242",
    holder: "TEST USER",
    expMonth: "12",
    expYear: "99",
    cvc: "123"
  });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.number, "4242424242424242");
});

test("rejects non-digits and invalid checksum", () => {
  assert.equal(isLuhnValid("4242424242424242"), true);
  assert.equal(isLuhnValid("4242424242424241"), false);

  const result = paymentCardSchema.safeParse({
    number: "abcdefghijkl",
    holder: "TEST USER",
    expMonth: "12",
    expYear: "99",
    cvc: "123"
  });

  assert.equal(result.success, false);
});

test("returns a clear message for an invalid checksum", () => {
  const result = paymentCardSchema.safeParse({
    number: "2200456798761234",
    holder: "TEST USER",
    expMonth: "12",
    expYear: "99",
    cvc: "123"
  });

  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.error.issues[0]?.message, "Проверьте номер карты");
});

test("detects an expired card", () => {
  assert.equal(isCardExpired("05", "26", new Date("2026-06-01T00:00:00Z")), true);
  assert.equal(isCardExpired("06", "26", new Date("2026-06-01T00:00:00Z")), false);
});
