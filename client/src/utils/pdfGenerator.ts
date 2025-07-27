import { apiRequest } from "@/lib/queryClient";

export const generatePDF = async (type: string, id: string, fileName?: string) => {
  try {
    console.log('Generating PDF for:', type, id);
    const res = await apiRequest("POST", "/api/generate-pdf", { type, id });
    const response = await res.json();
    console.log('PDF response:', response);
    console.log('Response success:', response?.success);
    console.log('Response data:', response?.data);
    
    if (response && response.success) {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const data = response.data;
      console.log('PDF data:', data);
      
      // Company header with logo space
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('WRENCH\'D', 15, 20);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('AUTO REPAIRS', 15, 28);
      
      // Company details (right side)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Mobile Mechanic Services', 140, 15);
      doc.text('Phone: 07123 456789', 140, 20);
      doc.text('Email: info@wrenchd.com', 140, 25);
      doc.text('Website: www.wrenchd.co.uk', 140, 30);
      
      // Horizontal line
      doc.setLineWidth(0.5);
      doc.line(15, 40, 195, 40);
      
      // Document title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(data.title, 15, 55);
      
      let yPosition = 70;
      
      if (type === 'purchase-order') {
        // Order details section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Details:', 15, yPosition);
        yPosition += 8;
        
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
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPosition, 180, 8, 'F');
        doc.text('Item', 20, yPosition + 5);
        doc.text('Qty', 120, yPosition + 5);
        doc.text('Unit Price', 140, yPosition + 5);
        doc.text('Total', 170, yPosition + 5);
        yPosition += 10;
        
        // Items
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
        doc.text(`Subtotal: £${data.subtotal}`, 140, yPosition);
        yPosition += 6;
        doc.text(`Tax: £${data.tax}`, 140, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: £${data.total}`, 140, yPosition);
        
      } else if (type === 'return') {
        // Return details section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Return Details:', 15, yPosition);
        yPosition += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Supplier: ${data.supplier}`, 15, yPosition);
        doc.text(`Return Date: ${new Date(data.returnDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        doc.text(`Reason: ${data.reason || 'Not specified'}`, 15, yPosition);
        yPosition += 10;
        
        // Items table header
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPosition, 180, 8, 'F');
        doc.text('Item', 20, yPosition + 5);
        doc.text('Qty', 120, yPosition + 5);
        doc.text('Condition', 140, yPosition + 5);
        doc.text('Total', 170, yPosition + 5);
        yPosition += 10;
        
        // Items
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
        doc.setFont('helvetica', 'bold');
        doc.text(`Refund Amount: £${data.refundAmount}`, 140, yPosition);
        
      } else if (type === 'quote') {
        // Quote details section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Quote Details:', 15, yPosition);
        yPosition += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Customer: ${data.customer}`, 15, yPosition);
        doc.text(`Quote Date: ${new Date(data.quoteDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        doc.text(`Vehicle: ${data.vehicle}`, 15, yPosition);
        doc.text(`Valid Until: ${new Date(data.validUntil).toLocaleDateString()}`, 110, yPosition);
        yPosition += 10;
        
        // Labor section
        if (data.laborHours && data.laborRate) {
          doc.setFont('helvetica', 'bold');
          doc.text('Labor:', 15, yPosition);
          yPosition += 6;
          doc.setFont('helvetica', 'normal');
          doc.text(`Hours: ${data.laborHours}`, 20, yPosition);
          doc.text(`Rate: £${data.laborRate}/hour`, 110, yPosition);
          doc.text(`Labor Total: £${(data.laborHours * data.laborRate).toFixed(2)}`, 150, yPosition);
          yPosition += 10;
        }
        
        // Parts section
        if (data.parts && data.parts.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Parts:', 15, yPosition);
          yPosition += 6;
          
          // Parts table header
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
        doc.text(`Subtotal: £${data.subtotal}`, 140, yPosition);
        yPosition += 6;
        doc.text(`Tax: £${data.tax}`, 140, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: £${data.total}`, 140, yPosition);
        
      } else if (type === 'receipt') {
        // Receipt details section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Receipt Details:', 15, yPosition);
        yPosition += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Customer: ${data.customer}`, 15, yPosition);
        doc.text(`Receipt Date: ${new Date(data.receiptDate).toLocaleDateString()}`, 110, yPosition);
        yPosition += 6;
        doc.text(`Job: ${data.jobTitle}`, 15, yPosition);
        doc.text(`Payment Method: ${data.paymentMethod}`, 110, yPosition);
        yPosition += 10;
        
        // Services section
        if (data.services && data.services.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Services:', 15, yPosition);
          yPosition += 6;
          
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
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Paid: £${data.total}`, 140, yPosition);
      }
      
      // Notes section
      if (data.notes) {
        yPosition += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 15, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(data.notes || '', 180);
        doc.text(splitNotes, 15, yPosition);
      }
      
      // Footer with branding
      const footerY = 275;
      doc.setLineWidth(0.5);
      doc.line(15, footerY, 195, footerY);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('WRENCH\'D AUTO REPAIRS', 15, footerY + 5);
      doc.setFont('helvetica', 'normal');
      doc.text('Mobile Mechanic Services - Professional Automotive Solutions', 15, footerY + 10);
      doc.text(`Document generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 15, footerY + 15);
      doc.text('Thank you for choosing WRENCH\'D for your automotive needs!', 15, footerY + 20);
      
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
    const res = await apiRequest("POST", "/api/generate-pdf", { type, id });
    const response = await res.json();
    console.log('Preview response:', response);
    
    if (response && response.success) {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const data = response.data;
      
      // Branded preview header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('WRENCH\'D', 15, 20);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('AUTO REPAIRS', 15, 28);
      
      doc.setFontSize(10);
      doc.text('Mobile Mechanic Services', 140, 15);
      doc.text('Phone: 07123 456789', 140, 20);
      doc.text('Email: info@wrenchd.com', 140, 25);
      
      // Horizontal line
      doc.setLineWidth(0.5);
      doc.line(15, 40, 195, 40);
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(data.title, 15, 55);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Document Type: ${type.toUpperCase().replace('-', ' ')}`, 15, 80);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 95);
      doc.text('Preview Mode - Full document available via Download', 15, 110);
      
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