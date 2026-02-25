import { sendMail } from "./mailer.js";

/**
 * Utility to get the logo URL matching AgroMart branding
 */
const getLogoUrl = () => {
  return "https://cdn-icons-png.flaticon.com/512/188/188333.png";
};

/**
 * Send OTP Verification Email
 */
export const sendOTPEmail = async (email, otp) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
        .header { background-color: #2e8b57; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px; color: #333; line-height: 1.6; }
        .otp-code { background-color: #f4fbf7; border: 2px dashed #2e8b57; border-radius: 8px; color: #2e8b57; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 30px 0; padding: 20px; text-align: center; }
        .footer { background-color: #f9f9f9; color: #777; font-size: 12px; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌿 AgroMart</div>
          <div style="font-size: 16px; opacity: 0.9;">Cultivating Trust, Connecting Growth</div>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; color: #2c3e50;">Verify Your Email Address</h2>
          <p>Hello,</p>
          <p>Thank you for joining Agromart! To complete your registration and secure your account, please use the following verification code:</p>
          <div class="otp-code">${otp}</div>
          <p>This code is valid for <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The AgroMart Team</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} AgroMart. All rights reserved.<br>
          Empowering farmers, suppliers, and buyers worldwide.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await sendMail({
      to: email,
      subject: "Agromart - Your Verification Code",
      text: `Your verification code is: ${otp}`,
      html: htmlTemplate,
    });
    console.log(">>> OTP Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error(">>> OTP Email send failed:", error);
    return false;
  }
};

/**
 * Send Order Notification Email to Seller
 * @param {Object} order - The order object
 * @param {Object} seller - The seller user object
 * @param {Object} buyer - The buyer user object
 */
export const sendOrderEmail = async (order, seller, buyer) => {
  try {
    const logoUrl = getLogoUrl();
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const itemsHtml = order.products
      .map(
        (p) => `
      <tr>
        <td class="main-product-cell" style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #000000; vertical-align: middle;">
          <!-- Desktop Layout -->
          <div class="desktop-content">
            <table cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td width="50" style="vertical-align: middle; padding-right: 15px;">
                  <img src="${p.image || "https://via.placeholder.com/50"}" alt="${p.productName}" width="44" height="44" style="display: block; border-radius: 6px; object-fit: cover; border: 1px solid #f1f5f9;" />
                </td>
                <td style="vertical-align: middle;">
                  <span style="font-weight: 600; color: #000000; display: block; margin-bottom: 2px;">${p.productName}</span>
                  <span style="font-size: 12px; color: #64748b; font-weight: 500;">Rs. ${p.price} / ${p.unit}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Mobile Layout -->
          <div class="mobile-content" style="display: none;">
            <!-- Wrapper with padding -->
            <div style="padding: 20px;">
              <!-- Centered Image -->
              <div style="text-align: center; padding-bottom: 0; width: 100%;">
                <img src="${p.image || "https://via.placeholder.com/50"}" alt="${p.productName}" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #f0fdf4; display: inline-block; margin: 0 auto 15px;" />
              </div>
              
              <!-- Item Row -->
              <div style="padding: 12px 0; display: table; width: 100%; box-sizing: border-box; border-bottom: 1px solid #e5e7eb;">
                <div style="display: table-cell; color: #64748b; font-size: 14px; font-weight: 600; text-align: left; vertical-align: middle;">Item</div>
                <div style="display: table-cell; color: #000000; font-size: 14px; font-weight: 600; text-align: right; vertical-align: middle;">${p.productName}</div>
              </div>
              
              <!-- Rate Row -->
              <div style="padding: 12px 0; display: table; width: 100%; box-sizing: border-box; border-bottom: 1px solid #e5e7eb;">
                <div style="display: table-cell; color: #64748b; font-size: 14px; font-weight: 600; text-align: left; vertical-align: middle;">Rate</div>
                <div style="display: table-cell; color: #000000; font-size: 14px; font-weight: 500; text-align: right; vertical-align: middle;">Rs. ${p.price} / ${p.unit}</div>
              </div>
              
              <!-- Quantity Row -->
              <div style="padding: 12px 0; display: table; width: 100%; box-sizing: border-box; border-bottom: 1px solid #e5e7eb;">
                <div style="display: table-cell; color: #64748b; font-size: 14px; font-weight: 600; text-align: left; vertical-align: middle;">Quantity</div>
                <div style="display: table-cell; color: #000000; font-size: 14px; font-weight: 500; text-align: right; vertical-align: middle;">${p.quantity}</div>
              </div>
              
              <!-- Total Row (no border-bottom) -->
              <div style="padding: 12px 0; display: table; width: 100%; box-sizing: border-box;">
                <div style="display: table-cell; color: #64748b; font-size: 14px; font-weight: 600; text-align: left; vertical-align: middle;">Total</div>
                <div style="display: table-cell; color: #1dc956; font-size: 14px; font-weight: 700; text-align: right; vertical-align: middle;">Rs. ${(p.quantity * p.price).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </td>
        <td data-label="Quantity" class="desktop-only mobile-quantity" style="text-align: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #000000; vertical-align: middle;">
          <span style="font-weight: 500;">${p.quantity}</span>
        </td>
        <td data-label="Total" class="desktop-only mobile-total" style="text-align: right; font-weight: 600; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #000000; vertical-align: middle;">
          <span style="font-weight: 700; color: #1dc956;">Rs. ${(p.quantity * p.price).toLocaleString()}</span>
        </td>
      </tr>
    `,
      )
      .join("");

    const grandTotal = order.totalAmount;
    const subTotal = order.totalAmount - order.deliveryCharge;

    // Determine Dashboard URL based on role
    let dashboardUrl = "http://localhost:5173";
    if (seller.role === "farmer") dashboardUrl += "/farmer-dashboard";
    else if (seller.role === "collector")
      dashboardUrl += "/collector-dashboard";
    else if (seller.role === "supplier") dashboardUrl += "/supplier-dashboard";
    else if (seller.role === "admin") dashboardUrl += "/admin-dashboard";
    else dashboardUrl += "/";

    const mailOptions = {
      to: seller.email,
      subject: `New Order Received #${order.orderID}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order</title>
          <style>
      body {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        color: #1a1a1a;
      }
      .wrapper {
        width: 100%;
        background-color: #f4f6f8;
        padding: 40px 0;
      }
      .container {
        max-width: 640px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      }

      /* Enhanced Header */
      .header {
        background: #f0fdf4;
        padding: 40px 40px 30px;
        text-align: center;
        border-bottom: 3px solid #1dc956;
      }
      .logo {
        height: 45px;
        width: auto;
        margin-bottom: 20px;
      }
      .order-title {
        font-size: 26px;
        font-weight: 700;
        color: #166534;
        margin: 0 0 10px;
        letter-spacing: -0.5px;
      }
      .order-subtitle {
        font-size: 16px;
        color: #15803d;
        margin: 0;
        opacity: 0.8;
      }

      /* Order Meta Bar */
      .meta-bar {
        background: #f0fdf4;
        padding: 25px 40px 25px;
        border-bottom: 1px solid #dcfce7;
        text-align: center;
      }
      .meta-pill {
        background: #ffffff;
        border: 1px solid #bbf7d0;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 600;
        display: inline-block;
        margin: 0 5px 10px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      }
      .meta-label {
        color: #000000;
        font-weight: 600;
      }
      .meta-value {
        color: #000000;
      }

      /* Content Area */
      .content {
        padding: 40px;
      }

      /* Section Headers */
      .section-header {
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: #000000;
        margin-bottom: 20px;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 10px;
      }

      /* Buyer Info List */
      .info-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 40px;
      }
      .info-table td {
        padding: 12px 0;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }
      .info-table tr:last-child td {
        border-bottom: none;
      }
      .info-label {
        color: #000000;
        font-size: 14px;
        font-weight: 600;
        text-transform: capitalize;
        width: 140px;
      }
      .info-content {
        color: #000000;
        font-size: 14px;
        font-weight: 500;
        text-align: right;
      }
      .company-name {
        color: #000000;
        font-weight: 600;
        display: block;
        font-size: 13px;
        margin-top: 2px;
      }

      /* Product Table */
      .table-wrap {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 30px;
      }
      .product-table {
        width: 100%;
        border-collapse: collapse;
      }
      .product-table th {
        background: #f8fafc;
        padding: 12px 20px;
        text-align: left;
        font-size: 11px;
        font-weight: 800;
        color: #000000;
        text-transform: uppercase;
        border-bottom: 1px solid #e2e8f0;
      }
      .product-table td {
        padding: 16px 20px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
        color: #000000;
        vertical-align: middle;
      }
      .product-table tr:last-child td {
        border-bottom: none;
      }

      /* Financial Summary */
      .summary-section {
        margin-left: auto;
        width: 280px;
      }
      .summary-table {
        width: 100%;
        border-collapse: collapse;
      }
      .summary-table td {
        padding: 8px 0;
        color: #475569;
        font-size: 14px;
        font-weight: 600;
      }
      .summary-table tr.total td {
        border-top: 2px solid #e2e8f0;
        padding-top: 15px;
        font-size: 18px;
        font-weight: 800;
      }
      .summary-table tr.total .total-label {
        color: #334155;
      }
      .summary-table tr.total td:last-child {
        color: #1dc956;
      } /* Green Grand Total */
      .total-label {
        font-size: 14px;
        font-weight: 700;
      }

      /* View Button */
      .action-area {
        text-align: center;
        margin-top: 50px;
        padding-top: 30px;
        border-top: 1px dashed #e2e8f0;
      }
      .btn-main {
        background-color: #1dc956;
        color: #ffffff !important;
        padding: 14px 32px;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 15px;
        box-shadow: 0 4px 6px rgba(29, 201, 86, 0.2);
        transition: all 0.2s;
        display: inline-block;
      }
      .btn-main:hover {
        background-color: #16a34a;
        box-shadow: 0 6px 12px rgba(29, 201, 86, 0.3);
        transform: translateY(-1px);
      }

      /* Brand Footer */
      .footer {
        background: #f0fdf4;
        padding: 40px 20px;
        text-align: center;
        color: #166534;
        border-top: 1px solid #dcfce7;
      }
      .footer-head {
        color: #14532d;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .footer-slogan {
        color: #15803d;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 20px;
      }
      .footer p {
        font-size: 13px;
        line-height: 1.6;
        margin: 0 auto;
        max-width: 450px;
        color: #166534;
        opacity: 0.9;
      }
      .copyright {
        margin-top: 30px;
        font-size: 12px;
        border-top: 1px solid #bbf7d0;
        padding-top: 20px;
        color: #166534;
        opacity: 0.8;
      }

      @media only screen and (max-width: 600px) {
        .wrapper {
          padding: 0 !important;
        }
        .container {
          width: 100% !important;
          max-width: 100% !important;
          border-radius: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }
        .header,
        .content {
          padding: 25px 20px !important;
        }
        .summary-section {
          width: 100% !important;
        }

        /* Remove Outer Container on Mobile */
        .table-wrap {
          border: none !important;
          border-radius: 0 !important;
          background: transparent !important;
          margin-bottom: 0 !important;
        }
        .product-table {
          border: none !important;
        }

        /* Robust Floating Card View */
        .product-table,
        .product-table tbody {
          display: block !important;
          width: 100% !important;
        }
        .product-table thead {
          display: none !important;
        }

        /* Robust Floating Card View */
        .product-table tr {
          display: flex !important;
          flex-direction: column !important;
          margin: 0 15px 25px !important; /* Floating margins */
          width: auto !important; /* Allow margins to work */
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important; /* Rounder corners */
          background: #ffffff !important;
          padding: 0 !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important; /* Deep Shadow */
          overflow: hidden !important;
        }

        /* Toggle Views */
        .desktop-content { display: none !important; }
        .mobile-content { display: block !important; width: 100% !important; }
        
        /* Hide desktop-only elements */
        .desktop-only { display: none !important; }

        /* Image Block */
        .main-product-cell {
          padding: 0 !important;
          border: none !important;
          display: block !important;
          width: 100% !important;
        }

        /* Hide desktop Quantity & Total cells on mobile */
        .product-table td[data-label="Quantity"], 
        .product-table td[data-label="Total"] {
          display: none !important;
        }
      }
          </style>
        </head>
        <body style="background-color: #f4f6f8; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; color: #1a1a1a;">
          <div class="wrapper" style="width: 100%; background-color: #f4f6f8; padding: 40px 0;">
            <div class="container" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              
              <!-- Header -->
              <div class="header" style="background: #f0fdf4; padding: 40px 40px 30px; text-align: center; border-bottom: 3px solid #1dc956;">
                <img src="${logoUrl}" class="logo" alt="AgroMart" style="height: 45px; width: auto; margin-bottom: 20px; display: inline-block;" />
                <h1 class="order-title" style="font-size: 26px; font-weight: 700; color: #166534; margin: 0 0 10px; letter-spacing: -0.5px;">New Order Received</h1>
                <p class="order-subtitle" style="font-size: 16px; color: #15803d; margin: 0; opacity: 0.8;">You have a new order to fulfill.</p>
              </div>
              
              <!-- Meta Pills -->
              <div class="meta-bar">
                <div class="meta-pill">
                  <span class="meta-label">Order:</span>
                  <span class="meta-value">#${order.orderID}</span>
                </div>
                <div class="meta-pill">
                  <span class="meta-label">Placed:</span>
                  <span class="meta-value">${orderDate}</span>
                </div>
                <div class="meta-pill">
                  <span class="meta-label">Payment:</span>
                  <span class="meta-value" style="color: #1dc956;">${order.paymentMethod}</span>
                </div>
              </div>

              <div class="content">
                
                <!-- Buyer Details -->
                <div class="section-header">Customer Details</div>
                <table class="info-table">
                  <tr>
                    <td class="info-label">Name</td>
                    <td class="info-content">${buyer.name}</td>
                  </tr>
                  <tr>
                    <td class="info-label">Email</td>
                    <td class="info-content">
                      <a href="mailto:${buyer.email}" style="color: #334155; text-decoration: none;">${buyer.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="info-label">Phone</td>
                    <td class="info-content">${buyer.phone || "No phone provided"}</td>
                  </tr>
                  ${
                    buyer.businessName
                      ? `
                  <tr>
                    <td class="info-label">Company</td>
                    <td class="info-content company-name">${buyer.businessName}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td class="info-label">Delivery Address</td>
                    <td class="info-content">${buyer.address}</td>
                  </tr>
                </table>

                <!-- Order Table -->
                <div class="section-header">Order Summary</div>
                <div class="table-wrap">
                  <table class="product-table">
                    <thead>
                      <tr>
                        <th width="50%">Item</th>
                        <th width="20%" style="text-align: center;">Qty</th>
                        <th width="30%" style="text-align: right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>
                
                <div style="margin-top: 24px;">
                  <div class="summary-section">
                    <table class="summary-table">
                      <tr>
                        <td>Subtotal</td>
                        <td align="right">Rs. ${subTotal.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Delivery Charge</td>
                        <td align="right">Rs. ${order.deliveryCharge.toLocaleString()}</td>
                      </tr>
                      <tr class="total">
                        <td class="total-label">Grand Total</td>
                        <td align="right" style="color: #1dc956;">Rs. ${grandTotal.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                </div>

                <!-- Action -->
                <div class="action-area">
                  <a href="${dashboardUrl}" class="btn-main">View Order on Dashboard</a>
                </div>

              </div>

              <!-- Footer -->
              <div class="footer">
                <div class="footer-head">Smarter, Faster, Agricultural Trading</div>
                <div class="footer-slogan">Grow Connection, Prosper Together !!</div>
                <p>Connect farmers, suppliers, and buyers with AI-powered insights and seamless trading.</p>
                <div class="copyright">
                  &copy; ${new Date().getFullYear()} AgroMart. Pokhara, Nepal. All rights reserved.
                </div>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sendMail(mailOptions);
    console.log(">>> Order Email sent successfully");
    return true;
  } catch (error) {
    console.error(">>> Order Email send failed:", error);
    return false;
  }
};