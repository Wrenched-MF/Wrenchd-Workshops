import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, insertVehicleSchema, insertSupplierSchema, 
  insertInventoryItemSchema, insertJobSchema, insertQuoteSchema,
  insertPurchaseOrderSchema, insertReturnSchema,
  insertBusinessSettingsSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, validatedData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      await storage.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.get("/api/customers/:customerId/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesByCustomer(req.params.customerId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, validatedData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, validatedData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const items = await storage.getLowStockItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory item data" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/status/:status", async (req, res) => {
    try {
      const jobs = await storage.getJobsByStatus(req.params.status);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs by status" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const validatedData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(req.params.id, validatedData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      await storage.deleteJob(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(validatedData);
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  // Purchase Orders
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const order = await storage.getPurchaseOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase order" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      console.log("Purchase order request body:", JSON.stringify(req.body, null, 2));
      
      // Extract the items from the request to handle separately
      const { items, ...orderData } = req.body;
      
      // Validate the main order data
      const validatedOrderData = insertPurchaseOrderSchema.parse(orderData);
      
      // Create the purchase order first
      const order = await storage.createPurchaseOrder(validatedOrderData);
      
      // Then add the items if they exist
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await storage.addPurchaseOrderItem({
            purchaseOrderId: order.id,
            inventoryItemId: item.inventoryItemId || null,
            itemName: item.itemName,
            itemDescription: item.itemDescription || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice.toString(),
          });
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Purchase order creation error:", error);
      res.status(400).json({ 
        message: "Invalid purchase order data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.put("/api/purchase-orders/:id", async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderSchema.partial().parse(req.body);
      const order = await storage.updatePurchaseOrder(req.params.id, validatedData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update purchase order" });
    }
  });

  app.delete("/api/purchase-orders/:id", async (req, res) => {
    try {
      await storage.deletePurchaseOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete purchase order" });
    }
  });

  // Returns
  app.get("/api/returns", async (req, res) => {
    try {
      const returns = await storage.getReturns();
      res.json(returns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch returns" });
    }
  });

  app.get("/api/returns/:id", async (req, res) => {
    try {
      const returnItem = await storage.getReturn(req.params.id);
      if (!returnItem) {
        return res.status(404).json({ message: "Return not found" });
      }
      res.json(returnItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch return" });
    }
  });

  app.post("/api/returns", async (req, res) => {
    try {
      console.log("Return request body:", JSON.stringify(req.body, null, 2));
      
      // Extract the items from the request to handle separately
      const { items, ...returnData } = req.body;
      
      // Validate the main return data
      const validatedReturnData = insertReturnSchema.parse(returnData);
      
      // Create the return first
      const returnItem = await storage.createReturn(validatedReturnData);
      
      // Then add the items if they exist
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await storage.addReturnItem({
            returnId: returnItem.id,
            inventoryItemId: item.inventoryItemId || null,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice.toString(),
            condition: item.condition,
          });
        }
      }
      
      res.status(201).json(returnItem);
    } catch (error) {
      console.error("Return creation error:", error);
      res.status(400).json({ 
        message: "Invalid return data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.put("/api/returns/:id", async (req, res) => {
    try {
      const validatedData = insertReturnSchema.partial().parse(req.body);
      const returnItem = await storage.updateReturn(req.params.id, validatedData);
      res.json(returnItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update return" });
    }
  });

  app.delete("/api/returns/:id", async (req, res) => {
    try {
      await storage.deleteReturn(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete return" });
    }
  });

  // Receipts
  app.get("/api/receipts", async (req, res) => {
    try {
      const receipts = await storage.getReceipts();
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  // Business Settings
  app.get("/api/settings/business", async (req, res) => {
    try {
      const settings = await storage.getBusinessSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business settings" });
    }
  });

  app.put("/api/settings/business", async (req, res) => {
    try {
      const validatedData = insertBusinessSettingsSchema.parse(req.body);
      const settings = await storage.updateBusinessSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid business settings data" });
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      const vehicles = await storage.getVehicles();
      const jobs = await storage.getJobs();
      const inventory = await storage.getInventoryItems();
      const lowStockItems = await storage.getLowStockItems();
      
      const todayJobs = jobs.filter(job => {
        if (!job.scheduledDate) return false;
        const today = new Date();
        const jobDate = new Date(job.scheduledDate);
        return jobDate.toDateString() === today.toDateString();
      });

      const completedJobs = jobs.filter(job => job.status === 'completed');
      const totalRevenue = completedJobs.reduce((sum, job) => {
        return sum + parseFloat(job.totalAmount || '0');
      }, 0);

      const stats = {
        customersCount: customers.length,
        vehiclesCount: vehicles.length,
        inventoryCount: inventory.length,
        jobsCount: jobs.length,
        todayJobsCount: todayJobs.length,
        completedJobsCount: completedJobs.length,
        lowStockCount: lowStockItems.length,
        totalRevenue: totalRevenue,
        recentJobs: jobs.slice(-5).reverse(),
        lowStockItems: lowStockItems.slice(0, 5)
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
