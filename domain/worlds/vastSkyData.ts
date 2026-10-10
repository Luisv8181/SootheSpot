/**
 * Repertoire data for the Vast Sky world: ambient song shapes and
 * hand-mapped constellations. Positions are normalized (0..1) and mapped
 * onto the canvas at render time.
 *
 * Constellation geometry is hand-placed for tracing, not an authoritative
 * astronomical catalog — star names on the bright stars are the real ones.
 */

export type SkySong = {
  notes: number[];
  /** trace path as normalized [x, y] waypoints */
  shape: Array<[number, number]>;
};

export const FREE_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

export const SKY_SONGS: Record<string, SkySong> = {
  still: {
    notes: [261.63, 329.63, 392.0, 440.0, 523.25, 440.0, 392.0, 329.63],
    shape: [[0.08, 0.60], [0.20, 0.47], [0.33, 0.38], [0.47, 0.33], [0.61, 0.33], [0.74, 0.40], [0.86, 0.50], [0.95, 0.62]]
  },
  night: {
    notes: [220.0, 261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63, 220.0],
    shape: [[0.15, 0.74], [0.28, 0.62], [0.24, 0.48], [0.36, 0.36], [0.52, 0.32], [0.68, 0.36], [0.64, 0.50], [0.76, 0.62], [0.88, 0.72]]
  },
  dawn: {
    notes: [329.63, 392.0, 440.0, 523.25, 587.33, 523.25, 440.0, 392.0],
    shape: [[0.12, 0.76], [0.24, 0.66], [0.36, 0.56], [0.48, 0.45], [0.60, 0.35], [0.72, 0.41], [0.82, 0.52], [0.90, 0.63]]
  }
};

export type SkyConstellation = {
  name: string;
  mean: string;
  short: string;
  /** normalized [x, y, star name or ""] */
  stars: Array<[number, number, string]>;
  /** trace order as indexes into stars */
  order: number[];
  notes: number[];
};

export const SKY_CONSTELLATIONS: Record<string, SkyConstellation> = {
  orion: {
    name: "ORION", mean: "the hunter · el cazador", short: "ORION",
    stars: [[0.28, 0.12, "Betelgeuse"], [0.66, 0.16, "Bellatrix"], [0.40, 0.42, "Alnitak"], [0.50, 0.45, "Alnilam"], [0.60, 0.48, "Mintaka"], [0.34, 0.80, "Saiph"], [0.66, 0.84, "Rigel"]],
    order: [0, 1, 4, 3, 2, 5, 6],
    notes: [220.00, 261.63, 329.63, 392.00, 440.00, 392.00, 329.63]
  },
  dipper: {
    name: "BIG DIPPER", mean: "ursa major · la osa mayor", short: "DIPPER",
    stars: [[0.88, 0.30, "Alkaid"], [0.74, 0.26, "Mizar"], [0.60, 0.30, "Alioth"], [0.46, 0.36, "Megrez"], [0.24, 0.30, "Dubhe"], [0.24, 0.56, "Merak"], [0.44, 0.60, "Phecda"]],
    order: [0, 1, 2, 3, 4, 5, 6],
    notes: [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63]
  },
  cassiopeia: {
    name: "CASSIOPEIA", mean: "the queen · la reina", short: "CASSIO",
    stars: [[0.10, 0.60, "Caph"], [0.30, 0.36, "Schedar"], [0.50, 0.52, "Gamma"], [0.70, 0.34, "Ruchbah"], [0.90, 0.56, "Segin"]],
    order: [0, 1, 2, 3, 4],
    notes: [329.63, 392.00, 523.25, 440.00, 392.00]
  },
  cygnus: {
    name: "CYGNUS", mean: "the swan · el cisne", short: "CYGNUS",
    stars: [[0.50, 0.10, "Deneb"], [0.50, 0.42, "Sadr"], [0.26, 0.40, "Gienah"], [0.74, 0.40, ""], [0.50, 0.80, "Albireo"]],
    order: [0, 1, 4, 1, 2, 1, 3],
    notes: [196.00, 261.63, 293.66, 329.63, 293.66, 261.63, 293.66]
  },
  lyra: {
    name: "LYRA", mean: "the lyre · la lira", short: "LYRA",
    stars: [[0.50, 0.12, "Vega"], [0.40, 0.52, "Sheliak"], [0.50, 0.80, ""], [0.60, 0.52, "Sulafat"]],
    order: [0, 1, 2, 3, 0],
    notes: [440.00, 523.25, 659.25, 587.33, 523.25]
  },
  scorpius: {
    name: "SCORPIUS", mean: "the scorpion · el escorpión", short: "SCORPIUS",
    stars: [[0.30, 0.14, "Graffias"], [0.42, 0.20, "Dschubba"], [0.54, 0.16, ""], [0.56, 0.44, "Antares"], [0.64, 0.58, ""], [0.60, 0.70, ""], [0.70, 0.78, ""], [0.80, 0.72, "Lesath"], [0.86, 0.82, "Shaula"]],
    order: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    notes: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66]
  },
  leo: {
    name: "LEO", mean: "the lion · el león", short: "LEO",
    stars: [[0.30, 0.20, ""], [0.38, 0.34, "Algieba"], [0.50, 0.38, ""], [0.60, 0.52, "Regulus"], [0.78, 0.56, "Denebola"], [0.70, 0.74, ""], [0.58, 0.66, ""]],
    order: [0, 1, 2, 3, 4, 5, 6],
    notes: [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66]
  },
  littledipper: {
    name: "LITTLE DIPPER", mean: "ursa minor · la osa menor", short: "L.DIPPER",
    stars: [[0.50, 0.08, "Polaris"], [0.58, 0.28, "Yildun"], [0.48, 0.40, ""], [0.62, 0.48, ""], [0.52, 0.64, "Pherkad"], [0.36, 0.60, "Kochab"]],
    order: [0, 1, 2, 3, 4, 5],
    notes: [392.00, 523.25, 587.33, 659.25, 587.33, 523.25]
  }
};
