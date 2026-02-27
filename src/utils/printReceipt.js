/**
 * printReceipt.js
 * Epson LQ-310 optimised receipt printer utility.
 *
 * Paper spec: 9.5" × 11" standard fanfold (3-ply NCR)
 * Opens a popup window and auto-prints without showing a preview in the
 * main application window.
 */

const formatCurrency = amount =>
  new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

const buildReceiptHTML = invoice => {
  const salesItems = invoice.items?.filter(item => !item.is_return) ?? [];
  const returnItems = invoice.items?.filter(item => item.is_return) ?? [];

  const returnsTotal = returnItems.reduce(
    (sum, item) => sum + Math.abs(item.quantity) * item.unit_price,
    0
  );
  const totalItems = salesItems.length;
  const totalQuantity = salesItems.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
  const outstandingBalance = parseFloat(invoice.outlet?.balance || 0);

  /* ── table rows ── */
  const salesRows = salesItems
    .map(
      item => `
    <tr>
      <td><span class="product-name">${item.sku?.product?.name ?? ''}</span><span class="item-size"> ${item.sku?.size ?? ''}</span></td>
      <td class="tc">${item.quantity}</td>
      <td class="tr">${formatCurrency(item.unit_price)}</td>
      <td class="tc">${item.discount_percent}</td>
      <td class="tr">${formatCurrency(
        item.quantity * item.unit_price -
          (item.quantity * item.unit_price * item.discount_percent) / 100
      )}</td>
    </tr>`
    )
    .join('');

  const returnRows =
    returnItems.length > 0
      ? '<tr class="returns-header"><td colspan="5"><strong>RETURNS:</strong></td></tr>' +
        returnItems
          .map(
            item => `
    <tr class="return-item">
      <td><span class="product-name">${item.sku?.product?.name ?? ''}</span><span class="item-size"> ${item.sku?.size ?? ''}</span></td>
      <td class="tc">${Math.abs(item.quantity)}</td>
      <td class="tr">${formatCurrency(item.unit_price)}</td>
      <td class="tc">-</td>
      <td class="tr ret">-${formatCurrency(Math.abs(item.quantity) * item.unit_price)}</td>
    </tr>`
          )
          .join('')
      : '';

  /* ── optional totals rows ── */
  const itemDiscRow =
    invoice.discount_amount > 0
      ? `<div class="row"><span>Item Discount</span><span>-Rs.${formatCurrency(invoice.discount_amount)}</span></div>`
      : '';

  const invDiscRow =
    invoice.discount_percent > 0
      ? `<div class="row"><span>Invoice Discount (${invoice.discount_percent}%)</span><span>-Rs.${formatCurrency(invoice.invoice_discount_amount || 0)}</span></div>`
      : '';

  const retRow =
    returnItems.length > 0
      ? `<div class="row"><span>Returns</span><span>-Rs.${formatCurrency(returnsTotal)}</span></div>`
      : '';

  const outstandingRow =
    outstandingBalance > 0
      ? `<div class="prow outstanding-balance"><span>Outstanding Balance:</span><span>Rs.${formatCurrency(outstandingBalance)}</span></div>`
      : '';

  const salesRefRow = invoice.sales_ref
    ? `<div class="prow"><span>Sales Reference:</span><span>${invoice.sales_ref.name}</span></div>`
    : '';

  /* ── full HTML document ── */
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Receipt ${invoice.invoice_number}</title>
<style>
  /*
   * Epson LQ-310 — narrow carriage dot matrix, tractor feed
   * Max printable width: 8 inches (203 mm)
   * Paper: 9.5" × 11" continuous fanfold
   *
   * Strategy: constrain the receipt wrapper to 190mm so it safely fits
   * within the LQ-310 printable area regardless of which paper size the
   * OS/browser defaults to. The browser will scale the content to fit.
   * @page margins are kept small because the tractor feed positions
   * the paper; the printer driver controls the left edge.
   */
  @page {
    size: 14.2cm 27.9cm;
    margin: 10mm 0 4mm 0;
  }

  @page :first {
    margin-top: 0;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 11.6cm;
    max-width: 11.6cm;
    overflow: visible;
  }

  body {
    font-family: 'Arial Narrow', Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.3;
    color: #000;
    background: #fff;
    padding: 0 0 0 5mm;
    letter-spacing: 0;
    font-weight: 400;
    display: flex;
    flex-direction: column;
    /* 27.9cm page − 10mm top margin − 4mm bottom margin = 26.5cm printable */
    min-height: 26.5cm;
  }

  /* ── header ── */
  .hdr { display:flex; text-align: center; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
  .co-info{ width: 100%; padding-left: 5px;     text-align: start; }
  .logo { max-width: 100px; max-height: 100px; object-fit: contain; }
  .co-name { font-size: 22pt; font-family: emoji; font-weight: 600; margin: 2px 0; letter-spacing: 0; }
  .co-sub { font-size: 12pt; margin: 1px 0; font-weight: 600;}
  .co-name-and-mobile{     display: flex; justify-content: space-between;}

  /* ── invoice meta ── */
  .meta { display: flex; justify-content: space-between; font-size: 11pt; }
  .meta-invoice{ margin-right: 5px }
  /* ── outlet ── */
  .outlet { margin-bottom: 4px; font-size: 12pt; display: flex; justify-content: space-between; }

  /* ── items table ──
     Column widths are fixed so nothing overflows:
       Description: ~44%   Qty: 10%   Rate: 18%   Disc: 10%   Amt: 18%
  ── */
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 13pt; table-layout: fixed; border: 1px solid #000; }
  col.c-desc { width: 44%; }
  col.c-qty  { width: 9%; }
  col.c-rate { width: 17%; }
  col.c-disc { width: 9%; }
  col.c-amt  { width: 21%; }
  thead { border-top: 2px solid #000; border-bottom: 2px solid #000; }
  .amount-class{font-size: 12pt;}
  th, td { padding: 0px 2px; border-right: 1px solid #aaa; overflow: hidden; line-height: 1; }
  th:last-child, td:last-child { border-right: none; }
  th { font-weight: 600; margin-bottom: 2px; line-height: 1.3;}
  .tc { text-align: center; }
  .tr { text-align: right; }
  .tl { text-align: left; }
  .product-name { font-size: 13pt; font-weight: 500; }
  .item-size { font-size: 13pt; }
  .returns-header td { border-top: 2px solid #000; border-bottom: 1px solid #000; border-right: none; font-weight: 600; padding: 2px; }
  .return-item td { border-right: none; }
  .ret { font-weight: 600; }

  /* ── totals ── */
  .bottom-section { display: flex; flex-direction: column; gap: 4px; }
  .totals { margin-left: auto; width: 60%; border: 1px solid #000; padding: 3px; font-size: 14pt; }
  .row { display: flex; justify-content: space-between; }
  .grand { border-top: 2px solid #000; padding-top: 3px; font-size: 14.5pt; font-weight: 600; }

  /* ── stats ── */
  .stats { display: flex; gap: 12px; border: 1px solid #000; padding: 2px 3px; font-size: 9pt; }
  .stat { display: flex; gap: 4px; }
  .slbl { font-weight: 600; }

  /* ── payment ── */
  .payment { border: 1px solid #000; padding: 3px; font-size: 9pt; }
  .prow { display: flex; gap: 5px; }
  .prow span:first-child { font-weight: 600; min-width: 95px; }
  .outstanding-balance { font-size: 14pt; font-weight: 600; }

  /* ── footer ── */
  .footer { text-align: center; font-size: 8pt; font-style: italic; border-top: 1px dashed #000; padding-top: 4px; margin-bottom: 6px; }
  .footer p { white-space: normal; word-break: break-word; }

  /* ── flex spacer — pushes bottom-section to page bottom on short receipts ── */
  .flex-spacer { flex: 1; min-height: 0; }

  /* ── signatures ── */
  .sigs { display: flex; justify-content: space-between; margin-top: 12px; }
  .sig { width: 45%; }
  .sig-line { border-bottom: 1px solid #000; height: 22px; margin-bottom: 3px; }
  .sig-lbl { text-align: center; font-size: 9pt; }
</style>
</head>
<body>
<div class="hdr">
  <img src="/logo.png" alt="" class="logo" onerror="this.style.display='none'">
  <div class="co-info">
  <div class="co-name">HASAL PRODUCTS</div>
  <div class="co-name-and-mobile">
  <div class="co-sub">Reg No: 1781004</div>
  <div class="co-sub">Tel: 0777659946</div>
  </div>
  <div class="co-sub">Puwakwaththa, Thelikada, Ginimallagaha, Galle</div>
  </div>
</div>

<div class="meta">
  <div>
    <strong class="meta-invoice">INVOICE</strong>
     <strong>: ${invoice.invoice_number}</strong>
  </div>
  <div><strong>${formatDate(invoice.invoice_date)}</strong></div>
</div>

<div class="outlet">
<div class="outlet">
${invoice.outlet?.name ?? ''}
</div>
<div class="outlet">
${invoice.route?.name ?? ''}
</div>
</div>

<table>
  <colgroup>
    <col class="c-desc"><col class="c-qty"><col class="c-rate"><col class="c-disc"><col class="c-amt">
  </colgroup>
  <thead>
    <tr>
      <th class="tl">Description</th>
      <th class="tc">Qty</th>
      <th class="tr">Rate</th>
      <th class="tc">Dis%</th>
      <th class="tr amount-class">Amount (Rs)</th>
    </tr>
  </thead>
  <tbody>
    ${salesRows}
    ${returnRows}
  </tbody>
</table>

<div class="flex-spacer"></div>

<div class="bottom-section">
<div class="totals">
  <div class="row"><span>B/F</span><span>Rs.${formatCurrency(invoice.subtotal)}</span></div>
  ${itemDiscRow}
  ${invDiscRow}
  ${retRow}
  <div class="row grand"><span>TOTAL</span><span>Rs.${formatCurrency(invoice.total_amount)}</span></div>
</div>

<div class="stats">
  <div class="stat"><span class="slbl">No. of Items:</span><span>${totalItems}</span></div>
  <div class="stat"><span class="slbl">No. of Qty:</span><span>${Math.round(totalQuantity)}</span></div>
</div>

<div class="payment">
  <div class="prow"><span>Payment Method:</span><span>${(invoice.payment_method ?? '').toUpperCase()}</span></div>
  ${outstandingRow}
  ${salesRefRow}
</div>

<div class="footer">
  <p>Some items are non-returnable. Exchange possible within 7 days &mdash; bill must be produced.</p>
</div>

<div class="sigs">
  <div class="sig"><div class="sig-line"></div><p class="sig-lbl">Customer Signature</p></div>
  <div class="sig"><div class="sig-line"></div><p class="sig-lbl">Sales Officer Signature</p></div>
</div>
</div>

<script>
  function insertEarlyPageBreak(extraRows) {
    var rows = Array.from(document.querySelectorAll('tbody tr'));
    if (rows.length <= extraRows + 1) return;

    // 11-inch fanfold paper (279 mm) at 96 dpi ~ 1054 px
    var PAGE_H_PX = (279 * 96) / 25.4;

    var bodyTop = document.body.getBoundingClientRect().top;
    var naturalBreakIdx = -1;

    for (var i = 0; i < rows.length; i++) {
      var rowBottom = rows[i].getBoundingClientRect().bottom - bodyTop;
      if (rowBottom > PAGE_H_PX) {
        naturalBreakIdx = i;
        break;
      }
    }

    if (naturalBreakIdx < 0) return;

    var breakIdx = Math.max(0, naturalBreakIdx - extraRows);
    var targetRow = rows[breakIdx];
    targetRow.style.pageBreakBefore = 'always';
    targetRow.style.breakBefore = 'page';
  }

  window.onload = function () {
    insertEarlyPageBreak(2);
    window.print();
    window.addEventListener('afterprint', function () { window.close(); });
  };
</script>
</body>
</html>`;
};

/**
 * printReceipt(invoice)
 *
 * Opens a minimal popup window containing only the receipt, immediately
 * triggers the browser print dialog, and closes the popup once printing
 * is done.  The main application page is never affected and no in-page
 * "preview" is shown.
 *
 * @param {Object} invoice - invoice object from the backend
 */
export function printReceipt(invoice) {
  const html = buildReceiptHTML(invoice);

  const popup = window.open(
    '',
    'receipt_print',
    'width=520,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes'
  );

  if (!popup) {
    // Browsers sometimes block popups; warn the user.
    alert(
      'Pop-up was blocked by your browser.\n' +
        'Please allow pop-ups for this site to enable direct printing.'
    );
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
}
