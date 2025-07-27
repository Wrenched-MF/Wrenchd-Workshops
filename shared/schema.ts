import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  trim: text("trim"),
  color: text("color"),
  vin: text("vin"),
  licensePlate: text("license_plate"),
  mileage: integer("mileage"),
  engineSize: text("engine_size"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  website: text("website"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  partNumber: text("part_number"),
  category: text("category"),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  trackStock: boolean("track_stock").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  laborHours: decimal("labor_hours", { precision: 5, scale: 2 }),
  laborRate: decimal("labor_rate", { precision: 10, scale: 2 }),
  partsTotal: decimal("parts_total", { precision: 10, scale: 2 }).default("0"),
  laborTotal: decimal("labor_total", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  photos: json("photos").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobParts = pgTable("job_parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id),
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, expired
  validUntil: timestamp("valid_until"),
  laborHours: decimal("labor_hours", { precision: 5, scale: 2 }),
  laborRate: decimal("labor_rate", { precision: 10, scale: 2 }),
  partsTotal: decimal("parts_total", { precision: 10, scale: 2 }).default("0"),
  laborTotal: decimal("labor_total", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quoteParts = pgTable("quote_parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull().references(() => quotes.id),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id),
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const receipts = pgTable("receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  quoteId: varchar("quote_id").references(() => quotes.id),
  type: text("type").notNull(), // job, quote, purchase_order, return
  receiptNumber: text("receipt_number").notNull(),
  pdfUrl: text("pdf_url"),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businessSettings = pgTable("business_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name"),
  businessEmail: text("business_email"),
  businessPhone: text("business_phone"),
  businessAddress: text("business_address"),
  currency: text("currency").default("GBP"),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertJobPartSchema = createInsertSchema(jobParts).omit({
  id: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export const insertQuotePartSchema = createInsertSchema(quoteParts).omit({
  id: true,
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSettingsSchema = createInsertSchema(businessSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type JobPart = typeof jobParts.$inferSelect;
export type InsertJobPart = z.infer<typeof insertJobPartSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type QuotePart = typeof quoteParts.$inferSelect;
export type InsertQuotePart = z.infer<typeof insertQuotePartSchema>;

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

export type BusinessSettings = typeof businessSettings.$inferSelect;
export type InsertBusinessSettings = z.infer<typeof insertBusinessSettingsSchema>;

// Extended types with relations
export type JobWithDetails = Job & {
  customer: Customer;
  vehicle: Vehicle;
  parts: JobPart[];
};

export type QuoteWithDetails = Quote & {
  customer: Customer;
  vehicle: Vehicle;
  parts: QuotePart[];
};

export type VehicleWithCustomer = Vehicle & {
  customer: Customer;
};
