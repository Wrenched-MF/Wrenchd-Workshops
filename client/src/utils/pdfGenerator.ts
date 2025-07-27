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
    
    // Get both PDF data and template settings
    const [pdfRes, settingsRes] = await Promise.all([
      apiRequest("POST", "/api/generate-pdf", { type, id }),
      apiRequest("GET", "/api/settings/business")
    ]);
    
    const response = await pdfRes.json();
    const settings = await settingsRes.json();
    
    console.log('PDF response:', response);
    console.log('Template settings:', settings);
    console.log('Settings breakdown:', {
      headerColor: settings.headerColor,
      accentColor: settings.accentColor,
      headerFontSize: settings.headerFontSize,
      fontSize: settings.fontSize,
      showLogo: settings.showLogo,
      logoPosition: settings.logoPosition,
      headerLayout: settings.headerLayout,
      footerText: settings.footerText,
      logoUrl: settings.logoUrl ? 'Present' : 'Missing'
    });
    
    if (response && response.success) {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const data = response.data;
      console.log('PDF data:', data);
      
      // Apply template settings with more detailed debugging
      const headerColor = hexToRgb(settings.headerColor || '#000000');
      const accentColor = hexToRgb(settings.accentColor || '#22c55e');
      const headerFontSize = settings.headerFontSize || 20;
      const fontSize = settings.fontSize || 12;
      const showLogo = settings.showLogo !== false;
      const logoPosition = settings.logoPosition || 'left';
      const headerLayout = settings.headerLayout || 'standard';
      
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
      
      // Add logo if enabled and available
      if (showLogo && settings.logoUrl) {
        try {
          const img = await loadImageFromDataUrl(settings.logoUrl);
          const aspectRatio = img.width / img.height;
          logoWidth = 30;
          const logoHeight = logoWidth / aspectRatio;
          
          if (logoPosition === 'center') {
            doc.addImage(settings.logoUrl, 'JPEG', 105 - logoWidth/2, yPosition, logoWidth, logoHeight);
          } else if (logoPosition === 'right') {
            doc.addImage(settings.logoUrl, 'JPEG', 195 - logoWidth, yPosition, logoWidth, logoHeight);
          } else {
            doc.addImage(settings.logoUrl, 'JPEG', 15, yPosition, logoWidth, logoHeight);
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
        const wrenchdWidth = doc.getTextWidth('WRENCH\'D');
        doc.text('WRENCH\'D', 105 - wrenchdWidth/2, yPosition);
        yPosition += 10;
        
        doc.setFontSize(headerFontSize * 0.7);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        const autoWidth = doc.getTextWidth('AUTO REPAIRS');
        doc.text('AUTO REPAIRS', 105 - autoWidth/2, yPosition);
        yPosition += 15;
        
        // Company details centered
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text('Mobile Mechanic Services | Phone: 07123 456789', 105, yPosition, { align: 'center' });
        yPosition += 5;
        doc.text('Email: info@wrenchd.com | Website: www.wrenchd.co.uk', 105, yPosition, { align: 'center' });
        yPosition += 10;
      } else {
        // Standard or split layout
        let headerX = 15;
        if (logoPosition === 'left' && showLogo && settings.logoUrl) {
          headerX = 15 + logoWidth + 10;
        }
        
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        doc.setFontSize(headerFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text('WRENCH\'D', headerX, yPosition);
        yPosition += 10;
        
        doc.setFontSize(headerFontSize * 0.7);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text('AUTO REPAIRS', headerX, yPosition);
        
        // Company details (right side unless centered)
        if (headerLayout !== 'centered') {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          doc.text('Mobile Mechanic Services', 140, 15);
          doc.text('Phone: 07123 456789', 140, 20);
          doc.text('Email: info@wrenchd.com', 140, 25);
          doc.text('Website: www.wrenchd.co.uk', 140, 30);
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
        // Order details section
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Details:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Supplier: ${data.supplier}`, 15, yPosition);
        doc.text(`Order Date: ${new Date(data.orderDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        
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
        // Return details section
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Return Details:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Supplier: ${data.supplier}`, 15, yPosition);
        doc.text(`Return Date: ${new Date(data.returnDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
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
        // Quote details section
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Quote Details:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Customer: ${data.customer}`, 15, yPosition);
        doc.text(`Quote Date: ${new Date(data.quoteDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        doc.text(`Vehicle: ${data.vehicle}`, 15, yPosition);
        doc.text(`Valid Until: ${new Date(data.validUntil).toLocaleDateString()}`, 110, yPosition);
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
        
      } else if (type === 'receipt') {
        // Receipt details section
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text('Receipt Details:', 15, yPosition);
        yPosition += 8;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(`Customer: ${data.customer}`, 15, yPosition);
        doc.text(`Receipt Date: ${new Date(data.receiptDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        doc.text(`Job: ${data.jobTitle}`, 15, yPosition);
        doc.text(`Payment Method: ${data.paymentMethod}`, 110, yPosition);
        yPosition += 10;
        
        // Services section
        if (data.services && data.services.length > 0) {
          doc.setFontSize(fontSize + 1);
          doc.setFont('helvetica', 'bold');
          doc.text('Services:', 15, yPosition);
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
      
      // Add custom footer if specified
      const pageHeight = doc.internal.pageSize.height;
      yPosition = pageHeight - 30;
      
      if (settings.footerText) {
        doc.setFontSize(fontSize - 2);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(settings.footerText, 105, yPosition, { align: 'center' });
        yPosition += 5;
      }
      
      // Default footer
      doc.setFontSize(fontSize - 4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for choosing WRENCH\'D for your automotive needs!', 105, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('For support, contact us at info@wrenchd.com or call 07123 456789', 105, yPosition, { align: 'center' });
      
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
    
    // Get both PDF data and template settings for preview
    const [pdfRes, settingsRes] = await Promise.all([
      apiRequest("POST", "/api/generate-pdf", { type, id }),
      apiRequest("GET", "/api/settings/business")
    ]);
    
    const response = await pdfRes.json();
    const settings = await settingsRes.json();
    console.log('Preview response:', response);
    console.log('Preview template settings:', settings);
    
    if (response && response.success) {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const data = response.data;
      
      // Apply template settings for preview
      const headerColor = hexToRgb(settings.headerColor || '#000000');
      const accentColor = hexToRgb(settings.accentColor || '#22c55e');
      const headerFontSize = settings.headerFontSize || 20;
      const fontSize = settings.fontSize || 12;
      const showLogo = settings.showLogo !== false;
      const logoPosition = settings.logoPosition || 'left';
      const headerLayout = settings.headerLayout || 'standard';
      
      let yPosition = 15;
      let logoWidth = 0;
      
      // Add logo if enabled and available
      if (showLogo && settings.logoUrl) {
        try {
          const img = await loadImageFromDataUrl(settings.logoUrl);
          const aspectRatio = img.width / img.height;
          logoWidth = 30;
          const logoHeight = logoWidth / aspectRatio;
          
          if (logoPosition === 'center') {
            doc.addImage(settings.logoUrl, 'JPEG', 105 - logoWidth/2, yPosition, logoWidth, logoHeight);
          } else if (logoPosition === 'right') {
            doc.addImage(settings.logoUrl, 'JPEG', 195 - logoWidth, yPosition, logoWidth, logoHeight);
          } else {
            doc.addImage(settings.logoUrl, 'JPEG', 15, yPosition, logoWidth, logoHeight);
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
        const wrenchdWidth = doc.getTextWidth('WRENCH\'D');
        doc.text('WRENCH\'D', 105 - wrenchdWidth/2, yPosition);
        yPosition += 10;
        
        doc.setFontSize(headerFontSize * 0.7);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        const autoWidth = doc.getTextWidth('AUTO REPAIRS');
        doc.text('AUTO REPAIRS', 105 - autoWidth/2, yPosition);
        yPosition += 15;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text('Mobile Mechanic Services | Phone: 07123 456789', 105, yPosition, { align: 'center' });
        yPosition += 5;
        doc.text('Email: info@wrenchd.com | Website: www.wrenchd.co.uk', 105, yPosition, { align: 'center' });
        yPosition += 10;
      } else {
        let headerX = 15;
        if (logoPosition === 'left' && showLogo && settings.logoUrl) {
          headerX = 15 + logoWidth + 10;
        }
        
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        doc.setFontSize(headerFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text('WRENCH\'D', headerX, yPosition);
        yPosition += 10;
        
        doc.setFontSize(headerFontSize * 0.7);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text('AUTO REPAIRS', headerX, yPosition);
        
        if (headerLayout !== 'centered') {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          doc.text('Mobile Mechanic Services', 140, 15);
          doc.text('Phone: 07123 456789', 140, 20);
          doc.text('Email: info@wrenchd.com', 140, 25);
          doc.text('Website: www.wrenchd.co.uk', 140, 30);
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
      
      // Basic content preview with template font size
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      doc.text('Preview - Actual content will vary based on document data', 15, yPosition);
      yPosition += 10;
      
      // Show template styling preview
      doc.setFontSize(fontSize - 2);
      doc.setTextColor(100, 100, 100);
      doc.text(`Template: ${headerLayout} layout, ${fontSize}pt font`, 15, yPosition);
      yPosition += 6;
      doc.text(`Colors: Header ${settings.headerColor || '#000000'}, Accent ${settings.accentColor || '#22c55e'}`, 15, yPosition);
      
      // Add footer if specified
      if (settings.footerText) {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(fontSize - 2);
        doc.setTextColor(100, 100, 100);
        doc.text(settings.footerText, 105, pageHeight - 20, { align: 'center' });
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