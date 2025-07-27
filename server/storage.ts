import { 
  type Customer, type InsertCustomer,
  type Vehicle, type InsertVehicle, type VehicleWithCustomer,
  type Supplier, type InsertSupplier,
  type InventoryItem, type InsertInventoryItem,
  type Job, type InsertJob, type JobWithDetails,
  type JobPart, type InsertJobPart,
  type Quote, type InsertQuote, type QuoteWithDetails,
  type QuotePart, type InsertQuotePart,
  type PurchaseOrder, type InsertPurchaseOrder, type PurchaseOrderWithDetails,
  type PurchaseOrderItem, type InsertPurchaseOrderItem,
  type Return, type InsertReturn, type ReturnWithDetails,
  type ReturnItem, type InsertReturnItem,
  type Receipt, type InsertReceipt,
  type ReceiptArchive, type InsertReceiptArchive,
  type ArchiveReceipt, type InsertArchiveReceipt,
  type BusinessSettings, type InsertBusinessSettings,
  type CustomTemplate, type InsertCustomTemplate,
  customers, vehicles, suppliers, inventoryItems, jobs, jobParts, quotes, quoteParts, 
  purchaseOrders, purchaseOrderItems, returns, returnItems, receipts, receiptArchives, archiveReceipts, businessSettings, customTemplates
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lt } from "drizzle-orm";

