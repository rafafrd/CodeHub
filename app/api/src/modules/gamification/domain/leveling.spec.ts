import { levelForXp, rankForLevel } from "./leveling";

describe("leveling", () => {
  describe("levelForXp", () => {
    it("começa no nível 1 com 0 XP", () => {
      expect(levelForXp(0)).toBe(1);
    });

    it("sobe um nível a cada 100 XP", () => {
      expect(levelForXp(99)).toBe(1);
      expect(levelForXp(100)).toBe(2);
      expect(levelForXp(250)).toBe(3);
    });
  });

  describe("rankForLevel", () => {
    it("mapeia o nível para a patente correta", () => {
      expect(rankForLevel(1)).toBe("Bronze");
      expect(rankForLevel(5)).toBe("Prata");
      expect(rankForLevel(10)).toBe("Ouro");
      expect(rankForLevel(15)).toBe("Platina");
      expect(rankForLevel(20)).toBe("Diamante");
    });
  });
});
