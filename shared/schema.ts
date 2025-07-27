import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  orderNumber: text("order_number").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, shipped, delivered, cancelled
  orderDate: timestamp("order_date").defaultNow(),
  expectedDelivery: timestamp("expected_delivery"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").notNull().references(() => purchaseOrders.id),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id),
  itemName: text("item_name").notNull(),
  itemDescription: text("item_description"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const returns = pgTable("returns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  returnNumber: text("return_number").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, processed, completed
  returnDate: timestamp("return_date").defaultNow(),
  reason: text("reason").notNull(),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const returnItems = pgTable("return_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  returnId: varchar("return_id").notNull().references(() => returns.id),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  condition: text("condition").notNull(), // new, used, damaged
});

export const receipts = pgTable("receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  quoteId: varchar("quote_id").references(() => quotes.id),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  returnId: varchar("return_id").references(() => returns.id),
  type: text("type").notNull(), // job, quote, purchase_order, return
  receiptNumber: text("receipt_number").notNull(),
  pdfUrl: text("pdf_url"),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom PDF Templates
export const customTemplates = pgTable("custom_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: text("template_name").notNull(),
  templateType: text("template_type").notNull(), // 'receipt', 'quote', 'purchase-order', 'return'
  companyName: text("company_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  logoUrl: text("logo_url"),
  headerText: text("header_text"),
  footerText: text("footer_text").notNull(),
  termsConditions: text("terms_conditions"),
  primaryColor: text("primary_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  showCompanyLogo: boolean("show_company_logo").default(true),
  showCompanyDetails: boolean("show_company_details").default(true),
  isActive: boolean("is_active").default(false), // Whether this template is currently selected for use
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const businessSettings = pgTable("business_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name"),
  businessEmail: text("business_email"),
  businessPhone: text("business_phone"),
  businessAddress: text("business_address"),
  currency: text("currency").default("GBP"),
  logoUrl: text("logo_url"),
  pdfTemplate: text("pdf_template").default("default"),
  headerColor: text("header_color").default("#000000"),
  accentColor: text("accent_color").default("#22c55e"),
  logoPosition: text("logo_position").default("left"),
  fontSize: integer("font_size").default(12),
  headerFontSize: integer("header_font_size").default(20),
  showLogo: boolean("show_logo").default(true),
  footerText: text("footer_text"),
  headerLayout: text("header_layout").default("standard"),
  activeTemplateId: varchar("active_template_id").references(() => customTemplates.id), // Reference to active custom template
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
  jobs: many(jobs),
  quotes: many(quotes),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, {
    fields: [vehicles.customerId],
    references: [customers.id],
  }),
  jobs: many(jobs),
  quotes: many(quotes),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  inventoryItems: many(inventoryItems),
  purchaseOrders: many(purchaseOrders),
  returns: many(returns),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  items: many(purchaseOrderItems),
  receipts: many(receipts),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [purchaseOrderItems.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const returnsRelations = relations(returns, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [returns.supplierId],
    references: [suppliers.id],
  }),
  purchaseOrder: one(purchaseOrders, {
    fields: [returns.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  items: many(returnItems),
  receipts: many(receipts),
}));

export const returnItemsRelations = relations(returnItems, ({ one }) => ({
  return: one(returns, {
    fields: [returnItems.returnId],
    references: [returns.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [returnItems.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [inventoryItems.supplierId],
    references: [suppliers.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [jobs.vehicleId],
    references: [vehicles.id],
  }),
  parts: many(jobParts),
}));

export const jobPartsRelations = relations(jobParts, ({ one }) => ({
  job: one(jobs, {
    fields: [jobParts.jobId],
    references: [jobs.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [jobParts.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  customer: one(customers, {
    fields: [quotes.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [quotes.vehicleId],
    references: [vehicles.id],
  }),
  parts: many(quoteParts),
}));

export const quotePartsRelations = relations(quoteParts, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteParts.quoteId],
    references: [quotes.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [quoteParts.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

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

export const insertCustomTemplateSchema = createInsertSchema(customTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Zod schemas for purchase orders and returns
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
}).extend({
  orderDate: z.string().or(z.date()).transform((val) => new Date(val)),
  expectedDelivery: z.string().or(z.date()).transform((val) => val ? new Date(val) : null).nullable(),
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
});

export const insertReturnSchema = createInsertSchema(returns).omit({
  id: true,
  createdAt: true,
}).extend({
  returnDate: z.string().or(z.date()).transform((val) => val ? new Date(val) : new Date()).optional(),
});

export const insertReturnItemSchema = createInsertSchema(returnItems).omit({
  id: true,
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

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;

export type Return = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;

export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = z.infer<typeof insertReturnItemSchema>;

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

export type BusinessSettings = typeof businessSettings.$inferSelect;
export type InsertBusinessSettings = z.infer<typeof insertBusinessSettingsSchema>;

export type CustomTemplate = typeof customTemplates.$inferSelect;
export type InsertCustomTemplate = z.infer<typeof insertCustomTemplateSchema>;

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

export type PurchaseOrderWithDetails = PurchaseOrder & {
  supplier: Supplier;
  items: PurchaseOrderItem[];
};

export type ReturnWithDetails = Return & {
  supplier: Supplier;
  purchaseOrder?: PurchaseOrder;
  items: ReturnItem[];
};
