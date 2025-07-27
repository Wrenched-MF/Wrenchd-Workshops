import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, insertVehicleSchema, insertSupplierSchema, 
  insertInventoryItemSchema, insertJobSchema, insertQuoteSchema,
  insertPurchaseOrderSchema, insertReturnSchema,
  insertBusinessSettingsSchema, insertCustomTemplateSchema
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
      const { jobParts, ...jobData } = req.body;
      const validatedJobData = insertJobSchema.parse(jobData);
      const job = await storage.createJob(validatedJobData);
      
      // Create job parts if provided
      if (jobParts && Array.isArray(jobParts) && jobParts.length > 0) {
        for (const part of jobParts) {
          await storage.addJobPart({
            jobId: job.id,
            inventoryItemId: part.inventoryItemId,
            partName: part.partName,
            partNumber: part.partNumber,
            quantity: part.quantity,
            unitPrice: part.unitPrice.toString(),
            totalPrice: part.totalPrice.toString(),
          });
        }
      }
      
      res.status(201).json(job);
    } catch (error) {
      console.error("Job creation error:", error);
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
      
      // Remove date conversions as Zod schema now handles this
      
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
      
      // If status changed to approved, update inventory stock
      if (validatedData.status === 'approved') {
        const orderDetails = await storage.getPurchaseOrder(req.params.id);
        if (orderDetails && orderDetails.items) {
          for (const item of orderDetails.items) {
            if (item.inventoryItemId) {
              await storage.updateInventoryStock(item.inventoryItemId, item.quantity);
            }
          }
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Purchase order update error:", error);
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
      
      // Remove date conversions as Zod schema now handles this
      
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
      
      // If status changed to approved, reduce inventory stock
      if (validatedData.status === 'approved') {
        const returnDetails = await storage.getReturn(req.params.id);
        if (returnDetails && returnDetails.items) {
          for (const item of returnDetails.items) {
            if (item.inventoryItemId) {
              await storage.updateInventoryStock(item.inventoryItemId, -item.quantity);
            }
          }
        }
      }
      
      res.json(returnItem);
    } catch (error) {
      console.error("Return update error:", error);
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

  // PDF Generation
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { type, id } = req.body;
      
      if (type === 'purchase-order') {
        const order = await storage.getPurchaseOrder(id);
        if (!order) {
          return res.status(404).json({ message: "Purchase order not found" });
        }
        
        const pdfContent = {
          title: `Purchase Order ${order.orderNumber}`,
          supplier: order.supplier.name,
          orderDate: order.orderDate,
          expectedDelivery: order.expectedDelivery,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          notes: order.notes
        };
        
        res.json({ success: true, data: pdfContent });
        
      } else if (type === 'return') {
        const returnItem = await storage.getReturn(id);
        if (!returnItem) {
          return res.status(404).json({ message: "Return not found" });
        }
        
        const pdfContent = {
          title: `Return ${returnItem.returnNumber}`,
          supplier: returnItem.supplier.name,
          returnDate: returnItem.returnDate,
          reason: returnItem.reason,
          items: returnItem.items,
          refundAmount: returnItem.refundAmount,
          notes: returnItem.notes
        };
        
        res.json({ success: true, data: pdfContent });
        
      } else if (type === 'quote') {
        const quote = await storage.getQuote(id);
        if (!quote) {
          return res.status(404).json({ message: "Quote not found" });
        }
        
        const pdfContent = {
          title: `Quote ${quote.quoteNumber}`,
          customer: quote.customer?.name || 'Unknown',
          vehicle: `${quote.vehicle?.year} ${quote.vehicle?.make} ${quote.vehicle?.model}`,
          quoteDate: quote.quoteDate,
          validUntil: quote.validUntil,
          laborHours: quote.laborHours,
          laborRate: quote.laborRate,
          parts: quote.parts,
          subtotal: quote.subtotal,
          tax: quote.tax,
          total: quote.total,
          notes: quote.notes
        };
        
        res.json({ success: true, data: pdfContent });
        
      } else if (type === 'receipt') {
        const receipt = await storage.getReceipt(id);
        if (!receipt) {
          return res.status(404).json({ message: "Receipt not found" });
        }
        
        const pdfContent = {
          title: `Receipt ${receipt.receiptNumber}`,
          customer: receipt.customer?.name || 'Unknown',
          jobTitle: receipt.job?.title || 'Service',
          receiptDate: receipt.receiptDate,
          paymentMethod: receipt.paymentMethod,
          services: receipt.services || [],
          total: receipt.totalAmount,
          notes: receipt.notes
        };
        
        res.json({ success: true, data: pdfContent });
        
      } else {
        res.status(400).json({ message: "Invalid PDF type" });
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Receipts
  app.get("/api/receipts", async (req, res) => {
    try {
      const receipts = await storage.getReceipts();
      // Also include approved purchase orders and returns as downloadable documents
      const approvedPurchaseOrders = await storage.getPurchaseOrders();
      const approvedReturns = await storage.getReturns();
      
      const pdfDocuments = [
        ...approvedPurchaseOrders
          .filter(order => order.status === 'approved')
          .map(order => ({
            id: order.id,
            type: 'purchase-order',
            title: `Purchase Order ${order.orderNumber}`,
            date: order.orderDate,
            amount: order.total,
            supplier: order.supplier?.name || 'Unknown',
            description: `Purchase order for ${order.items?.length || 0} items`
          })),
        ...approvedReturns
          .filter(returnItem => returnItem.status === 'approved')
          .map(returnItem => ({
            id: returnItem.id,
            type: 'return',
            title: `Return ${returnItem.returnNumber}`,
            date: returnItem.returnDate,
            amount: returnItem.refundAmount,
            supplier: returnItem.supplier?.name || 'Unknown',
            description: `Return for ${returnItem.items?.length || 0} items`
          }))
      ];
      
      res.json({ receipts, pdfDocuments });
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

  // Custom Templates Routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getCustomTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = insertCustomTemplateSchema.parse(req.body);
      const template = await storage.createCustomTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const templateData = insertCustomTemplateSchema.parse(req.body);
      const template = await storage.updateCustomTemplate(id, templateData);
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteCustomTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  app.post("/api/templates/:id/activate", async (req, res) => {
    try {
      const id = req.params.id;
      const template = await storage.activateCustomTemplate(id);
      res.json(template);
    } catch (error) {
      console.error("Error activating template:", error);
      res.status(500).json({ error: "Failed to activate template" });
    }
  });

  app.get("/api/templates/active", async (req, res) => {
    try {
      const template = await storage.getActiveCustomTemplate();
      res.json(template);
    } catch (error) {
      console.error("Error fetching active template:", error);
      res.status(500).json({ error: "Failed to fetch active template" });
    }
  });

  app.get("/api/templates/active/:type", async (req, res) => {
    try {
      const template = await storage.getActiveCustomTemplateByType(req.params.type);
      res.json(template);
    } catch (error) {
      console.error("Error fetching active template by type:", error);
      res.status(500).json({ error: "Failed to fetch active template" });
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
