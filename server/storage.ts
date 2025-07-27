import { 
  type Customer, type InsertCustomer,
  type Vehicle, type InsertVehicle, type VehicleWithCustomer,
  type Supplier, type InsertSupplier,
  type InventoryItem, type InsertInventoryItem,
  type Job, type InsertJob, type JobWithDetails,
  type JobPart, type InsertJobPart,
  type Quote, type InsertQuote, type QuoteWithDetails,
  type QuotePart, type InsertQuotePart,
  type Receipt, type InsertReceipt,
  type BusinessSettings, type InsertBusinessSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

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

  // Receipts
  getReceipts(): Promise<Receipt[]>;
  getReceipt(id: string): Promise<Receipt | undefined>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;

  // Business Settings
  getBusinessSettings(): Promise<BusinessSettings | undefined>;
  updateBusinessSettings(settings: InsertBusinessSettings): Promise<BusinessSettings>;

  // Users (from existing schema)
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer>;
  private vehicles: Map<string, Vehicle>;
  private suppliers: Map<string, Supplier>;
  private inventoryItems: Map<string, InventoryItem>;
  private jobs: Map<string, Job>;
  private jobParts: Map<string, JobPart>;
  private quotes: Map<string, Quote>;
  private quoteParts: Map<string, QuotePart>;
  private receipts: Map<string, Receipt>;
  private businessSettings: BusinessSettings | undefined;
  private users: Map<string, any>;

  constructor() {
    this.customers = new Map();
    this.vehicles = new Map();
    this.suppliers = new Map();
    this.inventoryItems = new Map();
    this.jobs = new Map();
    this.jobParts = new Map();
    this.quotes = new Map();
    this.quoteParts = new Map();
    this.receipts = new Map();
    this.users = new Map();
    
    // Initialize with default business settings
    this.businessSettings = {
      id: randomUUID(),
      businessName: "WRENCH'D Auto Repairs",
      businessEmail: null,
      businessPhone: null,
      businessAddress: null,
      currency: "GBP",
      logoUrl: null,
      updatedAt: new Date(),
    };
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      createdAt: new Date() 
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    const existing = this.customers.get(id);
    if (!existing) throw new Error("Customer not found");
    
    const updated = { ...existing, ...updates };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: string): Promise<void> {
    this.customers.delete(id);
  }

  // Vehicles
  async getVehicles(): Promise<VehicleWithCustomer[]> {
    const vehicles = Array.from(this.vehicles.values());
    const result: VehicleWithCustomer[] = [];
    
    for (const vehicle of vehicles) {
      const customer = this.customers.get(vehicle.customerId);
      if (customer) {
        result.push({ ...vehicle, customer });
      }
    }
    
    return result;
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(v => v.customerId === customerId);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id, 
      createdAt: new Date() 
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle> {
    const existing = this.vehicles.get(id);
    if (!existing) throw new Error("Vehicle not found");
    
    const updated = { ...existing, ...updates };
    this.vehicles.set(id, updated);
    return updated;
  }

  async deleteVehicle(id: string): Promise<void> {
    this.vehicles.delete(id);
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = { 
      ...insertSupplier, 
      id, 
      createdAt: new Date() 
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier> {
    const existing = this.suppliers.get(id);
    if (!existing) throw new Error("Supplier not found");
    
    const updated = { ...existing, ...updates };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: string): Promise<void> {
    this.suppliers.delete(id);
  }

  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const item: InventoryItem = { 
      ...insertItem, 
      id, 
      createdAt: new Date() 
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const existing = this.inventoryItems.get(id);
    if (!existing) throw new Error("Inventory item not found");
    
    const updated = { ...existing, ...updates };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    this.inventoryItems.delete(id);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      item => item.trackStock && (item.quantity || 0) <= (item.lowStockThreshold || 5)
    );
  }

  // Jobs
  async getJobs(): Promise<JobWithDetails[]> {
    const jobs = Array.from(this.jobs.values());
    const result: JobWithDetails[] = [];
    
    for (const job of jobs) {
      const customer = this.customers.get(job.customerId);
      const vehicle = this.vehicles.get(job.vehicleId);
      const parts = Array.from(this.jobParts.values()).filter(p => p.jobId === job.id);
      
      if (customer && vehicle) {
        result.push({ ...job, customer, vehicle, parts });
      }
    }
    
    return result;
  }

  async getJob(id: string): Promise<JobWithDetails | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const customer = this.customers.get(job.customerId);
    const vehicle = this.vehicles.get(job.vehicleId);
    const parts = Array.from(this.jobParts.values()).filter(p => p.jobId === job.id);
    
    if (customer && vehicle) {
      return { ...job, customer, vehicle, parts };
    }
    
    return undefined;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = { 
      ...insertJob, 
      id, 
      createdAt: new Date() 
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job> {
    const existing = this.jobs.get(id);
    if (!existing) throw new Error("Job not found");
    
    const updated = { ...existing, ...updates };
    this.jobs.set(id, updated);
    return updated;
  }

  async deleteJob(id: string): Promise<void> {
    this.jobs.delete(id);
    // Also delete associated parts
    Array.from(this.jobParts.entries()).forEach(([partId, part]) => {
      if (part.jobId === id) {
        this.jobParts.delete(partId);
      }
    });
  }

  async getJobsByStatus(status: string): Promise<JobWithDetails[]> {
    const allJobs = await this.getJobs();
    return allJobs.filter(job => job.status === status);
  }

  // Job Parts
  async getJobParts(jobId: string): Promise<JobPart[]> {
    return Array.from(this.jobParts.values()).filter(p => p.jobId === jobId);
  }

  async addJobPart(insertJobPart: InsertJobPart): Promise<JobPart> {
    const id = randomUUID();
    const jobPart: JobPart = { ...insertJobPart, id };
    this.jobParts.set(id, jobPart);
    return jobPart;
  }

  async updateJobPart(id: string, updates: Partial<InsertJobPart>): Promise<JobPart> {
    const existing = this.jobParts.get(id);
    if (!existing) throw new Error("Job part not found");
    
    const updated = { ...existing, ...updates };
    this.jobParts.set(id, updated);
    return updated;
  }

  async deleteJobPart(id: string): Promise<void> {
    this.jobParts.delete(id);
  }

  // Quotes
  async getQuotes(): Promise<QuoteWithDetails[]> {
    const quotes = Array.from(this.quotes.values());
    const result: QuoteWithDetails[] = [];
    
    for (const quote of quotes) {
      const customer = this.customers.get(quote.customerId);
      const vehicle = this.vehicles.get(quote.vehicleId);
      const parts = Array.from(this.quoteParts.values()).filter(p => p.quoteId === quote.id);
      
      if (customer && vehicle) {
        result.push({ ...quote, customer, vehicle, parts });
      }
    }
    
    return result;
  }

  async getQuote(id: string): Promise<QuoteWithDetails | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    const customer = this.customers.get(quote.customerId);
    const vehicle = this.vehicles.get(quote.vehicleId);
    const parts = Array.from(this.quoteParts.values()).filter(p => p.quoteId === quote.id);
    
    if (customer && vehicle) {
      return { ...quote, customer, vehicle, parts };
    }
    
    return undefined;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = { 
      ...insertQuote, 
      id, 
      createdAt: new Date() 
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote> {
    const existing = this.quotes.get(id);
    if (!existing) throw new Error("Quote not found");
    
    const updated = { ...existing, ...updates };
    this.quotes.set(id, updated);
    return updated;
  }

  async deleteQuote(id: string): Promise<void> {
    this.quotes.delete(id);
    // Also delete associated parts
    Array.from(this.quoteParts.entries()).forEach(([partId, part]) => {
      if (part.quoteId === id) {
        this.quoteParts.delete(partId);
      }
    });
  }

  // Quote Parts
  async getQuoteParts(quoteId: string): Promise<QuotePart[]> {
    return Array.from(this.quoteParts.values()).filter(p => p.quoteId === quoteId);
  }

  async addQuotePart(insertQuotePart: InsertQuotePart): Promise<QuotePart> {
    const id = randomUUID();
    const quotePart: QuotePart = { ...insertQuotePart, id };
    this.quoteParts.set(id, quotePart);
    return quotePart;
  }

  async updateQuotePart(id: string, updates: Partial<InsertQuotePart>): Promise<QuotePart> {
    const existing = this.quoteParts.get(id);
    if (!existing) throw new Error("Quote part not found");
    
    const updated = { ...existing, ...updates };
    this.quoteParts.set(id, updated);
    return updated;
  }

  async deleteQuotePart(id: string): Promise<void> {
    this.quoteParts.delete(id);
  }

  // Receipts
  async getReceipts(): Promise<Receipt[]> {
    return Array.from(this.receipts.values());
  }

  async getReceipt(id: string): Promise<Receipt | undefined> {
    return this.receipts.get(id);
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const id = randomUUID();
    const receipt: Receipt = { 
      ...insertReceipt, 
      id, 
      createdAt: new Date() 
    };
    this.receipts.set(id, receipt);
    return receipt;
  }

  // Business Settings
  async getBusinessSettings(): Promise<BusinessSettings | undefined> {
    return this.businessSettings;
  }

  async updateBusinessSettings(settings: InsertBusinessSettings): Promise<BusinessSettings> {
    this.businessSettings = {
      id: this.businessSettings?.id || randomUUID(),
      ...settings,
      updatedAt: new Date(),
    };
    return this.businessSettings;
  }

  // Users (existing functionality)
  async getUser(id: string): Promise<any> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
