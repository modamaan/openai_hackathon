import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── Users ──────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  scalekitUserId: text("scalekit_user_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Bots ───────────────────────────────────────────────────────────────────
export const bots = pgTable("bots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").default(
    "You are a helpful customer support assistant. Answer questions based only on the provided knowledge base. If you don't know the answer, say so politely."
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Sources ────────────────────────────────────────────────────────────────
export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: uuid("bot_id")
    .notNull()
    .references(() => bots.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["url", "file", "text"] }).notNull().default("url"),
  rawUrl: text("raw_url"),
  content: text("content"),
  status: text("status", {
    enum: ["pending", "processing", "done", "error"],
  })
    .notNull()
    .default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Chunks (for vector search) ─────────────────────────────────────────────
// NOTE: We store embeddings as text[] to avoid pgvector type issues during schema push.
// In production, you'd use the vector() type from drizzle-orm/pg-core with pgvector enabled.
export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    botId: uuid("bot_id")
      .notNull()
      .references(() => bots.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    // Stored as a JSON string of number[] for portability without pgvector extension
    embedding: text("embedding"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("chunks_bot_id_idx").on(table.botId)]
);

// ── Conversations ──────────────────────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: uuid("bot_id")
    .notNull()
    .references(() => bots.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Messages ───────────────────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Types ──────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Bot = typeof bots.$inferSelect;
export type NewBot = typeof bots.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
