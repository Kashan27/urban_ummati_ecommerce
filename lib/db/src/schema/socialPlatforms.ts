import { pgTable, text, serial, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Social Platforms Table
 * 
 * Stores social media platform configurations for the application.
 * Includes platform name, link, active status, and metadata.
 */
export const socialPlatformsTable = pgTable("social_platforms", {
  // Unique identifier (Primary Key)
  id: serial("id").primaryKey(),
  
  // Social platform name (e.g., "Instagram", "Facebook", "Twitter")
  name: varchar("name", { length: 100 }).notNull(),
  
  // Platform link/handle (e.g., "https://instagram.com/urbanummati")
  platformLink: text("platform_link").notNull(),
  
  // Active status flag
  isActive: boolean("is_active").notNull().default(true),
  
  // Icon identifier for UI rendering (e.g., "instagram", "facebook", "twitter")
  iconKey: varchar("icon_key", { length: 50 }),
  
  // Display order for sorting (lower values = higher priority)
  displayOrder: serial("display_order").notNull().default(0),
  
  // Platform handle/username (e.g., "@urbanummati")
  handle: varchar("handle", { length: 100 }),
  
  // Additional metadata as JSON (for extensibility)
  metadata: text("metadata"),
  
  // Creation timestamp
  createdAt: timestamp("created_at").notNull().defaultNow(),
  
  // Update timestamp
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Insert Schema for Social Platforms
 */
export const insertSocialPlatformSchema = createInsertSchema(socialPlatformsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update Schema for Social Platforms
 */
export const updateSocialPlatformSchema = createInsertSchema(socialPlatformsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Type definitions
export type InsertSocialPlatform = z.infer<typeof insertSocialPlatformSchema>;
export type UpdateSocialPlatform = z.infer<typeof updateSocialPlatformSchema>;
export type SocialPlatform = typeof socialPlatformsTable.$inferSelect;
