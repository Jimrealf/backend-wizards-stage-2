import { describe, it, expect } from "vitest";
import { parseQuery } from "./parser.js";

describe("parseQuery", () => {
  it("parses: male and female teenagers above 17", () => {
    expect(parseQuery("male and female teenagers above 17")).toEqual({
      age_group: "teenager",
      min_age: 17,
    });
  });

  it("parses: young males from nigeria", () => {
    expect(parseQuery("young males from nigeria")).toEqual({
      gender: "male",
      min_age: 16,
      max_age: 24,
      country_id: "NG",
    });
  });

  it("parses: young adults above 20", () => {
    expect(parseQuery("young adults above 20")).toEqual({
      age_group: "adult",
      min_age: 20,
      max_age: 24,
    });
  });

  it("parses: adult males from kenya", () => {
    expect(parseQuery("adult males from kenya")).toEqual({
      gender: "male",
      age_group: "adult",
      country_id: "KE",
    });
  });

  it("parses: females above 30", () => {
    expect(parseQuery("females above 30")).toEqual({
      gender: "female",
      min_age: 30,
    });
  });

  it("parses: people from angola", () => {
    expect(parseQuery("people from angola")).toEqual({ country_id: "AO" });
  });

  it("returns empty object for empty string", () => {
    expect(parseQuery("")).toEqual({});
  });

  it("returns empty object for gibberish", () => {
    expect(parseQuery("purple monkey dishwasher")).toEqual({});
  });

  it("drops gender when both male and female terms present", () => {
    const result = parseQuery("male and female adults");
    expect(result.gender).toBeUndefined();
    expect(result.age_group).toBe("adult");
  });

  it("preserves other filters when country is unknown", () => {
    const result = parseQuery("adults from atlantis");
    expect(result.age_group).toBe("adult");
    expect(result.country_id).toBeUndefined();
  });

  it("resolves country aliases: uk -> GB", () => {
    expect(parseQuery("people from uk").country_id).toBe("GB");
  });

  it("resolves multiword countries: south africa -> ZA", () => {
    expect(parseQuery("adults from south africa").country_id).toBe("ZA");
  });

  it("parses between bounds", () => {
    expect(parseQuery("people between 25 and 40")).toEqual({
      min_age: 25,
      max_age: 40,
    });
  });

  it("intersects young with explicit above", () => {
    const result = parseQuery("young people above 20");
    expect(result.min_age).toBe(20);
    expect(result.max_age).toBe(24);
  });

  it("handles below N", () => {
    expect(parseQuery("females under 25")).toEqual({
      gender: "female",
      max_age: 25,
    });
  });

  it("handles older than N", () => {
    expect(parseQuery("seniors older than 65")).toEqual({
      age_group: "senior",
      min_age: 65,
    });
  });

  it("parses country before age keyword", () => {
    expect(parseQuery("adults from nigeria above 30")).toEqual({
      age_group: "adult",
      country_id: "NG",
      min_age: 30,
    });
  });
});
