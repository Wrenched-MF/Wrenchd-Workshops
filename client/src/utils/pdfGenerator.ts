import { apiRequest } from "@/lib/queryClient";

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Helper function to load image from data URL
const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};

export const generatePDF = async (type: string, id: string, fileName?: string) => {
  try {
    console.log('Generating PDF for:', type, id);
    
    // Map document types to template types
    const templateTypeMap: { [key: string]: string } = {
      'receipt': 'receipt',
      'quote': 'quote', 
      'purchase-order': 'purchase_order',
      'return': 'return'
    };
    
    const templateType = templateTypeMap[type] || 'general';
    
    // Get PDF data, business settings, and active template for this document type
    const [pdfRes, settingsRes, templateRes] = await Promise.all([
      apiRequest("POST", "/api/generate-pdf", { type, id }),
      apiRequest("GET", "/api/settings/business"),
      apiRequest("GET", `/api/templates/active/${templateType}`)
    ]);
    
    const response = await pdfRes.json();
    const settings = await settingsRes.json();
    const templateResponse = await templateRes.json();
    
    console.log('PDF response:', response);
    console.log('Business settings:', settings);
    console.log('Raw template response for', templateType, ':', templateResponse);
    console.log('Template response status:', templateRes.status);
    console.log('Template response type:', typeof templateResponse);
    console.log('Template has ID?', templateResponse?.id ? 'YES' : 'NO');
    
    // Use active template settings if available, otherwise fall back to business settings
    const activeTemplate = templateResponse && templateResponse.id ? templateResponse : null;
    const templateSettings = activeTemplate || settings;
    
    console.log('Using template:', activeTemplate ? 'Custom template' : 'Business settings');
    console.log('Template name:', activeTemplate?.templateName || 'Default');
    
    console.log('Final template settings:', {
      source: activeTemplate ? 'Custom Template' : 'Business Settings',
      templateName: activeTemplate?.templateName || 'Default',
      companyName: templateSettings.companyName || templateSettings.businessName,
      headerColor: templateSettings.headerColor || templateSettings.primaryColor,
      accentColor: templateSettings.accentColor || templateSettings.secondaryColor,
      headerFontSize: templateSettings.headerFontSize,
      fontSize: templateSettings.fontSize,
      showLogo: templateSettings.showLogo || templateSettings.showCompanyLogo,
      logoPosition: templateSettings.logoPosition,
      headerLayout: templateSettings.headerLayout,
      footerText: templateSettings.footerText,
      logoUrl: templateSettings.logoUrl ? 'Present' : 'Missing'
    });
    
    if (response && response.success) {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const data = response.data;
      console.log('PDF data:', data);
      
      // Apply template settings with more detailed debugging
      const headerColor = hexToRgb(templateSettings.headerColor || templateSettings.primaryColor || '#000000');
      const accentColor = hexToRgb(templateSettings.accentColor || templateSettings.secondaryColor || '#22c55e');
      const headerFontSize = templateSettings.headerFontSize || 20;
      const fontSize = templateSettings.fontSize || 12;
      const showLogo = (templateSettings.showLogo || templateSettings.showCompanyLogo) !== false;
      const logoPosition = templateSettings.logoPosition || 'left';
      const headerLayout = templateSettings.headerLayout || 'standard';
      const companyName = templateSettings.companyName || templateSettings.businessName || "WRENCH'D Auto Repairs";
      
      console.log('Applied settings:', {
        headerColor: `rgb(${headerColor.r}, ${headerColor.g}, ${headerColor.b})`,
        accentColor: `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
        headerFontSize,
        fontSize,
        showLogo,
        logoPosition,
        headerLayout
      });
      
      let yPosition = 15;
      let logoWidth = 0;
      
      // Add logo if enabled and available (use template logo or fallback to business logo)
      const logoUrl = templateSettings.logoUrl || settings.logoUrl;
      if (showLogo && logoUrl) {
        try {
          const img = await loadImageFromDataUrl(logoUrl);
          const aspectRatio = img.width / img.height;
          logoWidth = 30;
          const logoHeight = logoWidth / aspectRatio;
          
          if (logoPosition === 'center') {
            doc.addImage(logoUrl, 'JPEG', 105 - logoWidth/2, yPosition, logoWidth, logoHeight);
          } else if (logoPosition === 'right') {
            doc.addImage(logoUrl, 'JPEG', 195 - logoWidth, yPosition, logoWidth, logoHeight);
          } else {
            doc.addImage(logoUrl, 'JPEG', 15, yPosition, logoWidth, logoHeight);
          }
          
          yPosition += logoHeight + 5;
        } catch (error) {
          console.log('Could not load logo image:', error);
        }
      }
      
      // Company header with customizable styling
      if (headerLayout === 'centered') {
        // Centered layout
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        doc.setFontSize(headerFontSize);
        doc.setFont('helvetica', 'bold');
        const companyWidth = doc.getTextWidth(companyName);
        doc.text(companyName, 105 - companyWidth/2, yPosition);
        yPosition += 10;
        
        doc.setFontSize(headerFontSize * 0.7);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        const autoWidth = doc.getTextWidth('AUTO REPAIRS');
        doc.text('AUTO REPAIRS', 105 - autoWidth/2, yPosition);
        yPosition += 15;
        
        // Company details centered (use template data or fallback)
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const phone = templateSettings.phone || settings.businessPhone || '07123 456789';
        const email = templateSettings.email || settings.businessEmail || 'info@wrenchd.com';
        doc.text(`Mobile Mechanic Services | Phone: ${phone}`, 105, yPosition, { align: 'center' });
        yPosition += 5;
        doc.text(`Email: ${email}`, 105, yPosition, { align: 'center' });
        yPosition += 10;
      } else {
        // Standard or split layout
        let headerX = 15;
        if (logoPosition === 'left' && showLogo && logoUrl) {
          headerX = 15 + logoWidth + 10;
        }
        
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        doc.setFontSize(headerFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, headerX, yPosition);
        yPosition += 10;
        
        doc.setFontSize(headerFontSize * 0.7);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text('AUTO REPAIRS', headerX, yPosition);
        
        // Company details (right side unless centered) - use template data or fallback
        if (headerLayout !== 'centered') {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          const phone = templateSettings.phone || settings.businessPhone || '07123 456789';
          const email = templateSettings.email || settings.businessEmail || 'info@wrenchd.com';
          doc.text('Mobile Mechanic Services', 140, 15);
          doc.text(`Phone: ${phone}`, 140, 20);
          doc.text(`Email: ${email}`, 140, 25);
        }
        
        yPosition = Math.max(yPosition + 5, 35);
      }
      
      // Horizontal line
      doc.setLineWidth(0.5);
      doc.line(15, yPosition + 5, 195, yPosition + 5);
      yPosition += 15;
      
      // Document title
      doc.setFontSize(fontSize + 6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(data.title, 15, yPosition);
      yPosition += 15;
      
      if (type === 'purchase-order') {
        // Supplier Information
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Supplier Information:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Supplier: ${data.supplier}`, 15, yPosition);
        doc.text(`Order Date: ${new Date(data.orderDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        if (data.supplierPhone) {
          doc.text(`Phone: ${data.supplierPhone}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.supplierEmail) {
          doc.text(`Email: ${data.supplierEmail}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.supplierAddress) {
          doc.text(`Address: ${data.supplierAddress}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.expectedDelivery) {
          doc.text(`Expected Delivery: ${new Date(data.expectedDelivery).toLocaleDateString()}`, 15, yPosition);
          yPosition += 6;
        }
        
        yPosition += 10;
        
        // Items table header
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPosition, 180, 8, 'F');
        doc.text('Item', 20, yPosition + 5);
        doc.text('Qty', 120, yPosition + 5);
        doc.text('Unit Price', 140, yPosition + 5);
        doc.text('Total', 170, yPosition + 5);
        yPosition += 10;
        
        // Items
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        data.items.forEach((item: any) => {
          doc.text(item.itemName, 20, yPosition);
          doc.text(item.quantity.toString(), 125, yPosition);
          doc.text(`£${item.unitPrice}`, 145, yPosition);
          doc.text(`£${item.totalPrice}`, 175, yPosition);
          yPosition += 6;
        });
        
        // Totals section
        yPosition += 10;
        doc.line(140, yPosition, 195, yPosition);
        yPosition += 5;
        doc.setFontSize(fontSize);
        doc.text(`Subtotal: £${data.subtotal}`, 140, yPosition);
        yPosition += 6;
        doc.text(`Tax: £${data.tax}`, 140, yPosition);
        yPosition += 6;
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: £${data.total}`, 140, yPosition);
        
      } else if (type === 'return') {
        // Supplier Information
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Supplier Information:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Supplier: ${data.supplier}`, 15, yPosition);
        doc.text(`Return Date: ${new Date(data.returnDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        if (data.supplierPhone) {
          doc.text(`Phone: ${data.supplierPhone}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.supplierEmail) {
          doc.text(`Email: ${data.supplierEmail}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.supplierAddress) {
          doc.text(`Address: ${data.supplierAddress}`, 15, yPosition);
          yPosition += 6;
        }
        doc.text(`Reason: ${data.reason || 'Not specified'}`, 15, yPosition);
        yPosition += 10;
        
        // Items table header
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPosition, 180, 8, 'F');
        doc.text('Item', 20, yPosition + 5);
        doc.text('Qty', 120, yPosition + 5);
        doc.text('Condition', 140, yPosition + 5);
        doc.text('Total', 170, yPosition + 5);
        yPosition += 10;
        
        // Items
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        data.items.forEach((item: any) => {
          doc.text(item.itemName, 20, yPosition);
          doc.text(item.quantity.toString(), 125, yPosition);
          doc.text(item.condition, 145, yPosition);
          doc.text(`£${item.totalPrice}`, 175, yPosition);
          yPosition += 6;
        });
        
        // Refund amount
        yPosition += 10;
        doc.line(140, yPosition, 195, yPosition);
        yPosition += 5;
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(`Refund Amount: £${data.refundAmount}`, 140, yPosition);
        
      } else if (type === 'quote') {
        // Customer & Vehicle Information
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${data.customer}`, 15, yPosition);
        doc.text(`Quote Date: ${new Date(data.quoteDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        if (data.customerPhone) {
          doc.text(`Phone: ${data.customerPhone}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.customerEmail) {
          doc.text(`Email: ${data.customerEmail}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.customerAddress) {
          doc.text(`Address: ${data.customerAddress}`, 15, yPosition);
          yPosition += 6;
        }
        
        yPosition += 5;
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Vehicle Information:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Vehicle: ${data.vehicle}`, 15, yPosition);
        doc.text(`Valid Until: ${new Date(data.validUntil).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        if (data.vehiclePlate) {
          doc.text(`Registration: ${data.vehiclePlate}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.vehicleMileage) {
          doc.text(`Mileage: ${data.vehicleMileage}`, 15, yPosition);
          yPosition += 6;
        }
        yPosition += 10;
        
        // Labor section
        if (data.laborHours && data.laborRate) {
          doc.setFontSize(fontSize + 1);
          doc.setFont('helvetica', 'bold');
          doc.text('Labor:', 15, yPosition);
          yPosition += 6;
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', 'normal');
          doc.text(`Hours: ${data.laborHours}`, 20, yPosition);
          doc.text(`Rate: £${data.laborRate}/hour`, 110, yPosition);
          doc.text(`Labor Total: £${(data.laborHours * data.laborRate).toFixed(2)}`, 150, yPosition);
          yPosition += 10;
        }
        
        // Parts section
        if (data.parts && data.parts.length > 0) {
          doc.setFontSize(fontSize + 1);
          doc.setFont('helvetica', 'bold');
          doc.text('Parts:', 15, yPosition);
          yPosition += 6;
          
          // Parts table header
          doc.setFontSize(fontSize);
          doc.setFillColor(240, 240, 240);
          doc.rect(15, yPosition, 180, 8, 'F');
          doc.text('Part', 20, yPosition + 5);
          doc.text('Qty', 120, yPosition + 5);
          doc.text('Unit Price', 140, yPosition + 5);
          doc.text('Total', 170, yPosition + 5);
          yPosition += 10;
          
          // Parts
          doc.setFont('helvetica', 'normal');
          data.parts.forEach((part: any) => {
            doc.text(part.name, 20, yPosition);
            doc.text(part.quantity.toString(), 125, yPosition);
            doc.text(`£${part.unitPrice}`, 145, yPosition);
            doc.text(`£${part.totalPrice}`, 175, yPosition);
            yPosition += 6;
          });
          yPosition += 5;
        }
        
        // Quote totals section
        yPosition += 10;
        doc.line(140, yPosition, 195, yPosition);
        yPosition += 5;
        doc.setFontSize(fontSize);
        if (data.partsTotal) {
          doc.text(`Parts Total: £${data.partsTotal}`, 140, yPosition);
          yPosition += 6;
        }
        if (data.laborTotal) {
          doc.text(`Labor Total: £${data.laborTotal}`, 140, yPosition);
          yPosition += 6;
        }
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Estimate: £${data.totalAmount}`, 140, yPosition);
        
      } else if (type === 'receipt') {
        // Customer Information
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${data.customer}`, 15, yPosition);
        doc.text(`Receipt Date: ${new Date(data.receiptDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        if (data.customerPhone) {
          doc.text(`Phone: ${data.customerPhone}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.customerEmail) {
          doc.text(`Email: ${data.customerEmail}`, 15, yPosition);
          yPosition += 6;
        }
        if (data.customerAddress) {
          doc.text(`Address: ${data.customerAddress}`, 15, yPosition);
          yPosition += 6;
        }
        
        // Vehicle Information
        if (data.vehicle) {
          yPosition += 5;
          doc.setFontSize(fontSize + 2);
          doc.setFont('helvetica', 'bold');
          doc.text('Vehicle Information:', 15, yPosition);
          yPosition += 8;
          
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', 'normal');
          doc.text(`Vehicle: ${data.vehicle}`, 15, yPosition);
          doc.text(`Payment Method: ${data.paymentMethod}`, 110, yPosition);
          yPosition += 6;
          if (data.vehiclePlate) {
            doc.text(`Registration: ${data.vehiclePlate}`, 15, yPosition);
            yPosition += 6;
          }
          if (data.vehicleMileage) {
            doc.text(`Mileage: ${data.vehicleMileage}`, 15, yPosition);
            yPosition += 6;
          }
        }
        
        // Job Information
        yPosition += 5;
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Service Details:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Service: ${data.jobTitle}`, 15, yPosition);
        if (data.jobNumber) {
          doc.text(`Job Number: ${data.jobNumber}`, 110, yPosition);
        }
        yPosition += 10;
        
        // Labor section
        if (data.laborHours && data.laborRate) {
          doc.setFontSize(fontSize + 1);
          doc.setFont('helvetica', 'bold');
          doc.text('Labor:', 15, yPosition);
          yPosition += 6;
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', 'normal');
          doc.text(`Hours: ${data.laborHours}`, 20, yPosition);
          doc.text(`Rate: £${data.laborRate}/hour`, 80, yPosition);
          doc.text(`Labor Total: £${data.laborTotal}`, 150, yPosition);
          yPosition += 10;
        }
        
        // Parts section
        if (data.parts && data.parts.length > 0) {
          doc.setFontSize(fontSize + 1);
          doc.setFont('helvetica', 'bold');
          doc.text('Parts Used:', 15, yPosition);
          yPosition += 6;
          
          // Parts table header
          doc.setFontSize(fontSize);
          doc.setFillColor(240, 240, 240);
          doc.rect(15, yPosition, 180, 8, 'F');
          doc.text('Part', 20, yPosition + 5);
          doc.text('Qty', 120, yPosition + 5);
          doc.text('Unit Price', 140, yPosition + 5);
          doc.text('Total', 170, yPosition + 5);
          yPosition += 10;
          
          // Parts
          doc.setFont('helvetica', 'normal');
          data.parts.forEach((part: any) => {
            doc.text(part.name, 20, yPosition);
            doc.text(part.quantity.toString(), 125, yPosition);
            doc.text(`£${part.unitPrice}`, 145, yPosition);
            doc.text(`£${part.totalPrice}`, 175, yPosition);
            yPosition += 6;
          });
          yPosition += 5;
        }
        
        // Services section (if any additional services)
        if (data.services && data.services.length > 0) {
          doc.setFontSize(fontSize + 1);
          doc.setFont('helvetica', 'bold');
          doc.text('Additional Services:', 15, yPosition);
          yPosition += 6;
          
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', 'normal');
          data.services.forEach((service: any) => {
            doc.text(`• ${service.description}`, 20, yPosition);
            doc.text(`£${service.amount}`, 175, yPosition);
            yPosition += 6;
          });
          yPosition += 5;
        }
        
        // Total section
        yPosition += 10;
        doc.line(140, yPosition, 195, yPosition);
        yPosition += 5;
        if (data.partsTotal) {
          doc.setFontSize(fontSize);
          doc.text(`Parts Total: £${data.partsTotal}`, 140, yPosition);
          yPosition += 6;
        }
        if (data.laborTotal) {
          doc.text(`Labor Total: £${data.laborTotal}`, 140, yPosition);
          yPosition += 6;
        }
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Paid: £${data.total}`, 140, yPosition);
      }
      
      // Notes section
      if (data.notes) {
        yPosition += 15;
        doc.setFontSize(fontSize + 1);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 15, yPosition);
        yPosition += 6;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(data.notes || '', 180);
        doc.text(splitNotes, 15, yPosition);
      }
      
      // Add custom footer if specified (use template footer or fallback)
      const pageHeight = doc.internal.pageSize.height;
      yPosition = pageHeight - 30;
      
      const footerText = templateSettings.footerText || settings.footerText;
      if (footerText) {
        doc.setFontSize(fontSize - 2);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(footerText, 105, yPosition, { align: 'center' });
        yPosition += 5;
      }
      
      // Default footer with template company name
      doc.setFontSize(fontSize - 4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const phone = templateSettings.phone || settings.businessPhone || '07123 456789';
      const email = templateSettings.email || settings.businessEmail || 'info@wrenchd.com';
      doc.text(`Thank you for choosing ${companyName} for your automotive needs!`, 105, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text(`For support, contact us at ${email} or call ${phone}`, 105, yPosition, { align: 'center' });
      
      // Download the PDF
      const downloadFileName = fileName || `WRENCHD_${data.title.replace(/\s+/g, '_')}.pdf`;
      console.log('Saving PDF as:', downloadFileName);
      doc.save(downloadFileName);
      console.log('PDF saved successfully');
      
      return true;
    } else {
      console.error('PDF generation failed: response not successful');
      return false;
    }
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
};

export const previewPDF = async (type: string, id: string) => {
  try {
    console.log('Previewing PDF for:', type, id);
    
    // Map document types to template types
    const templateTypeMap: { [key: string]: string } = {
      'receipt': 'receipt',
      'quote': 'quote', 
      'purchase-order': 'purchase_order',
      'return': 'return'
    };
    
    const templateType = templateTypeMap[type] || 'general';
    
    // Get PDF data, business settings, and active template for preview
    const [pdfRes, settingsRes, templateRes] = await Promise.all([
      apiRequest("POST", "/api/generate-pdf", { type, id }),
      apiRequest("GET", "/api/settings/business"),
      apiRequest("GET", `/api/templates/active/${templateType}`)
    ]);
    
    const response = await pdfRes.json();
    const settings = await settingsRes.json();
    const templateResponse = await templateRes.json();
    
    console.log('Preview response:', response);
    console.log('Preview business settings:', settings);
    console.log('Preview template response for', templateType, ':', templateResponse);
    
    // Use active template settings if available, otherwise fall back to business settings
    const activeTemplate = templateResponse && templateResponse.id ? templateResponse : null;
    const templateSettings = activeTemplate || settings;
    
    console.log('Preview using template:', activeTemplate ? 'Custom template' : 'Business settings');
    console.log('Preview template name:', activeTemplate?.templateName || 'Default');
    
    if (response && response.success) {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const data = response.data;
      
      // Apply template settings for preview
      const headerColor = hexToRgb(templateSettings.headerColor || templateSettings.primaryColor || '#000000');
      const accentColor = hexToRgb(templateSettings.accentColor || templateSettings.secondaryColor || '#22c55e');
      const headerFontSize = templateSettings.headerFontSize || 20;
      const fontSize = templateSettings.fontSize || 12;
      const showLogo = (templateSettings.showLogo || templateSettings.showCompanyLogo) !== false;
      const logoPosition = templateSettings.logoPosition || 'left';
      const headerLayout = templateSettings.headerLayout || 'standard';
      const companyName = templateSettings.companyName || templateSettings.businessName || "WRENCH'D Auto Repairs";
      
      let yPosition = 15;
      let logoWidth = 0;
      
      // Add logo if enabled and available (use template logo or fallback)
      const logoUrl = templateSettings.logoUrl || settings.logoUrl;
      if (showLogo && logoUrl) {
        try {
          const img = await loadImageFromDataUrl(logoUrl);
          const aspectRatio = img.width / img.height;
          logoWidth = 30;
          const logoHeight = logoWidth / aspectRatio;
          
          if (logoPosition === 'center') {
            doc.addImage(logoUrl, 'JPEG', 105 - logoWidth/2, yPosition, logoWidth, logoHeight);
          } else if (logoPosition === 'right') {
            doc.addImage(logoUrl, 'JPEG', 195 - logoWidth, yPosition, logoWidth, logoHeight);
          } else {
            doc.addImage(logoUrl, 'JPEG', 15, yPosition, logoWidth, logoHeight);
          }
          
          yPosition += logoHeight + 5;
        } catch (error) {
          console.log('Could not load logo image in preview:', error);
        }
      }
      
      // Company header with template styling
      if (headerLayout === 'centered') {
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        doc.setFontSize(headerFontSize);
        doc.setFont('helvetica', 'bold');
        const companyWidth = doc.getTextWidth(companyName);
        doc.text(companyName, 105 - companyWidth/2, yPosition);
        yPosition += 10;
        
        doc.setFontSize(headerFontSize * 0.7);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        const autoWidth = doc.getTextWidth('AUTO REPAIRS');
        doc.text('AUTO REPAIRS', 105 - autoWidth/2, yPosition);
        yPosition += 15;
        
        // Company details centered (use template data or fallback)
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const phone = templateSettings.phone || settings.businessPhone || '07123 456789';
        const email = templateSettings.email || settings.businessEmail || 'info@wrenchd.com';
        doc.text(`Mobile Mechanic Services | Phone: ${phone}`, 105, yPosition, { align: 'center' });
        yPosition += 5;
        doc.text(`Email: ${email}`, 105, yPosition, { align: 'center' });
        yPosition += 10;
      } else {
        let headerX = 15;
        if (logoPosition === 'left' && showLogo && logoUrl) {
          headerX = 15 + logoWidth + 10;
        }
        
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        doc.setFontSize(headerFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, headerX, yPosition);
        yPosition += 10;
        
        doc.setFontSize(headerFontSize * 0.7);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text('AUTO REPAIRS', headerX, yPosition);
        
        if (headerLayout !== 'centered') {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          const phone = templateSettings.phone || settings.businessPhone || '07123 456789';
          const email = templateSettings.email || settings.businessEmail || 'info@wrenchd.com';
          doc.text('Mobile Mechanic Services', 140, 15);
          doc.text(`Phone: ${phone}`, 140, 20);
          doc.text(`Email: ${email}`, 140, 25);
        }
        
        yPosition = Math.max(yPosition + 5, 35);
      }
      
      // Horizontal line
      doc.setLineWidth(0.5);
      doc.line(15, yPosition + 5, 195, yPosition + 5);
      yPosition += 15;
      
      // Document title with template font size
      doc.setFontSize(fontSize + 6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(data.title, 15, yPosition);
      
      yPosition += 15;
      
      // Document Info Header (right aligned)
      doc.setFontSize(fontSize + 4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
      doc.text(data.documentType || 'RECEIPT', 195, yPosition, { align: 'right' });
      yPosition += 8;
      
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Receipt #: ${data.receiptNumber || 'N/A'}`, 195, yPosition, { align: 'right' });
      yPosition += 6;
      doc.text(`Date: ${data.date || new Date().toLocaleDateString('en-GB')}`, 195, yPosition, { align: 'right' });
      yPosition += 15;
      
      // Customer & Vehicle Information - Professional Layout
      doc.setFontSize(fontSize + 1);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPosition - 3, 85, 8, 'F');
      doc.text('Bill To:', 18, yPosition + 2);
      doc.rect(110, yPosition - 3, 85, 8, 'F');
      doc.text('Vehicle Details:', 113, yPosition + 2);
      yPosition += 12;
      
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.customer || 'Customer Name'}`, 15, yPosition);
      doc.text(`${data.vehicleYear || ''} ${data.vehicleMake || ''} ${data.vehicleModel || ''}`, 110, yPosition);
      yPosition += 6;
      if (data.customerPhone) {
        doc.text(`Phone: ${data.customerPhone}`, 15, yPosition);
      }
      if (data.vehicleRegistration) {
        doc.text(`Registration: ${data.vehicleRegistration}`, 110, yPosition);
      }
      yPosition += 6;
      if (data.customerEmail) {
        doc.text(`Email: ${data.customerEmail}`, 15, yPosition);
      }
      if (data.vehicleMileage) {
        doc.text(`Mileage: ${data.vehicleMileage}`, 110, yPosition);
      }
      yPosition += 6;
      if (data.customerAddress) {
        const addressLines = doc.splitTextToSize(data.customerAddress, 85);
        doc.text(addressLines, 15, yPosition);
        yPosition += addressLines.length * 6;
      }
      
      yPosition += 15;
      
      // Work Description
      if (data.jobDescription) {
        doc.setFontSize(fontSize + 1);
        doc.setFont('helvetica', 'bold');
        doc.text('Work Performed:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        const descriptionLines = doc.splitTextToSize(data.jobDescription, 180);
        doc.text(descriptionLines, 15, yPosition);
        yPosition += descriptionLines.length * 6 + 10;
      }
      
      // Items table header
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, 180, 8, 'F');
      doc.text('Description', 20, yPosition + 5);
      doc.text('Qty', 120, yPosition + 5);
      doc.text('Price', 145, yPosition + 5);
      doc.text('Total', 170, yPosition + 5);
      yPosition += 10;
      
      // Labor row
      doc.setFont('helvetica', 'normal');
      if (data.laborHours && data.laborRate) {
        doc.text(`Labor (${data.laborHours} hours)`, 20, yPosition);
        doc.text(data.laborHours.toString(), 125, yPosition);
        doc.text(`£${data.laborRate}`, 150, yPosition);
        doc.text(`£${data.laborTotal}`, 175, yPosition);
        yPosition += 6;
      }
      
      // Parts rows
      if (data.parts && data.parts.length > 0) {
        data.parts.forEach((part: any) => {
          doc.text(part.name || 'Part', 20, yPosition);
          doc.text(part.quantity?.toString() || '1', 125, yPosition);
          doc.text(`£${part.unitPrice || '0.00'}`, 150, yPosition);
          doc.text(`£${part.totalPrice || '0.00'}`, 175, yPosition);
          yPosition += 6;
        });
      }
      
      // Totals section
      yPosition += 10;
      doc.line(140, yPosition, 195, yPosition);
      yPosition += 5;
      doc.setFontSize(fontSize);
      if (data.subtotal) {
        doc.text(`Subtotal: £${data.subtotal}`, 140, yPosition);
        yPosition += 6;
      }
      if (data.vatAmount) {
        doc.text(`VAT (${data.vatRate || 20}%): £${data.vatAmount}`, 140, yPosition);
        yPosition += 6;
      }
      doc.setFontSize(fontSize + 2);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: £${data.total || '0.00'}`, 140, yPosition);
      
      // Add footer if specified (use template footer or fallback)
      const footerText = templateSettings.footerText || settings.footerText;
      if (footerText) {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(fontSize - 2);
        doc.setTextColor(100, 100, 100);
        doc.text(footerText, 105, pageHeight - 20, { align: 'center' });
      }
      
      // Create blob and open in new window
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        alert('Please allow popups to preview PDFs');
        return false;
      }
      
      console.log('PDF preview opened successfully');
      return true;
    } else {
      console.error('PDF preview failed: response not successful');
      return false;
    }
  } catch (error) {
    console.error('PDF preview failed:', error);
    return false;
  }
};