export interface IStorage {
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Vehicles
  getVehicles(): Promise<VehicleWithCustomer[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehiclesByCustomer(customerId: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;

  // Inventory
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  getLowStockItems(): Promise<InventoryItem[]>;

  // Jobs
  getJobs(): Promise<JobWithDetails[]>;
  getJob(id: string): Promise<JobWithDetails | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  getJobsByStatus(status: string): Promise<JobWithDetails[]>;
  
  // Job Parts
  getJobParts(jobId: string): Promise<JobPart[]>;
  addJobPart(jobPart: InsertJobPart): Promise<JobPart>;
  updateJobPart(id: string, updates: Partial<InsertJobPart>): Promise<JobPart>;
  deleteJobPart(id: string): Promise<void>;

  // Quotes
  getQuotes(): Promise<QuoteWithDetails[]>;
  getQuote(id: string): Promise<QuoteWithDetails | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote>;
  deleteQuote(id: string): Promise<void>;
  
  // Quote Parts
  getQuoteParts(quoteId: string): Promise<QuotePart[]>;
  addQuotePart(quotePart: InsertQuotePart): Promise<QuotePart>;
  updateQuotePart(id: string, updates: Partial<InsertQuotePart>): Promise<QuotePart>;
  deleteQuotePart(id: string): Promise<void>;

  // Purchase Orders
  getPurchaseOrders(): Promise<PurchaseOrderWithDetails[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrderWithDetails | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder>;
  deletePurchaseOrder(id: string): Promise<void>;
  
  // Purchase Order Items
  getPurchaseOrderItems(orderId: string): Promise<PurchaseOrderItem[]>;
  addPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: string, updates: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem>;
  deletePurchaseOrderItem(id: string): Promise<void>;

  // Returns
  getReturns(): Promise<ReturnWithDetails[]>;
  getReturn(id: string): Promise<ReturnWithDetails | undefined>;
  createReturn(returnItem: InsertReturn): Promise<Return>;
  updateReturn(id: string, updates: Partial<InsertReturn>): Promise<Return>;
  deleteReturn(id: string): Promise<void>;
  
  // Return Items
  getReturnItems(returnId: string): Promise<ReturnItem[]>;
  addReturnItem(item: InsertReturnItem): Promise<ReturnItem>;
  updateReturnItem(id: string, updates: Partial<InsertReturnItem>): Promise<ReturnItem>;
  deleteReturnItem(id: string): Promise<void>;

  // Receipts
  getReceipts(): Promise<Receipt[]>;
  getReceipt(id: string): Promise<Receipt | undefined>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  updateReceipt(id: string, updates: Partial<InsertReceipt>): Promise<Receipt>;
  archiveReceipt(id: string): Promise<Receipt>;
  
  // Receipt Archives
  getReceiptArchives(): Promise<ReceiptArchive[]>;
  getReceiptArchive(id: string): Promise<ReceiptArchive | undefined>;
  createReceiptArchive(archive: InsertReceiptArchive): Promise<ReceiptArchive>;
  updateReceiptArchive(id: string, updates: Partial<InsertReceiptArchive>): Promise<ReceiptArchive>;
  deleteReceiptArchive(id: string): Promise<void>;
  getArchiveReceipts(archiveId: string): Promise<Receipt[]>;
  addReceiptToArchive(archiveId: string, receiptId: string): Promise<void>;
  removeReceiptFromArchive(archiveId: string, receiptId: string): Promise<void>;

  // Business Settings
  getBusinessSettings(): Promise<BusinessSettings | undefined>;
  updateBusinessSettings(settings: InsertBusinessSettings): Promise<BusinessSettings>;

  // Custom Templates
  getCustomTemplates(): Promise<CustomTemplate[]>;
  getCustomTemplate(id: string): Promise<CustomTemplate | undefined>;
  createCustomTemplate(template: InsertCustomTemplate): Promise<CustomTemplate>;
  updateCustomTemplate(id: string, updates: Partial<InsertCustomTemplate>): Promise<CustomTemplate>;
  deleteCustomTemplate(id: string): Promise<void>;
  activateCustomTemplate(id: string): Promise<CustomTemplate>;
  getActiveCustomTemplate(): Promise<CustomTemplate | null>;
  getActiveCustomTemplateByType(templateType: string): Promise<CustomTemplate | null>;

  // Users (from existing schema)
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Helper method to ensure business settings exist
  private async ensureBusinessSettings(): Promise<BusinessSettings> {
    const [existing] = await db.select().from(businessSettings).limit(1);
    if (existing) return existing;
    
    // Create default settings if none exist
    const [created] = await db
      .insert(businessSettings)
      .values({
        businessName: "WRENCH'D Auto Repairs",
        businessEmail: null,
        businessPhone: null,
        businessAddress: null,
        currency: "GBP",
        logoUrl: null,
      })
      .returning();
    return created;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    if (!customer) throw new Error("Customer not found");
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Vehicles
  async getVehicles(): Promise<VehicleWithCustomer[]> {
    const vehicleList = await db.select().from(vehicles);
    const result: VehicleWithCustomer[] = [];
    
    for (const vehicle of vehicleList) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, vehicle.customerId));
      if (customer) {
        result.push({ ...vehicle, customer });
      }
    }
    
    return result;
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.customerId, customerId));
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    if (!vehicle) throw new Error("Vehicle not found");
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db
      .insert(suppliers)
      .values(insertSupplier)
      .returning();
    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier> {
    const [supplier] = await db
      .update(suppliers)
      .set(updates)
      .where(eq(suppliers.id, id))
      .returning();
    if (!supplier) throw new Error("Supplier not found");
    return supplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems);
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [item] = await db
      .update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, id))
      .returning();
    if (!item) throw new Error("Inventory item not found");
    return item;
  }

  async updateInventoryStock(id: string, quantityChange: number): Promise<InventoryItem> {
    const currentItem = await this.getInventoryItem(id);
    if (!currentItem) throw new Error("Inventory item not found");
    
    const newQuantity = (currentItem.quantity || 0) + quantityChange;
    
    const [item] = await db
      .update(inventoryItems)
      .set({ quantity: newQuantity })
      .where(eq(inventoryItems.id, id))
      .returning();
    if (!item) throw new Error("Failed to update inventory stock");
    return item;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(
      and(
        eq(inventoryItems.trackStock, true),
        lt(inventoryItems.quantity, inventoryItems.lowStockThreshold)
      )
    );
  }

  // Jobs
  async getJobs(): Promise<JobWithDetails[]> {
    const jobList = await db.select().from(jobs);
    const result: JobWithDetails[] = [];
    
    for (const job of jobList) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, job.customerId));
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, job.vehicleId));
      const parts = await db.select().from(jobParts).where(eq(jobParts.jobId, job.id));
      
      if (customer && vehicle) {
        result.push({ ...job, customer, vehicle, parts });
      }
    }
    
    return result;
  }

  async getJob(id: string): Promise<JobWithDetails | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    if (!job) return undefined;
    
    const [customer] = await db.select().from(customers).where(eq(customers.id, job.customerId));
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, job.vehicleId));
    const parts = await db.select().from(jobParts).where(eq(jobParts.jobId, job.id));
    
    if (customer && vehicle) {
      return { ...job, customer, vehicle, parts };
    }
    
    return undefined;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    // Generate job number
    const jobNumber = `JOB-${Date.now()}`;
    
    const [job] = await db
      .insert(jobs)
      .values({ ...insertJob, jobNumber })
      .returning();
    return job;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    if (!job) throw new Error("Job not found");
    return job;
  }

  async deleteJob(id: string): Promise<void> {
    // Delete associated parts first
    await db.delete(jobParts).where(eq(jobParts.jobId, id));
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getJobsByStatus(status: string): Promise<JobWithDetails[]> {
    const jobList = await db.select().from(jobs).where(eq(jobs.status, status));
    const result: JobWithDetails[] = [];
    
    for (const job of jobList) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, job.customerId));
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, job.vehicleId));
      const parts = await db.select().from(jobParts).where(eq(jobParts.jobId, job.id));
      
      if (customer && vehicle) {
        result.push({ ...job, customer, vehicle, parts });
      }
    }
    
    return result;
  }

  // Job Parts
  async getJobParts(jobId: string): Promise<JobPart[]> {
    return await db.select().from(jobParts).where(eq(jobParts.jobId, jobId));
  }

  async addJobPart(insertJobPart: InsertJobPart): Promise<JobPart> {
    const [jobPart] = await db
      .insert(jobParts)
      .values(insertJobPart)
      .returning();
    return jobPart;
  }

  async updateJobPart(id: string, updates: Partial<InsertJobPart>): Promise<JobPart> {
    const [jobPart] = await db
      .update(jobParts)
      .set(updates)
      .where(eq(jobParts.id, id))
      .returning();
    if (!jobPart) throw new Error("Job part not found");
    return jobPart;
  }

  async deleteJobPart(id: string): Promise<void> {
    await db.delete(jobParts).where(eq(jobParts.id, id));
  }

  // Quotes
  async getQuotes(): Promise<QuoteWithDetails[]> {
    const quoteList = await db.select().from(quotes);
    const result: QuoteWithDetails[] = [];
    
    for (const quote of quoteList) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, quote.customerId));
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, quote.vehicleId));
      const parts = await db.select().from(quoteParts).where(eq(quoteParts.quoteId, quote.id));
      
      if (customer && vehicle) {
        result.push({ ...quote, customer, vehicle, parts });
      }
    }
    
    return result;
  }

  async getQuote(id: string): Promise<QuoteWithDetails | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    if (!quote) return undefined;
    
    const [customer] = await db.select().from(customers).where(eq(customers.id, quote.customerId));
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, quote.vehicleId));
    const parts = await db.select().from(quoteParts).where(eq(quoteParts.quoteId, quote.id));
    
    if (customer && vehicle) {
      return { ...quote, customer, vehicle, parts };
    }
    
    return undefined;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    // Generate quote number
    const quoteNumber = `QTE-${Date.now()}`;
    
    const [quote] = await db
      .insert(quotes)
      .values({ ...insertQuote, quoteNumber })
      .returning();
    return quote;
  }

  async updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote> {
    const [quote] = await db
      .update(quotes)
      .set(updates)
      .where(eq(quotes.id, id))
      .returning();
    if (!quote) throw new Error("Quote not found");
    return quote;
  }

  async deleteQuote(id: string): Promise<void> {
    // Delete associated parts first
    await db.delete(quoteParts).where(eq(quoteParts.quoteId, id));
    await db.delete(quotes).where(eq(quotes.id, id));
  }

  // Quote Parts
  async getQuoteParts(quoteId: string): Promise<QuotePart[]> {
    return await db.select().from(quoteParts).where(eq(quoteParts.quoteId, quoteId));
  }

  async addQuotePart(insertQuotePart: InsertQuotePart): Promise<QuotePart> {
    const [quotePart] = await db
      .insert(quoteParts)
      .values(insertQuotePart)
      .returning();
    return quotePart;
  }

  async updateQuotePart(id: string, updates: Partial<InsertQuotePart>): Promise<QuotePart> {
    const [quotePart] = await db
      .update(quoteParts)
      .set(updates)
      .where(eq(quoteParts.id, id))
      .returning();
    if (!quotePart) throw new Error("Quote part not found");
    return quotePart;
  }

  async deleteQuotePart(id: string): Promise<void> {
    await db.delete(quoteParts).where(eq(quoteParts.id, id));
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrderWithDetails[]> {
    const orderList = await db.select().from(purchaseOrders);
    const result: PurchaseOrderWithDetails[] = [];
    
    for (const order of orderList) {
      const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, order.supplierId));
      const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, order.id));
      
      if (supplier) {
        result.push({ ...order, supplier, items });
      }
    }
    
    return result;
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrderWithDetails | undefined> {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    if (!order) return undefined;
    
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, order.supplierId));
    const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, order.id));
    
    if (supplier) {
      return { ...order, supplier, items };
    }
    
    return undefined;
  }

  async createPurchaseOrder(insertOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [order] = await db
      .insert(purchaseOrders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updatePurchaseOrder(id: string, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder> {
    const [order] = await db
      .update(purchaseOrders)
      .set(updates)
      .where(eq(purchaseOrders.id, id))
      .returning();
    if (!order) throw new Error("Purchase order not found");
    return order;
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    // Delete associated items first
    await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
  }

  // Purchase Order Items
  async getPurchaseOrderItems(orderId: string): Promise<PurchaseOrderItem[]> {
    return await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, orderId));
  }

  async addPurchaseOrderItem(insertItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [item] = await db
      .insert(purchaseOrderItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updatePurchaseOrderItem(id: string, updates: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem> {
    const [item] = await db
      .update(purchaseOrderItems)
      .set(updates)
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    if (!item) throw new Error("Purchase order item not found");
    return item;
  }

  async deletePurchaseOrderItem(id: string): Promise<void> {
    await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
  }

  // Returns
  async getReturns(): Promise<ReturnWithDetails[]> {
    const returnList = await db.select().from(returns);
    const result: ReturnWithDetails[] = [];
    
    for (const returnItem of returnList) {
      const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, returnItem.supplierId));
      const [purchaseOrder] = returnItem.purchaseOrderId 
        ? await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, returnItem.purchaseOrderId))
        : [undefined];
      const items = await db.select().from(returnItems).where(eq(returnItems.returnId, returnItem.id));
      
      if (supplier) {
        result.push({ ...returnItem, supplier, purchaseOrder, items });
      }
    }
    
    return result;
  }

  async getReturn(id: string): Promise<ReturnWithDetails | undefined> {
    const [returnItem] = await db.select().from(returns).where(eq(returns.id, id));
    if (!returnItem) return undefined;
    
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, returnItem.supplierId));
    const [purchaseOrder] = returnItem.purchaseOrderId 
      ? await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, returnItem.purchaseOrderId))
      : [undefined];
    const items = await db.select().from(returnItems).where(eq(returnItems.returnId, returnItem.id));
    
    if (supplier) {
      return { ...returnItem, supplier, purchaseOrder, items };
    }
    
    return undefined;
  }

  async createReturn(insertReturn: InsertReturn): Promise<Return> {
    const [returnItem] = await db
      .insert(returns)
      .values(insertReturn)
      .returning();
    return returnItem;
  }

  async updateReturn(id: string, updates: Partial<InsertReturn>): Promise<Return> {
    const [returnItem] = await db
      .update(returns)
      .set(updates)
      .where(eq(returns.id, id))
      .returning();
    if (!returnItem) throw new Error("Return not found");
    return returnItem;
  }

  async deleteReturn(id: string): Promise<void> {
    // Delete associated items first
    await db.delete(returnItems).where(eq(returnItems.returnId, id));
    await db.delete(returns).where(eq(returns.id, id));
  }

  // Return Items
  async getReturnItems(returnId: string): Promise<ReturnItem[]> {
    return await db.select().from(returnItems).where(eq(returnItems.returnId, returnId));
  }

  async addReturnItem(insertItem: InsertReturnItem): Promise<ReturnItem> {
    const [item] = await db
      .insert(returnItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateReturnItem(id: string, updates: Partial<InsertReturnItem>): Promise<ReturnItem> {
    const [item] = await db
      .update(returnItems)
      .set(updates)
      .where(eq(returnItems.id, id))
      .returning();
    if (!item) throw new Error("Return item not found");
    return item;
  }

  async deleteReturnItem(id: string): Promise<void> {
    await db.delete(returnItems).where(eq(returnItems.id, id));
  }

  // Receipts
  async getReceipts(): Promise<Receipt[]> {
    return await db.select().from(receipts);
  }

  async getReceipt(id: string): Promise<Receipt | undefined> {
    const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id));
    return receipt || undefined;
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const [receipt] = await db
      .insert(receipts)
      .values(insertReceipt)
      .returning();
    return receipt;
  }

  async updateReceipt(id: string, updates: Partial<InsertReceipt>): Promise<Receipt> {
    const [receipt] = await db
      .update(receipts)
      .set(updates)
      .where(eq(receipts.id, id))
      .returning();
    if (!receipt) throw new Error("Receipt not found");
    return receipt;
  }

  async archiveReceipt(id: string): Promise<Receipt> {
    const [receipt] = await db
      .update(receipts)
      .set({ 
        archived: true, 
        archivedAt: new Date(),
        backupStatus: "pending" 
      })
      .where(eq(receipts.id, id))
      .returning();
    if (!receipt) throw new Error("Receipt not found");
    return receipt;
  }

  // Receipt Archives
  async getReceiptArchives(): Promise<ReceiptArchive[]> {
    return await db.select().from(receiptArchives);
  }

  async getReceiptArchive(id: string): Promise<ReceiptArchive | undefined> {
    const [archive] = await db.select().from(receiptArchives).where(eq(receiptArchives.id, id));
    return archive || undefined;
  }

  async createReceiptArchive(insertArchive: InsertReceiptArchive): Promise<ReceiptArchive> {
    const [archive] = await db
      .insert(receiptArchives)
      .values(insertArchive)
      .returning();
    return archive;
  }

  async updateReceiptArchive(id: string, updates: Partial<InsertReceiptArchive>): Promise<ReceiptArchive> {
    const [archive] = await db
      .update(receiptArchives)
      .set(updates)
      .where(eq(receiptArchives.id, id))
      .returning();
    if (!archive) throw new Error("Archive not found");
    return archive;
  }

  async deleteReceiptArchive(id: string): Promise<void> {
    // Remove archive receipt links first
    await db.delete(archiveReceipts).where(eq(archiveReceipts.archiveId, id));
    await db.delete(receiptArchives).where(eq(receiptArchives.id, id));
  }

  async getArchiveReceipts(archiveId: string): Promise<Receipt[]> {
    const archiveReceiptsList = await db
      .select()
      .from(archiveReceipts)
      .where(eq(archiveReceipts.archiveId, archiveId));
    
    const receiptIds = archiveReceiptsList.map(ar => ar.receiptId);
    if (receiptIds.length === 0) return [];
    
    return await db.select().from(receipts).where(
      eq(receipts.id, receiptIds[0]) // This would need proper implementation for multiple IDs
    );
  }

  async addReceiptToArchive(archiveId: string, receiptId: string): Promise<void> {
    await db.insert(archiveReceipts).values({
      archiveId,
      receiptId
    });
  }

  async removeReceiptFromArchive(archiveId: string, receiptId: string): Promise<void> {
    await db.delete(archiveReceipts).where(
      and(
        eq(archiveReceipts.archiveId, archiveId),
        eq(archiveReceipts.receiptId, receiptId)
      )
    );
  }

  // Business Settings
  async getBusinessSettings(): Promise<BusinessSettings | undefined> {
    return await this.ensureBusinessSettings();
  }

  async updateBusinessSettings(settings: InsertBusinessSettings): Promise<BusinessSettings> {
    const existing = await this.ensureBusinessSettings();
    const [updated] = await db
      .update(businessSettings)
      .set(settings)
      .where(eq(businessSettings.id, existing.id))
      .returning();
    return updated;
  }

  // Custom Templates
  async getCustomTemplates(): Promise<CustomTemplate[]> {
    return await db.select().from(customTemplates);
  }

  async getCustomTemplate(id: string): Promise<CustomTemplate | undefined> {
    const [template] = await db.select().from(customTemplates).where(eq(customTemplates.id, id));
    return template || undefined;
  }

  async createCustomTemplate(template: InsertCustomTemplate): Promise<CustomTemplate> {
    const [created] = await db
      .insert(customTemplates)
      .values(template)
      .returning();
    return created;
  }

  async updateCustomTemplate(id: string, updates: Partial<InsertCustomTemplate>): Promise<CustomTemplate> {
    const [updated] = await db
      .update(customTemplates)
      .set(updates)
      .where(eq(customTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteCustomTemplate(id: string): Promise<void> {
    await db.delete(customTemplates).where(eq(customTemplates.id, id));
  }

  async activateCustomTemplate(id: string): Promise<CustomTemplate> {
    // First, deactivate all templates of the same type
    const template = await this.getCustomTemplate(id);
    if (!template) {
      throw new Error("Template not found");
    }

    // Deactivate all templates of this type
    await db
      .update(customTemplates)
      .set({ isActive: false })
      .where(eq(customTemplates.templateType, template.templateType));

    // Activate the selected template
    const [activated] = await db
      .update(customTemplates)
      .set({ isActive: true })
      .where(eq(customTemplates.id, id))
      .returning();

    return activated;
  }

  async getActiveCustomTemplate(): Promise<CustomTemplate | null> {
    const [template] = await db
      .select()
      .from(customTemplates)
      .where(eq(customTemplates.isActive, true))
      .limit(1);
    return template || null;
  }

  async getActiveCustomTemplateByType(templateType: string): Promise<CustomTemplate | null> {
    const [template] = await db
      .select()
      .from(customTemplates)
      .where(
        and(
          eq(customTemplates.templateType, templateType),
          eq(customTemplates.isActive, true)
        )
      )
      .limit(1);
    return template || null;
  }

  // Users (legacy compatibility)
  async getUser(id: string): Promise<any> {
    // This would need to be implemented based on your user schema
    return undefined;
  }

  async getUserByUsername(username: string): Promise<any> {
    // This would need to be implemented based on your user schema
    return undefined;
  }

  async createUser(insertUser: any): Promise<any> {
    // This would need to be implemented based on your user schema
    return undefined;
  }
}

export const storage = new DatabaseStorage();