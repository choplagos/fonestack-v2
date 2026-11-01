import type { Json } from '@/lib/database.types'

type InvoiceEmailData = {
  invoiceNumber: string
  customerName: string
  productName: string
  productSpec: string | null
  quantity: number
  unitPrice: number
  discountAmount: number
  totalAmount: number
  depositAmount: number
  amountDue: number
  status: string
  createdAt: string
  invoiceUrl: string
  businessName: string
  businessAddress: string | null
  businessPhone: string | null
  logoUrl: string | null
  invoiceFooter: string | null
  termsAndConditions: string | null
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function asRecord(value: Json | null): Record<string, Json | undefined> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function snapshotText(snapshot: Json | null, key: string) {
  const value = asRecord(snapshot)[key]
  return typeof value === 'string' ? value : null
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export function renderInvoiceEmail(data: InvoiceEmailData) {
  const e = escapeHtml
  const productDescription = [data.productName, data.productSpec].filter(Boolean).join(' · ')
  const terms = data.termsAndConditions?.trim() || 'No terms and conditions were provided.'
  const termsHtml = e(terms).replace(/\r\n|\r|\n/g, '<br>')
  const logo = data.logoUrl
    ? `<img src="${e(data.logoUrl)}" alt="${e(data.businessName)}" style="display:block;max-width:160px;max-height:56px;margin:0 0 14px;">`
    : ''
  const footer = data.invoiceFooter
    ? `<p style="margin:22px 0 0;text-align:center;font-size:12px;line-height:1.7;color:#62675E;white-space:pre-line;">${e(data.invoiceFooter)}</p>`
    : ''
  const address = data.businessAddress
    ? `<p style="margin:5px 0 0;font-size:12px;line-height:1.6;color:#62675E;white-space:pre-line;">${e(data.businessAddress)}</p>`
    : ''
  const phone = data.businessPhone
    ? `<p style="margin:5px 0 0;font-size:12px;color:#62675E;">${e(data.businessPhone)}</p>`
    : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Invoice ${e(data.invoiceNumber)} · ${e(data.businessName)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F6F7F3;font-family:Arial,Helvetica,sans-serif;color:#191C17;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F7F3;">
      <tr><td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:8px;">
          <tr><td style="padding:32px 40px 22px;">
            ${logo}
            <p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:2px;color:#191C17;">${e(data.businessName)}</p>
            ${address}${phone}
          </td></tr>
          <tr><td style="padding:0 40px 24px;">
            <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:#191C17;">Your invoice is ready</h1>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#62675E;">Hello ${e(data.customerName)}, thank you for choosing ${e(data.businessName)}. Your invoice details are below.</p>
          </td></tr>
          <tr><td style="padding:0 40px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr><td style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:12px;color:#62675E;">INVOICE</td><td align="right" style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:13px;font-weight:bold;color:#191C17;">${e(data.invoiceNumber)}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:12px;color:#62675E;">DATE</td><td align="right" style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:13px;color:#191C17;">${e(new Date(data.createdAt).toLocaleDateString('en-NG'))}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:12px;color:#62675E;">ITEM</td><td align="right" style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:13px;color:#191C17;">${e(productDescription)}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:12px;color:#62675E;">QUANTITY</td><td align="right" style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:13px;color:#191C17;">${data.quantity}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:12px;color:#62675E;">UNIT PRICE</td><td align="right" style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:13px;color:#191C17;">${formatNaira(data.unitPrice)}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:12px;color:#62675E;">DISCOUNT</td><td align="right" style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:13px;color:#191C17;">${formatNaira(data.discountAmount)}</td></tr>
              <tr><td style="padding:14px 0;border-bottom:1px solid #E6E8E2;font-size:13px;font-weight:bold;color:#191C17;">TOTAL</td><td align="right" style="padding:14px 0;border-bottom:1px solid #E6E8E2;font-size:16px;font-weight:bold;color:#191C17;">${formatNaira(data.totalAmount)}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:12px;color:#62675E;">PAID / DEPOSIT</td><td align="right" style="padding:12px 0;border-bottom:1px solid #E6E8E2;font-size:13px;color:#191C17;">${formatNaira(data.depositAmount)}</td></tr>
              <tr><td style="padding:12px 0;font-size:12px;color:#62675E;">BALANCE DUE</td><td align="right" style="padding:12px 0;font-size:13px;font-weight:bold;color:#191C17;">${formatNaira(data.amountDue)}</td></tr>
            </table>
          </td></tr>
          <tr><td align="center" style="padding:0 40px 24px;">
            <a href="${e(data.invoiceUrl)}" style="display:inline-block;padding:13px 22px;background:#B7E34B;border-radius:5px;color:#191C17;text-decoration:none;font-size:13px;font-weight:bold;">VIEW / PRINT INVOICE</a>
            <p style="margin:10px 0 0;font-size:11px;line-height:1.6;color:#62675E;">Status: ${e(data.status)}</p>
          </td></tr>
          <!-- Terms & Conditions -->
          <tr>
            <td class="email-content" style="padding:0 40px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F6F7F3" style="background-color:#F6F7F3;border-left:3px solid #B7E34B;border-radius:6px;">
                <tr><td style="padding:18px 20px;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:bold;letter-spacing:1.2px;color:#191C17;">TERMS &amp; CONDITIONS</p>
                  <p style="margin:0;font-size:12px;line-height:1.8;color:#62675E;">${termsHtml}</p>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="padding:0 40px 30px;">
            <p style="margin:0;font-size:12px;line-height:1.7;color:#62675E;">If you have questions about this invoice, please contact us${data.businessPhone ? ` at ${e(data.businessPhone)}` : ''}.</p>
            ${footer}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

export function invoiceEmailProductName(snapshot: Json | null) {
  const product = asRecord(snapshot)
  const brand = typeof product.brand === 'string' ? product.brand : ''
  const name = typeof product.name === 'string' ? product.name : ''
  return `${brand} ${name}`.trim() || 'Product details unavailable'
}

export function invoiceEmailProductSpec(snapshot: Json | null) {
  return snapshotText(snapshot, 'spec')
}
