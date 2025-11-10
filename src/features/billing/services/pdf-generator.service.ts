import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates PDF for an invoice
   */
  async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            dni: true,
            address: true,
          },
        },
        doctor: {
          select: {
            fullName: true,
          },
        },
        branch: {
          select: {
            name: true,
            address: true,
            phoneNumber: true,
          },
        },
        InvoiceItem: {
          where: {
            isDeleted: false,
          },
        },
        Payment: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    // Get clinic settings
    const clinicSettings = await this.prisma.clinicSettings.findFirst({
      include: {
        defaultCurrency: true,
      },
    });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Header
    const clinicName = clinicSettings?.name || 'STL Labs';
    const clinicAddress = clinicSettings?.address || '';
    const clinicPhone = clinicSettings?.mainPhone || '';
    const clinicEmail = clinicSettings?.email || '';
    const clinicTaxId = clinicSettings?.taxId || '';

    doc.fontSize(20).font('Helvetica-Bold').text(clinicName, { align: 'center' });
    doc.moveDown(0.5);

    if (clinicAddress) {
      doc.fontSize(10).font('Helvetica').text(clinicAddress, { align: 'center' });
    }
    if (clinicPhone) {
      doc.fontSize(10).text(`Tel: ${clinicPhone}`, { align: 'center' });
    }
    if (clinicEmail) {
      doc.fontSize(10).text(`Email: ${clinicEmail}`, { align: 'center' });
    }
    if (clinicTaxId) {
      doc.fontSize(10).text(`RNC: ${clinicTaxId}`, { align: 'center' });
    }

    doc.moveDown(1);

    // Invoice title
    doc.fontSize(18).font('Helvetica-Bold').text('FACTURA', { align: 'center' });
    doc.moveDown(0.5);

    // Invoice details
    doc.fontSize(12);
    doc.font('Helvetica-Bold').text(`Factura: ${invoice.code || invoice.id.substring(0, 8).toUpperCase()}`);
    doc.font('Helvetica').text(`Fecha: ${this.formatDate(invoice.createdAt)}`);

    if (invoice.expiresAt) {
      doc.text(`Vencimiento: ${this.formatDate(invoice.expiresAt)}`);
    }

    doc.text(`Estado: ${this.translateStatus(invoice.status)}`);
    doc.moveDown(1);

    // Patient information
    doc.font('Helvetica-Bold').text('DATOS DEL CLIENTE', { underline: true });
    doc.moveDown(0.3);
    doc.font('Helvetica');
    doc.text(`Nombre: ${invoice.patient?.fullName || 'N/A'}`);
    if (invoice.patient?.dni) {
      doc.text(`Identificación: ${invoice.patient.dni}`);
    }
    if (invoice.patient?.phoneNumber) {
      doc.text(`Teléfono: ${invoice.patient.phoneNumber}`);
    }
    if (invoice.patient?.email) {
      doc.text(`Email: ${invoice.patient.email}`);
    }
    if (invoice.patient?.address) {
      doc.text(`Dirección: ${invoice.patient.address}`);
    }
    doc.moveDown(1);

    // Items table
    doc.font('Helvetica-Bold').text('DETALLE DE SERVICIOS', { underline: true });
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Descripción', 50, tableTop);
    doc.text('Cant.', 300, tableTop);
    doc.text('Precio', 350, tableTop);
    doc.text('Descuento', 420, tableTop);
    doc.text('Total', 490, tableTop);

    // Table line
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Items
    doc.font('Helvetica').fontSize(9);
    let yPosition = doc.y;
    let subtotal = 0;

    for (const item of invoice.InvoiceItem) {
      const itemTotal = Number(item.price) * item.quantity - Number(item.discount);
      subtotal += itemTotal;

      doc.text(item.name.substring(0, 40), 50, yPosition);
      doc.text(item.quantity.toString(), 300, yPosition);
      doc.text(`$${Number(item.price).toFixed(2)}`, 350, yPosition);
      doc.text(`$${Number(item.discount).toFixed(2)}`, 420, yPosition);
      doc.text(`$${itemTotal.toFixed(2)}`, 490, yPosition);

      yPosition += 20;
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
    }

    doc.y = yPosition + 10;

    // Totals
    doc.moveDown(1);
    const totalsX = 400;
    doc.font('Helvetica').fontSize(10);
    doc.text(`Subtotal:`, totalsX, doc.y);
    doc.text(`$${subtotal.toFixed(2)}`, totalsX + 100, doc.y, { align: 'right' });
    doc.moveDown(0.5);

    const discount = Number(invoice.discount);
    if (discount > 0) {
      doc.text(`Descuento:`, totalsX, doc.y);
      doc.text(`$${discount.toFixed(2)}`, totalsX + 100, doc.y, { align: 'right' });
      doc.moveDown(0.5);
    }

    doc.font('Helvetica-Bold').fontSize(12);
    const total = Number(invoice.totalAmount);
    doc.text(`TOTAL:`, totalsX, doc.y);
    doc.text(`$${total.toFixed(2)}`, totalsX + 100, doc.y, { align: 'right' });
    doc.moveDown(1);

    // Payments section
    if (invoice.Payment.length > 0) {
      doc.font('Helvetica-Bold').fontSize(11).text('PAGOS APLICADOS', { underline: true });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(9);

      for (const payment of invoice.Payment) {
        doc.text(
          `${this.formatDate(payment.paymentDate || payment.createdAt)} - ${this.translatePaymentMethod(payment.paymentMethod)} - $${Number(payment.amount).toFixed(2)}`,
        );
      }
      doc.moveDown(0.5);
      doc.text(`Total Pagado: $${Number(invoice.paidAmount).toFixed(2)}`);
      doc.text(`Saldo Pendiente: $${(total - Number(invoice.paidAmount)).toFixed(2)}`);
      doc.moveDown(1);
    }

    // Footer
    doc.font('Helvetica').fontSize(8).text(
      `Factura generada el ${this.formatDate(new Date())}`,
      50,
      doc.page.height - 50,
      { align: 'center' },
    );

    doc.end();

    // Wait for PDF to be generated
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    });
  }

  /**
   * Generates PDF for a payment receipt
   */
  async generatePaymentReceiptPdf(paymentId: string): Promise<Buffer> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            patient: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                dni: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Get clinic settings
    const clinicSettings = await this.prisma.clinicSettings.findFirst({
      include: {
        defaultCurrency: true,
      },
    });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Header
    const clinicName = clinicSettings?.name || 'STL Labs';
    const clinicAddress = clinicSettings?.address || '';
    const clinicPhone = clinicSettings?.mainPhone || '';
    const clinicEmail = clinicSettings?.email || '';
    const clinicTaxId = clinicSettings?.taxId || '';

    doc.fontSize(20).font('Helvetica-Bold').text(clinicName, { align: 'center' });
    doc.moveDown(0.5);

    if (clinicAddress) {
      doc.fontSize(10).font('Helvetica').text(clinicAddress, { align: 'center' });
    }
    if (clinicPhone) {
      doc.fontSize(10).text(`Tel: ${clinicPhone}`, { align: 'center' });
    }
    if (clinicEmail) {
      doc.fontSize(10).text(`Email: ${clinicEmail}`, { align: 'center' });
    }
    if (clinicTaxId) {
      doc.fontSize(10).text(`RNC: ${clinicTaxId}`, { align: 'center' });
    }

    doc.moveDown(1);

    // Receipt title
    doc.fontSize(18).font('Helvetica-Bold').text('RECIBO DE PAGO', { align: 'center' });
    doc.moveDown(0.5);

    // Receipt details
    doc.fontSize(12);
    doc.font('Helvetica-Bold').text(`Recibo: ${paymentId.substring(0, 8).toUpperCase()}`);
    doc.font('Helvetica').text(`Fecha: ${this.formatDate(payment.paymentDate || payment.createdAt)}`);

    if (payment.invoice?.code) {
      doc.text(`Factura: ${payment.invoice.code}`);
    }
    doc.moveDown(1);

    // Patient information
    if (payment.invoice?.patient) {
      doc.font('Helvetica-Bold').text('DATOS DEL CLIENTE', { underline: true });
      doc.moveDown(0.3);
      doc.font('Helvetica');
      doc.text(`Nombre: ${payment.invoice.patient.fullName}`);
      if (payment.invoice.patient.dni) {
        doc.text(`Identificación: ${payment.invoice.patient.dni}`);
      }
      if (payment.invoice.patient.phoneNumber) {
        doc.text(`Teléfono: ${payment.invoice.patient.phoneNumber}`);
      }
      if (payment.invoice.patient.email) {
        doc.text(`Email: ${payment.invoice.patient.email}`);
      }
      doc.moveDown(1);
    }

    // Payment details
    doc.font('Helvetica-Bold').text('DETALLE DEL PAGO', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11);
    doc.text(`Monto: $${Number(payment.amount).toFixed(2)}`);
    doc.text(`Método de Pago: ${this.translatePaymentMethod(payment.paymentMethod)}`);
    doc.text(`Estado: ${this.translatePaymentStatus(payment.status)}`);

    if (payment.reference) {
      doc.text(`Referencia: ${payment.reference}`);
    }

    if (payment.notes) {
      doc.moveDown(0.5);
      doc.text(`Notas: ${payment.notes}`);
    }

    doc.moveDown(1);

    // Footer
    doc.font('Helvetica').fontSize(8).text(
      `Recibo generado el ${this.formatDate(new Date())}`,
      50,
      doc.page.height - 50,
      { align: 'center' },
    );

    doc.end();

    // Wait for PDF to be generated
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    });
  }

  /**
   * Formats a date to Spanish format
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Translates invoice status to Spanish
   */
  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagada',
      CANCELED: 'Cancelada',
      EXPIRED: 'Vencida',
      DELETED: 'Eliminada',
      OTHER: 'Otro',
      OVERDUE: 'Vencida',
    };
    return translations[status] || status;
  }

  /**
   * Translates payment method to Spanish
   */
  private translatePaymentMethod(method: string): string {
    const translations: Record<string, string> = {
      CASH: 'Efectivo',
      CREDIT_CARD: 'Tarjeta de Crédito',
      DEBIT_CARD: 'Tarjeta de Débito',
      TRANSFER: 'Transferencia',
      OTHER: 'Otro',
    };
    return translations[method] || method;
  }

  /**
   * Translates payment status to Spanish
   */
  private translatePaymentStatus(status: string): string {
    const translations: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Completado',
      CANCELED: 'Cancelado',
      OTHER: 'Otro',
    };
    return translations[status] || status;
  }
}

