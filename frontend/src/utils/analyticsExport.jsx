import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Generates a two-page PDF with AgroMart branding containing analytics for both the Current and Previous month.
 *
 * @param {Object} captureRef - The React ref pointing to the analytics container to capture.
 * @param {Function} setTimeFilter - State setter for the "current"|"last" filter.
 * @param {String} restoreFilter - The current state to restore after capturing.
 */
export const generateDualMonthAnalyticsPDF = async (
  captureRef,
  setTimeFilter,
  restoreFilter,
) => {
  if (!captureRef || !captureRef.current) return;

  try {
    // 1. Capture Current Month
    setTimeFilter("current");
    // Wait for state update and recharts animations (Recharts default animation is usually ~1s, we wait 800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));
    const canvasCurrent = await html2canvas(captureRef.current, {
      scale: 2, // Higher density for better quality
      useCORS: true,
      logging: false,
      backgroundColor: "#f1f5f9",
    });

    // 2. Capture Previous Month
    setTimeFilter("last");
    await new Promise((resolve) => setTimeout(resolve, 800));
    const canvasLast = await html2canvas(captureRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#f1f5f9",
    });

    // 3. Restore original state
    setTimeFilter(restoreFilter);

    // Compute human-readable month/year labels for each page
    const now = new Date();
    const currentMonthName = now.toLocaleString("default", { month: "long" });
    const currentYear = now.getFullYear();

    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthName = prevDate.toLocaleString("default", { month: "long" });
    const prevYear = prevDate.getFullYear();

    const currentLabel = currentMonthName + " " + currentYear;
    const prevLabel = prevMonthName + " " + prevYear;

    // 4. Initialize jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Reusable Header & Footer Drawer
    const drawHeaderAndFooter = (doc, titleText) => {
      // --- Header ---
      // Background (Primary Green)
      doc.setFillColor(29, 201, 86); // #1dc956
      doc.rect(0, 0, pdfWidth, 40, "F");

      // AgroMart Leaf Logo Primitives
      doc.setFillColor(255, 255, 255);
      // Leaf 1
      doc.ellipse(20, 20, 6, 9, "F");
      // Leaf 2
      doc.ellipse(27, 24, 4, 7, "F");

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("AgroMart", 35, 25);

      // Report Subtitle
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(titleText, 35, 33);

      // Date alignment right
      const dateStr = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text("Generated: " + dateStr, pdfWidth - 15, 25, { align: "right" });

      doc.setFontSize(9);
      doc.text("Connecting Growth, Cultivating Trust", pdfWidth - 15, 33, {
        align: "right",
      });

      // --- Footer ---
      doc.setFillColor(248, 250, 252); // Very light grey bg
      doc.rect(0, pdfHeight - 15, pdfWidth, 15, "F");

      // Top border line for footer
      doc.setDrawColor(226, 232, 240); // #e2e8f0
      doc.setLineWidth(0.5);
      doc.line(0, pdfHeight - 15, pdfWidth, pdfHeight - 15);

      doc.setTextColor(100, 116, 139); // Text color #64748b
      doc.setFontSize(9);
      doc.text("Agromart 2.O Analytics Report", pdfWidth / 2, pdfHeight - 6, {
        align: "center",
      });
    };

    // --- Page 1: Current Month Content ---
    drawHeaderAndFooter(pdf, "Analytics Report  |  " + currentLabel);

    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;
    // Calculate aspect ratio height
    const contentHeight1 =
      (canvasCurrent.height * contentWidth) / canvasCurrent.width;

    // Draw the HTML2Canvas snapshot below the header
    pdf.addImage(
      canvasCurrent.toDataURL("image/png"),
      "PNG",
      margin,
      45,
      contentWidth,
      contentHeight1,
    );

    // --- Page 2: Previous Month Content ---
    pdf.addPage();
    drawHeaderAndFooter(pdf, "Analytics Report  |  " + prevLabel);

    const contentHeight2 =
      (canvasLast.height * contentWidth) / canvasLast.width;
    pdf.addImage(
      canvasLast.toDataURL("image/png"),
      "PNG",
      margin,
      45,
      contentWidth,
      contentHeight2,
    );

    // Save PDF — filename includes both month periods covered
    const prevShort = prevDate.toLocaleString("default", { month: "short" }) + prevYear;
    const currShort = now.toLocaleString("default", { month: "short" }) + currentYear;
    pdf.save("Agromart_Analytics_" + prevShort + "_" + currShort + ".pdf");
  } catch (err) {
    console.error("Critical error building dual-month PDF:", err);
    throw err;
  }
};
