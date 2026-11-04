import type { Json } from '@/lib/database.types'

type InvoiceEmailData = {
  invoiceNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  productName: string
  productSpec: string | null
  items?: Array<{ name: string; brand: string | null; spec: string | null; imei: string | null; quantity: number; unitPrice: number }>
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
  const footer = data.invoiceFooter
    ? `<p style="margin:20px 0 0;font-size:11px;line-height:1.8;color:#A5AAA0;white-space:pre-line;">${e(data.invoiceFooter)}</p>`
    : ''
  const date = e(new Date(data.createdAt).toLocaleDateString('en-NG'))
  const rows = data.items?.length
    ? data.items
    : [{ name: data.productName, brand: null, spec: data.productSpec, imei: null, quantity: data.quantity, unitPrice: data.unitPrice }]
  const subtotal = rows.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const itemRows = rows.map((item) => {
    const description = e([item.brand, item.name].filter(Boolean).join(' ') || 'Item')
    const detail = [item.spec && e(item.spec), item.imei && `IMEI: ${e(item.imei)}`].filter(Boolean).join('<br>')
    return `<tr>
                  <td class="item-padding" style="padding:16px 10px;border-bottom:1px solid #E9EBE6;font-size:13px;color:#191C17;">${description}${detail ? `<br><span style="font-size:11px;color:#62675E;">${detail}</span>` : ''}</td>
                  <td align="center" class="item-padding" style="padding:16px 5px;border-bottom:1px solid #E9EBE6;font-size:13px;color:#62675E;">${item.quantity}</td>
                  <td align="right" class="item-padding" style="padding:16px 5px;border-bottom:1px solid #E9EBE6;font-size:13px;color:#62675E;">${formatNaira(item.unitPrice)}</td>
                  <td align="right" class="item-padding" style="padding:16px 10px;border-bottom:1px solid #E9EBE6;font-size:13px;font-weight:bold;color:#191C17;">${formatNaira(item.unitPrice * item.quantity)}</td>
                </tr>`
  }).join('')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Invoice ${e(data.invoiceNumber)} · ${e(data.businessName)}</title>
    <style>
      body { margin:0; padding:0; width:100% !important; background-color:#F4F5F2; font-family:Arial,Helvetica,sans-serif; -webkit-text-size-adjust:100%; }
      table { border-collapse:collapse; border-spacing:0; }
      img { border:0; display:block; max-width:100%; }
      a { text-decoration:none; }
      @media screen and (max-width:600px) {
        .email-wrapper { width:100% !important; }
        .email-content { padding-left:20px !important; padding-right:20px !important; }
        .invoice-title { font-size:28px !important; }
        .item-padding { padding:12px 8px !important; }
        .mobile-button { display:block !important; width:auto !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#F4F5F2;color:#191C17;">
    <div style="display:none;font-size:1px;color:#F4F5F2;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
      Your Fonestack invoice is ready. Review the details and payment balance.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F4F5F2" style="background-color:#F4F5F2;">
      <tr><td align="center" style="padding:32px 12px;">
        <table role="presentation" class="email-wrapper" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="width:100%;max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
          <tr>
            <td class="email-content" style="padding:32px 40px 28px;border-bottom:1px solid #E9EBE6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle"><span style="font-size:25px;font-weight:800;letter-spacing:-1px;color:#171914;">FONESTACK<span style="color:#B7E34B;">.</span></span></td>
                  <td align="right" valign="middle"><span style="font-size:11px;font-weight:bold;letter-spacing:1.5px;color:#73786D;">INVOICE</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding:36px 40px 24px;">
              <p style="margin:0 0 10px;font-size:13px;color:#74796F;">Hello ${e(data.customerName)},</p>
              <h1 class="invoice-title" style="margin:0;font-size:34px;line-height:1.2;letter-spacing:-1px;color:#171914;font-weight:800;">Your invoice<br>is ready.</h1>
              <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#62675E;">Thank you for choosing ${e(data.businessName)}. Here's a summary of your purchase and payment details.</p>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding:8px 40px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F6F7F3" style="background-color:#F6F7F3;border-radius:8px;">
                <tr><td style="padding:20px 22px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" valign="top">
                        <p style="margin:0 0 7px;font-size:10px;font-weight:bold;letter-spacing:1px;color:#81867C;">INVOICE NUMBER</p>
                        <p style="margin:0;font-size:14px;font-weight:bold;color:#191C17;">${e(data.invoiceNumber)}</p>
                      </td>
                      <td width="50%" valign="top" align="right">
                        <span style="display:inline-block;padding:6px 12px;border-radius:20px;background-color:#E8F3D1;color:#456817;font-size:11px;font-weight:bold;">${e(data.status)}</span>
                      </td>
                    </tr>
                    <tr><td colspan="2" style="padding-top:20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="50%" valign="top">
                            <p style="margin:0 0 6px;font-size:11px;color:#81867C;">ISSUE DATE</p>
                            <p style="margin:0;font-size:13px;color:#191C17;">${date}</p>
                          </td>
                          <td width="50%" valign="top" align="right">
                            <p style="margin:0 0 6px;font-size:11px;color:#81867C;">BALANCE DUE</p>
                            <p style="margin:0;font-size:13px;font-weight:bold;color:#191C17;">${formatNaira(data.amountDue)}</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding:0 40px 30px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:bold;letter-spacing:1.2px;color:#81867C;">BILLED TO</p>
              <p style="margin:0 0 5px;font-size:15px;font-weight:bold;color:#191C17;">${e(data.customerName)}</p>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#62675E;">${e(data.customerEmail)}<br>${e(data.customerPhone)}</p>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding:0 40px 10px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td colspan="4" style="padding:0 0 12px;font-size:11px;font-weight:bold;letter-spacing:1px;color:#81867C;">ORDER SUMMARY</td></tr>
                <tr bgcolor="#F6F7F3">
                  <th align="left" class="item-padding" style="padding:12px 10px;font-size:11px;color:#656A60;font-weight:bold;">Item</th>
                  <th align="center" class="item-padding" style="padding:12px 5px;font-size:11px;color:#656A60;font-weight:bold;">Qty</th>
                  <th align="right" class="item-padding" style="padding:12px 5px;font-size:11px;color:#656A60;font-weight:bold;">Price</th>
                  <th align="right" class="item-padding" style="padding:12px 10px;font-size:11px;color:#656A60;font-weight:bold;">Total</th>
                </tr>
                ${itemRows}
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding:20px 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td align="right" style="padding:7px 0;font-size:13px;color:#62675E;">Subtotal</td><td align="right" width="120" style="padding:7px 0 7px 16px;font-size:13px;color:#191C17;">${formatNaira(subtotal)}</td></tr>
                <tr><td align="right" style="padding:7px 0;font-size:13px;color:#62675E;">Discount</td><td align="right" width="120" style="padding:7px 0 7px 16px;font-size:13px;color:#191C17;">−${formatNaira(data.discountAmount)}</td></tr>
                <tr><td colspan="2" style="padding:12px 0 0;border-top:1px solid #DDE0D8;"></td></tr>
                <tr><td align="right" valign="middle" style="padding:8px 0;font-size:14px;font-weight:bold;color:#191C17;">TOTAL</td><td align="right" valign="middle" width="120" style="padding:8px 0 8px 16px;font-size:23px;font-weight:bold;letter-spacing:-0.5px;color:#A3C936;">${formatNaira(data.totalAmount)}</td></tr>
                <tr><td align="right" style="padding:7px 0;font-size:13px;color:#62675E;">Paid / deposit</td><td align="right" width="120" style="padding:7px 0 7px 16px;font-size:13px;color:#191C17;">${formatNaira(data.depositAmount)}</td></tr>
                <tr><td align="right" style="padding:7px 0;font-size:13px;font-weight:bold;color:#191C17;">Balance due</td><td align="right" width="120" style="padding:7px 0 7px 16px;font-size:13px;font-weight:bold;color:#191C17;">${formatNaira(data.amountDue)}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding:0 40px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td align="center" bgcolor="#171914" style="border-radius:6px;">
                  <a href="${e(data.invoiceUrl)}" target="_blank" class="mobile-button" style="display:inline-block;padding:16px 28px;font-size:14px;font-weight:bold;color:#FFFFFF;text-align:center;text-decoration:none;border-radius:6px;">View / Print Invoice &nbsp; &#8594;</a>
                </td></tr>
              </table>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.7;text-align:center;color:#81867C;">If you've already made payment, kindly disregard this notification.</p>
            </td>
          </tr>
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
          <tr>
            <td align="center" bgcolor="#171914" style="padding:30px 24px;">
              <p style="margin:0 0 8px;font-size:16px;font-weight:bold;letter-spacing:-0.5px;color:#FFFFFF;">FONESTACK<span style="color:#B7E34B;">.</span></p>
              <p style="margin:0 0 16px;font-size:11px;line-height:1.7;color:#A5AAA0;">Gadgets. Technology. Everyday innovation.</p>
              <p style="margin:0 0 12px;font-size:12px;color:#D6D9D2;">Need help with your invoice?</p>
              <p style="margin:0 0 16px;font-size:12px;color:#B7E34B;"><a href="mailto:support@fonestack.com.ng" style="color:#B7E34B;text-decoration:none;">support@fonestack.com.ng</a></p>
              <p style="margin:0;font-size:11px;line-height:1.8;color:#858A80;">
                <a href="https://fonestack.com.ng" target="_blank" style="color:#D6D9D2;">fonestack.com.ng</a>
                ${data.businessAddress ? `<br>${e(data.businessAddress)}` : '<br>Computer Village, Ikeja, Lagos, Nigeria'}
                ${data.businessPhone ? `<br>${e(data.businessPhone)}` : ''}
              </p>
              ${footer}
              <p style="margin:20px 0 0;font-size:10px;line-height:1.7;color:#70756C;">&copy; ${new Date(data.createdAt).getFullYear()} Fonestack. All rights reserved.<br>This is an automated transactional email.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

export function invoiceEmailProductName(snapshot: Json | null) {
  const product = asRecord(snapshot)
  if (product.multi === true && typeof product.name === 'string') return product.name
  const brand = typeof product.brand === 'string' ? product.brand : ''
  const name = typeof product.name === 'string' ? product.name : ''
  return `${brand} ${name}`.trim() || 'Product details unavailable'
}

export function invoiceEmailProductSpec(snapshot: Json | null) {
  return snapshotText(snapshot, 'spec')
}

export function invoiceEmailItems(snapshot: Json | null) {
  const product = asRecord(snapshot)
  if (product.multi !== true || !Array.isArray(product.items)) return undefined
  return product.items.flatMap((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return []
    const item = value as Record<string, Json | undefined>
    const number = (key: string, fallback: number) => typeof item[key] === 'number' && Number.isFinite(item[key]) ? item[key] as number : fallback
    const text = (key: string) => typeof item[key] === 'string' ? item[key] as string : null
    const name = text('name')
    if (!name) return []
    return [{
      name,
      brand: text('brand'),
      spec: text('spec'),
      imei: text('imei'),
      quantity: Math.max(1, Math.floor(number('quantity', 1))),
      unitPrice: Math.max(0, number('unit_price', 0)),
    }]
  })
}
