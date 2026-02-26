import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

/**
 * Helper to load an image from a URL and return it as a base64 string or HTMLImageElement
 */
const loadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Failed to load image:", url);
      resolve(null); // Return null on error so we can skip/fallback
    };
  });
};

/**
 * Generate and download a premium PDF invoice for an order
 */
export const generateInvoice = async (order, seller, buyer) => {
  try {
    const doc = new jsPDF();
    const date = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

    // Branding Colors
    const primaryGreen = [29, 201, 86]; // #1dc956
    const deepGreen = [21, 147, 63];   // Darker green for accents
    const secondaryGray = [100, 116, 139]; // #64748b
    const darkText = [26, 32, 44]; // #1a202c
    const lightBg = [248, 250, 252]; // #f8fafc

    // --- Header Design ---
    doc.setFillColor(...primaryGreen);
    doc.rect(0, 0, 210, 50, "F"); // Header background
    
    // Draw stylized leaf logo primitives
    doc.setFillColor(255, 255, 255);
    // Leaf 1
    doc.ellipse(25, 22, 8, 12, "F"); 
    // Leaf 2
    doc.ellipse(33, 27, 6, 9, "F");
    
    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("AgroMart", 45, 28);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Connecting Growth, Cultivating Trust", 45, 36);

    doc.setFontSize(24);
    doc.text("INVOICE", 155, 28);
    doc.setFontSize(10);
    doc.text(`#${order?.orderID || "N/A"}`, 155, 36);

    // --- Infographic Bar ---
    doc.setFillColor(...deepGreen);
    doc.rect(0, 50, 210, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`DATE ISSUED: ${date}   |   PAYMENT METHOD: ${order?.paymentMethod || "N/A"}   |   STATUS: ${order?.status || "PENDING"}`, 105, 56.5, { align: "center" });

    // --- Bill From / To ---
    const startY = 75;
    
    // Bill From (Seller)
    doc.setTextColor(...primaryGreen);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL FROM", 20, startY);
    
    doc.setDrawColor(...primaryGreen);
    doc.line(20, startY + 2, 45, startY + 2); // Underline

    doc.setTextColor(...darkText);
    doc.setFontSize(11);
    doc.text(seller?.businessName || seller?.name || "AgroMart Partner", 20, startY + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(...secondaryGray);
    doc.setFont("helvetica", "normal");
    doc.text(seller?.email || "", 20, startY + 16);
    doc.text(seller?.phone || "", 20, startY + 21);
    doc.text(seller?.address || "", 20, startY + 26, { maxWidth: 65 });

    // Bill To (Buyer)
    doc.setTextColor(...primaryGreen);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 120, startY);
    
    doc.setDrawColor(...primaryGreen);
    doc.line(120, startY + 2, 140, startY + 2);

    doc.setTextColor(...darkText);
    doc.setFontSize(11);
    doc.text(buyer?.businessName || buyer?.name || "Customer", 120, startY + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(...secondaryGray);
    doc.setFont("helvetica", "normal");
    doc.text(buyer?.email || "", 120, startY + 16);
    doc.text(buyer?.phone || "", 120, startY + 21);
    doc.text(buyer?.address || "", 120, startY + 26, { maxWidth: 70 });

    // --- Items Table with Images ---
    const products = order?.products || [];
    
    // Pre-load all images
    toast.info("Preparing high-quality invoice...", { autoClose: 1000 });
    const productImages = await Promise.all(
      products.map(p => p.image ? loadImage(p.image) : Promise.resolve(null))
    );

    const tableRows = products.map((p, index) => [
      index + 1,
      "", // Placeholder for image
      p.productName || "Product",
      `Rs. ${(p.price || 0).toLocaleString()}`,
      p.quantity || 0,
      `Rs. ${((p.price || 0) * (p.quantity || 0)).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: startY + 45,
      head: [["#", "Image", "Item Description", "Price", "Quantity", "Total"]],
      body: tableRows,
      headStyles: {
        fillColor: primaryGreen,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 4,
      },
      styles: {
        fontSize: 9,
        cellPadding: 10,
        lineWidth: 0.1,
        lineColor: [226, 232, 240],
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 25, halign: "center" }, // Image column
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "right", cellWidth: 35 },
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const img = productImages[data.row.index];
          if (img) {
            const dim = data.cell.height - data.cell.padding('vertical');
            const posX = data.cell.x + (data.cell.width - dim) / 2;
            const posY = data.cell.y + data.cell.padding('top');
            doc.addImage(img, 'JPEG', posX, posY, dim, dim);
          }
        }
      },
      alternateRowStyles: {
        fillColor: lightBg,
      },
    });

    // --- Financial Summary ---
    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 180) + 10;
    
    // Summary Box
    doc.setFillColor(...lightBg);
    doc.rect(130, finalY - 5, 70, 35, "F");
    doc.setDrawColor(...deepGreen);
    doc.setLineWidth(0.5);
    doc.line(130, finalY - 5, 200, finalY - 5);

    doc.setFontSize(10);
    doc.setTextColor(...secondaryGray);
    doc.setFont("helvetica", "normal");
    
    const totalAmount = order?.totalAmount || 0;
    const deliveryCharge = order?.deliveryCharge || 0;
    const subtotal = totalAmount - deliveryCharge;

    doc.text("Subtotal:", 135, finalY + 5);
    doc.text(`Rs. ${subtotal.toLocaleString()}`, 195, finalY + 5, { align: "right" });

    doc.text("Delivery:", 135, finalY + 12);
    doc.text(`Rs. ${deliveryCharge.toLocaleString()}`, 195, finalY + 12, { align: "right" });

    doc.setFillColor(...primaryGreen);
    doc.rect(130, finalY + 18, 70, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 135, finalY + 25);
    doc.text(`Rs. ${totalAmount.toLocaleString()}`, 195, finalY + 25, { align: "right" });

    // --- Signature / Stamp Placeholder ---
    doc.setTextColor(...secondaryGray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Electronically generated invoice by AgroMart Platform", 20, finalY + 25);

    // --- Footer Design ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(...darkText);
    doc.rect(0, pageHeight - 20, 210, 20, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("AgroMart - Growing Together", 105, pageHeight - 10, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text("www.agromart.com  |  support@agromart.com  |  Pokhara, Nepal", 105, pageHeight - 5, { align: "center" });

    // Save the PDF
    doc.save(`Invoice_${order?.orderID || "Order"}.pdf`);
    toast.success("Premium invoice downloaded!");
  } catch (error) {
    console.error("Error generating invoice:", error);
    toast.error("Failed to generate premium invoice.");
  }
};
