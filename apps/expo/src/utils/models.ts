import foodImg from "@/assets/interests/cooking.jpg";
import creatorsImg from "@/assets/interests/creator.jpg";
import fashionImg from "@/assets/interests/fashion.jpg";
import festivalsImg from "@/assets/interests/festivals.jpg";
import gamingImg from "@/assets/interests/gaming.jpg";
import lifestyleImg from "@/assets/interests/lifestyle.jpg";
import musicImg from "@/assets/interests/music.jpg";
import sportImg from "@/assets/interests/sport.jpg";
import travelImg from "@/assets/interests/travel.jpg";

export const INTERESTS = ["FASHION", "FESTIVALS", "FOOD", "GAMING", "LIFESTYLE", "MUSIC", "SPORTS", "TRAVEL", "CREATORS"] as const;

export type INTEREST = (typeof INTERESTS)[number];

export const interestsMap: Record<INTEREST, { img: string; label: string; description: string }> = {
  FASHION: {
    img: fashionImg as string,
    label: "Fashion",
    description: "Follow your favorite Fashion stars today.",
  },
  FESTIVALS: {
    img: festivalsImg as string,
    label: "Festivals",
    description: "Follow your favorite Festival stars today.",
  },
  FOOD: {
    img: foodImg as string,
    label: "Food",
    description: "Follow your favorite Food stars today.",
  },
  GAMING: {
    img: gamingImg as string,
    label: "Gaming",
    description: "Follow your favorite Gaming stars today.",
  },
  LIFESTYLE: {
    img: lifestyleImg as string,
    label: "Lifestyle",
    description: "Follow your favorite Lifestyle stars today.",
  },
  MUSIC: {
    img: musicImg as string,
    label: "Music",
    description: "Follow your favorite Music stars today.",
  },
  SPORTS: {
    img: sportImg as string,
    label: "Sport",
    description: "Follow your favorite Sport stars today.",
  },
  TRAVEL: {
    img: travelImg as string,
    label: "Travel",
    description: "Follow your favorite Travel stars today.",
  },
  CREATORS: {
    img: creatorsImg as string,
    label: "Creators",
    description: "Follow your favorite Creator stars today.",
  },
};

export const POST_REACTION_TYPES = ["HEART", "SMILE", "STAR"] as const;

export type POST_REACTION_TYPE = (typeof POST_REACTION_TYPES)[number];

export const CONTENT_FLAG_TYPES = ["SPAM", "NUDE_CONTENT", "HATE_SPEECH", "DISINFORMATION", "VIOLENCE"] as const;

export type CONTENT_FLAG_TYPE = (typeof CONTENT_FLAG_TYPES)[number];
