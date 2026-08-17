import { describe, expect, it } from "vitest";
import { asCharacterId } from "@/catalog";
import { MASTER_LEVEL_MIN } from "./build";
import { defaultWeapon, resolveWeapon } from "./weapons";

const IO = asCharacterId("io")!;

const unboundMaster = (masterLevel: number) =>
  resolveWeapon(IO, defaultWeapon(IO), masterLevel).slots.find(
    (slot) => slot.trait === "unbound-master",
  );

describe("resolveWeapon", () => {
  it("levels Unbound Master off the master level", () => {
    expect(unboundMaster(MASTER_LEVEL_MIN)?.level).toBe(MASTER_LEVEL_MIN);
    expect(unboundMaster(55)?.level).toBe(55);
  });

  it("leaves the other Terminus slots on their own ladders", () => {
    const slots = resolveWeapon(IO, defaultWeapon(IO), 55).slots;
    expect(slots.map((slot) => slot.level)).toEqual([35, 25, 15, 1, 55]);
  });
});
