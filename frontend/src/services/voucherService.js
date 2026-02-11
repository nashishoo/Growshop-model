// Voucher/Receipt generator service - Professional Boleta
import { jsPDF } from 'jspdf';
import { supabase } from '../supabaseClient';

// Logo URL
const LOGO_URL = 'https://i.postimg.cc/DSHPn1Br/420gro-720p.png';

// Convert image URL to base64 for PDF embedding
const getBase64FromUrl = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('Could not load logo:', error);
        return null;
    }
};

// Fetch store settings from database
const getStoreSettings = async () => {
    try {
        console.log('Fetching store settings...');
        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .limit(1)
            .maybeSingle(); // Use maybeSingle to avoid error when no rows

        if (error) {
            console.warn('Store settings error:', error);
            return null;
        }
        console.log('Store settings loaded:', data ? 'yes' : 'using defaults');
        return data;
    } catch (error) {
        console.warn('Could not fetch store settings:', error);
        return null;
    }
};

export const generateVoucher = async (order, orderItems = []) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fetch business info from database
    const storeSettings = await getStoreSettings();
    const businessName = storeSettings?.company_name || 'CONECTADOS 420';
    const businessRut = storeSettings?.tax_id || '';
    const businessAddress = [
        storeSettings?.address_street,
        storeSettings?.address_city,
        storeSettings?.address_region
    ].filter(Boolean).join(', ') || '';
    const businessPhone = storeSettings?.phone || '';
    const businessEmail = storeSettings?.email || 'contacto@conectados420.cl';
    const businessWebsite = storeSettings?.website || '';

    // Colors
    const greenColor = [34, 197, 94];
    const darkBg = [15, 15, 15];
    const lightGray = [245, 245, 245];
    const mediumGray = [100, 100, 100];
    const darkText = [30, 30, 30];

    // ============================================
    // HEADER WITH LOGO
    // ============================================
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Try to add logo
    try {
        const logoBase64 = await getBase64FromUrl(LOGO_URL);
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 15, 8, 30, 30);
        }
    } catch (e) {
        console.warn('Logo could not be added');
    }

    // Company name and title (from database)
    doc.setFontSize(16);
    doc.setTextColor(...greenColor);
    doc.text(businessName.toUpperCase(), 55, 18);

    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    if (businessRut) {
        doc.text(`RUT: ${businessRut}`, 55, 26);
    }
    if (businessAddress) {
        doc.text(businessAddress, 55, 33);
    }

    // Document type
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('BOLETA ELECTRÓNICA', pageWidth - 15, 20, { align: 'right' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`N° ${order.id?.slice(0, 8).toUpperCase() || 'N/A'}`, pageWidth - 15, 28, { align: 'right' });

    // ============================================
    // ORDER INFORMATION BOX
    // ============================================
    let yPos = 55;
    doc.setFillColor(...lightGray);
    doc.roundedRect(15, yPos, pageWidth - 30, 28, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...mediumGray);
    yPos += 10;
    doc.text('Fecha de Emisión:', 20, yPos);
    doc.text('Estado del Pago:', 100, yPos);
    doc.text('Método de Pago:', 150, yPos);

    yPos += 8;
    doc.setTextColor(...darkText);
    doc.setFont(undefined, 'bold');
    doc.text(new Date(order.created_at).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }), 20, yPos);

    // Payment status badge
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(100, yPos - 5, 30, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('PAGADO', 115, yPos, { align: 'center' });

    doc.setTextColor(...darkText);
    doc.setFontSize(9);
    doc.text('Mercado Pago', 150, yPos);
    doc.setFont(undefined, 'normal');

    // ============================================
    // CUSTOMER DATA SECTION
    // ============================================
    yPos = 95;
    doc.setFillColor(...greenColor);
    doc.rect(15, yPos, 3, 15, 'F'); // Green accent bar

    doc.setFontSize(11);
    doc.setTextColor(...greenColor);
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL CLIENTE', 22, yPos + 10);
    doc.setFont(undefined, 'normal');

    yPos += 22;
    doc.setFontSize(9);
    doc.setTextColor(...darkText);

    const customerName = order.customer_name || order.shipping_address?.name || 'N/A';
    const customerEmail = order.customer_email || order.shipping_address?.email || 'N/A';
    const customerPhone = order.customer_phone || order.shipping_address?.phone || 'N/A';
    const customerRut = order.customer_rut || 'N/A';

    // Two columns for customer info
    doc.setFont(undefined, 'bold');
    doc.text('Nombre:', 20, yPos);
    doc.text('RUT:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(customerName, 45, yPos);
    doc.text(customerRut, 125, yPos);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Email:', 20, yPos);
    doc.text('Teléfono:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(customerEmail, 45, yPos);
    doc.text(customerPhone, 135, yPos);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Dirección:', 20, yPos);
    doc.setFont(undefined, 'normal');
    const formatAddress = (addr) => {
        if (!addr) return 'N/A';
        if (typeof addr === 'string') return addr;
        const parts = [
            addr.street_address,
            addr.street_number,
            addr.apartment ? `Depto ${addr.apartment}` : null,
            addr.comuna,
            addr.region
        ].filter(Boolean);
        return parts.join(', ');
    };
    doc.text(formatAddress(order.shipping_address), 45, yPos);

    // ============================================
    // PRODUCTS TABLE
    // ============================================
    yPos += 18;
    doc.setFillColor(...greenColor);
    doc.rect(15, yPos, 3, 15, 'F');

    doc.setFontSize(11);
    doc.setTextColor(...greenColor);
    doc.setFont(undefined, 'bold');
    doc.text('DETALLE DE PRODUCTOS', 22, yPos + 10);
    doc.setFont(undefined, 'normal');

    yPos += 20;

    // Table header
    const drawTableHeader = () => {
        doc.setFillColor(230, 230, 230);
        doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...mediumGray);
        doc.setFont(undefined, 'bold');
        doc.text('PRODUCTO', 20, yPos);
        doc.text('CANT.', 115, yPos, { align: 'center' });
        doc.text('P. UNIT.', 140, yPos, { align: 'center' });
        doc.text('SUBTOTAL', 185, yPos, { align: 'right' });
        doc.setFont(undefined, 'normal');
        yPos += 10;
    };

    drawTableHeader();

    // Calculate products subtotal
    let productsSubtotal = 0;

    // Maximum Y position before we need a new page (leave space for totals and footer)
    // Only paginate if we have MANY products - roughly 8+ items to fill first page
    const maxYBeforePageBreak = pageHeight - 80; // ~220 for A4

    if (orderItems && orderItems.length > 0) {
        orderItems.forEach((item, index) => {
            // Check if we need a new page - but only after first few items
            if (index > 0 && yPos > maxYBeforePageBreak) {
                doc.addPage();
                yPos = 30;
                doc.setFontSize(9);
                doc.setTextColor(...mediumGray);
                doc.text('DETALLE DE PRODUCTOS (continuacion)', 20, yPos);
                yPos += 15;
                drawTableHeader();
            }

            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(15, yPos - 4, pageWidth - 30, 8, 'F');
            }

            doc.setTextColor(...darkText);
            doc.setFontSize(8);

            const rawName = item.product_snapshot?.name || item.product_name || 'Producto';
            const productName = rawName.length > 40 ? rawName.slice(0, 40) + '...' : rawName;
            const quantity = item.quantity || 1;
            const unitPrice = item.unit_price || 0;
            const lineTotal = quantity * unitPrice;
            productsSubtotal += lineTotal;

            doc.text(productName, 20, yPos);
            doc.text(String(quantity), 115, yPos, { align: 'center' });
            doc.text(`$${unitPrice.toLocaleString('es-CL')}`, 140, yPos, { align: 'center' });
            doc.setFont(undefined, 'bold');
            doc.text(`$${lineTotal.toLocaleString('es-CL')}`, 185, yPos, { align: 'right' });
            doc.setFont(undefined, 'normal');

            yPos += 8;
        });
    } else {
        doc.setTextColor(...mediumGray);
        doc.text('(Productos del pedido)', 20, yPos);
        productsSubtotal = order.total_amount || 0;
        yPos += 8;
    }

    // Check if we need a new page for totals section
    if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 30;
    }

    // ============================================
    // TOTALS SECTION
    // ============================================
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(100, yPos, pageWidth - 15, yPos);

    yPos += 10;

    // Calculate proper values
    const shippingCost = order.shipping_cost || 0;
    const discountAmount = order.discount_amount || 0;

    // If total_amount already includes shipping, calculate neto from it
    // Otherwise, the grand total = products + shipping - discount
    const grandTotal = (order.total_amount || 0) + shippingCost;

    // IVA is 19% and is already included in Chilean prices (IVA incluido)
    // So we need to extract it: Neto = Total / 1.19, IVA = Total - Neto
    const netoProductos = Math.round(productsSubtotal / 1.19);
    const ivaProductos = productsSubtotal - netoProductos;

    // Get shipping method name
    const shippingMethod = order.shipping_option === 'express' ? 'Express' :
        order.shipping_option === 'pickup' ? 'Retiro en tienda' : 'Estandar';

    doc.setFontSize(9);

    // Subtotal productos
    doc.setTextColor(...mediumGray);
    doc.text('Subtotal Productos:', 110, yPos);
    doc.setTextColor(...darkText);
    doc.text(`$${productsSubtotal.toLocaleString('es-CL')}`, 185, yPos, { align: 'right' });

    // Discount if applicable
    if (discountAmount > 0) {
        yPos += 7;
        doc.setTextColor(220, 38, 38);
        doc.text('Descuento:', 110, yPos);
        doc.text(`-$${discountAmount.toLocaleString('es-CL')}`, 185, yPos, { align: 'right' });
    }

    // IVA (19%) - demonstrative only, already included
    yPos += 7;
    doc.setTextColor(...mediumGray);
    doc.setFontSize(8);
    doc.text('IVA (19%) incluido:', 110, yPos);
    doc.setTextColor(...darkText);
    doc.text(`$${ivaProductos.toLocaleString('es-CL')}`, 185, yPos, { align: 'right' });
    doc.setFontSize(9);

    // Shipping with method name
    yPos += 7;
    doc.setTextColor(...mediumGray);
    doc.text(`Envio (${shippingMethod}):`, 110, yPos);
    doc.setTextColor(...darkText);
    if (shippingCost === 0) {
        doc.setTextColor(...greenColor);
        doc.text('GRATIS', 185, yPos, { align: 'right' });
    } else {
        doc.text(`$${shippingCost.toLocaleString('es-CL')}`, 185, yPos, { align: 'right' });
    }

    // Grand Total
    yPos += 12;
    doc.setFillColor(...greenColor);
    doc.roundedRect(105, yPos - 6, 90, 14, 2, 2, 'F');

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 110, yPos + 2);
    doc.text(`$${grandTotal.toLocaleString('es-CL')}`, 190, yPos + 2, { align: 'right' });
    doc.setFont(undefined, 'normal');

    // ============================================
    // PAYMENT CONFIRMATION
    // ============================================
    yPos += 25;
    doc.setFillColor(240, 253, 244); // Light green
    doc.roundedRect(15, yPos, pageWidth - 30, 22, 3, 3, 'F');
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(15, yPos, pageWidth - 30, 22, 3, 3, 'S');

    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text('* Pago procesado exitosamente via Mercado Pago', 25, yPos + 9);

    if (order.mp_payment_id) {
        doc.setTextColor(...mediumGray);
        doc.text(`ID de Transacción: ${order.mp_payment_id}`, 25, yPos + 16);
    }

    // Tracking if available
    if (order.tracking_number) {
        yPos += 27;
        doc.setFillColor(240, 249, 255);
        doc.roundedRect(15, yPos, pageWidth - 30, 15, 3, 3, 'F');
        doc.setFontSize(9);
        doc.setTextColor(30, 64, 175);
        doc.text(`Numero de Seguimiento: ${order.tracking_number}`, 25, yPos + 10);
    }

    // ============================================
    // FOOTER WITH BUSINESS INFO
    // ============================================
    const footerY = pageHeight - 40;
    doc.setFillColor(...darkBg);
    doc.rect(0, footerY, pageWidth, 40, 'F');

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Este documento es un comprobante valido de su compra en ${businessName}.`, pageWidth / 2, footerY + 8, { align: 'center' });

    // Business contact info
    const contactParts = [];
    if (businessEmail) contactParts.push(`Email: ${businessEmail}`);
    if (businessPhone) contactParts.push(`Tel: ${businessPhone}`);
    doc.text(contactParts.join('  |  '), pageWidth / 2, footerY + 16, { align: 'center' });

    // Address and RUT
    if (businessAddress || businessRut) {
        const infoParts = [];
        if (businessRut) infoParts.push(`RUT: ${businessRut}`);
        if (businessAddress) infoParts.push(businessAddress);
        doc.setFontSize(7);
        doc.text(infoParts.join('  -  '), pageWidth / 2, footerY + 24, { align: 'center' });
    }

    doc.setTextColor(...greenColor);
    doc.setFontSize(9);
    doc.text('Gracias por tu compra!', pageWidth / 2, footerY + 34, { align: 'center' });

    return doc;
};

export const downloadVoucher = async (order, orderItems = []) => {
    try {
        if (!order) {
            throw new Error('Order data is required');
        }
        if (!order.id) {
            throw new Error('Order ID is missing');
        }

        console.log('Generating professional voucher for order:', order.id);

        const doc = await generateVoucher(order, orderItems);

        if (!doc) {
            throw new Error('Failed to generate PDF document');
        }

        const fileName = `Boleta_Conectados420_${order.id.slice(0, 8).toUpperCase()}.pdf`;
        doc.save(fileName);

        console.log('Voucher saved:', fileName);
        return { success: true, fileName };
    } catch (error) {
        console.error('Error generating voucher:', error);
        throw error;
    }
};

export const getVoucherBlob = async (order, orderItems = []) => {
    try {
        if (!order || !order.id) {
            throw new Error('Valid order data is required');
        }

        const doc = await generateVoucher(order, orderItems);
        return doc.output('blob');
    } catch (error) {
        console.error('Error getting voucher blob:', error);
        throw error;
    }
};
