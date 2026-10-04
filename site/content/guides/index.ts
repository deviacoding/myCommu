import type { Guide } from "./types";
import { guide as compte } from "./creer-mon-compte-et-ma-communaute";
import { guide as equipe } from "./creer-un-acces-tresorier";
import { guide as fidele } from "./rejoindre-sa-communaute";
import { guide as horaires } from "./publier-les-horaires-sans-rien-taper";

export type { Guide, GuideStep } from "./types";

export const guides: Guide[] = [compte, equipe, fidele, horaires];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
