/**
 * Google Apps Script สำหรับ miang-order (วางใน Extensions > Apps Script ของ Google Sheet)
 *
 * ชีตออเดอร์ (ORDERS_SHEET) คอลัมน์:
 *   A รหัสบิล | B วันที่ | C ชื่อลูกค้า | D รายการ | E ยอดรวม | F ผู้ยืนยันชำระเงิน | G เวลาชำระเงิน
 * ชีตประวัติการลบ (LOGS_SHEET) คอลัมน์:
 *   A เวลาที่ลบ | B รหัสบิล | C ชื่อลูกค้า | D ยอดรวม
 *
 * ถ้าชื่อชีตของคุณไม่ตรง ให้แก้ 2 ค่าด้านล่าง
 * หลังแก้โค้ด: Deploy > Manage deployments > Edit > Version: New version > Deploy
 * (URL เดิมจะยังใช้ได้)
 */
const ORDERS_SHEET = 'Orders';
const LOGS_SHEET = 'DeletedLogs';

function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// แถวแรกเป็นหัวตารางหรือไม่ (ถ้าช่อง A ไม่ได้ขึ้นต้นด้วย ORD- ถือว่าเป็นหัวตาราง)
function dataStartRow_(sheet) {
  const first = sheet.getLastRow() > 0 ? String(sheet.getRange(1, 1).getValue()) : '';
  return first && !first.startsWith('ORD-') ? 2 : 1;
}

function findOrderRow_(sheet, orderId) {
  const start = dataStartRow_(sheet);
  const last = sheet.getLastRow();
  if (last < start) return -1;
  const ids = sheet.getRange(start, 1, last - start + 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(orderId)) return start + i;
  }
  return -1;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (action === 'logs') {
    const sheet = getSheet_(LOGS_SHEET);
    const start = dataStartRow_(sheet);
    const last = sheet.getLastRow();
    if (last < start) return json_([]);
    const rows = sheet.getRange(start, 1, last - start + 1, 4).getValues();
    return json_(rows.reverse().map(r => ({ deletedAt: r[0], id: r[1], customerName: r[2], total: r[3] })));
  }

  const sheet = getSheet_(ORDERS_SHEET);
  const start = dataStartRow_(sheet);
  const last = sheet.getLastRow();
  if (last < start) return json_([]);
  const rows = sheet.getRange(start, 1, last - start + 1, 7).getValues();
  return json_(rows.filter(r => r[0]).map(r => ({
    id: r[0],
    date: r[1],
    customerName: r[2],
    itemsString: r[3],
    total: r[4],
    paidBy: r[5] || '',
    paidAt: r[6] || ''
  })));
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_(ORDERS_SHEET);

    if (data.action === 'add') {
      sheet.appendRow([data.orderId, data.date, data.customer, data.items, data.total, '', '']);
    }

    if (data.action === 'pay' || data.action === 'unpay') {
      const row = findOrderRow_(sheet, data.orderId);
      if (row > 0) {
        const values = data.action === 'pay' ? [[data.paidBy, data.paidAt]] : [['', '']];
        sheet.getRange(row, 6, 1, 2).setValues(values);
      }
    }

    if (data.action === 'delete') {
      const row = findOrderRow_(sheet, data.orderId);
      if (row > 0) {
        const r = sheet.getRange(row, 1, 1, 5).getValues()[0];
        getSheet_(LOGS_SHEET).appendRow([new Date(), r[0], r[2], r[4]]);
        sheet.deleteRow(row);
      }
    }

    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
