export interface Achievement {
  id: string; // Unique identifier (e.g., "first_sip")
  name: string;
  description: string;
  flavorText?: string;
  icon?: string; // Emoji
  isHidden?: boolean; // Secret achievement?
  category: "novice" | "explorer" | "master" | "social" | "grind" | "hidden";
  tier?: number; // For tiered achievements (1, 2, 3...)
  maxProgress?: number; // If it has progress (e.g. 10/10)
  condition?: {
    metric: string;
    threshold: number;
    operator?: ">=" | "<=" | "==";
  };
}

export interface UserAchievement {
  id?: number;
  achievementId: string;
  unlockedAt: Date;
}

export interface AchievementMetric {
  key: string; // e.g., "cocktails_viewed", "recipes_prepped"
  value: number;
}

/**
 * Achievement with unlock status and progress
 * Used in the achievements list view
 */
export interface AchievementStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: Date;
  currentProgress: number;
}
