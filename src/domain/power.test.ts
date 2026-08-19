import { describe, expect, it } from "vitest";
import { POWER } from "@/catalog";
import { attenuate } from "./power";

// Nenkai's worked example pins the bands as cumulative breakpoints.
// https://nenkai.github.io/relink-modding/resources/re/mechanics/pwr_power/
describe("attenuation", () => {
  it("reproduces Nenkai's Seofon example", () => {
    expect(Math.round(attenuate(4, 20511))).toBe(3971);
    expect(Math.round(attenuate(5, 45000))).toBe(3450);
    expect(attenuate(7, 42189)).toBeCloseTo(8737.8, 1);
  });

  it("carries the master level board's own totals", () => {
    // skillboard_unlock, summed over all 50 rows.
    expect(POWER.masterLevel).toEqual({ hp: 6000, atk: 3000, dmgCap: 100 });
    // The four the readings pin: Io's weapon reads 500 + 50 + 45, Ferry's 100.
    expect(POWER.dmgCap["catastrophe-nova"][34]).toBe(500);
    expect(POWER.dmgCap["unbound-master"][54]).toBe(50);
    expect(POWER.dmgCap["dmg-cap"][14]).toBe(45);
    expect(POWER.dmgCap["catastrophe"][24]).toBe(100);
  });

  it("carries the adjust coefficients the example assumes", () => {
    expect(POWER.adjust[1]).toBe(10); // level
    expect(POWER.adjust[2]).toBe(5); // weapon level
    expect(POWER.adjust[3]).toBe(10); // awakening
    expect(POWER.adjust[6]).toBe(5); // trait levels
    expect(POWER.adjust[8]).toBe(35); // over-mastery rank
    expect(POWER.adjust[9]).toBe(10); // mirage munitions
    expect(POWER.adjust[10]).toBe(1); // final multiplier
  });
});
