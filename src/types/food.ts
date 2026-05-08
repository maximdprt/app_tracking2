import type { EntityBase } from "@/src/types/common";

export interface FoodItem extends EntityBase {
  nom: string;
  calories_100g: number;
  proteines_100g: number;
  glucides_100g: number;
  lipides_100g: number;
  sucres_100g: number;
  fibres_100g: number;
  sel_100g: number;
  source: string;
}
