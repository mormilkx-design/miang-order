/**
 * Google Apps Script สำหรับ miang-order (โปรเจกต์ "Miang Order API")
 *
 * ชีตออเดอร์ = ชีตแรกของไฟล์ (มีหัวตารางแถวที่ 1) คอลัมน์:
 *   A รหัสบิล | B วันที่ | C ชื่อลูกค้า | D รายการ | E ยอดรวม | F ผู้ยืนยันชำระเงิน | G เวลาชำระเงิน
 * ชีต "Deleted_Logs" คอลัมน์:
 *   A เวลาที่ลบ | B รหัสบิล | C ชื่อลูกค้า | D ยอดรวม
 *
 * วิธีอัปเดต: วางทับโค้ดเดิมทั้งหมด > บันทึก
 *   > การทำให้ใช้งานได้ (Deploy) > จัดการการทำให้ใช้งานได้ (Manage deployments)
 *   > ✏️ แก้ไข > เวอร์ชัน: เวอร์ชันใหม่ (New version) > ทำให้ใช้งานได้ (Deploy)
 *   (ห้ามกด "การทำให้ใช้งานได้รายการใหม่" เพราะจะได้ URL ใหม่)
 *
 * ฟังก์ชันช่วย (เลือกชื่อฟังก์ชันจาก dropdown ข้างปุ่ม "เรียกใช้" แล้วกดเรียกใช้):
 *   showSheetUrl    - แสดงลิงก์ Google Sheet ที่ผูกกับสคริปต์นี้ ใน "บันทึกการดำเนินการ"
 *   cleanBlankRows  - ลบแถวที่มีแค่รหัสบิล แต่ไม่มีชื่อลูกค้าและยอดรวม
 */
const LOGS_SHEET = 'Deleted_Logs';

function getOrdersSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function getLogsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(LOGS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LOGS_SHEET);
    sheet.appendRow(['เวลาที่ลบ', 'รหัสบิล', 'ชื่อลูกค้า', 'ยอดรวม']);
  }
  return sheet;
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
    const sheet = getLogsSheet_();
    const start = dataStartRow_(sheet);
    const last = sheet.getLastRow();
    if (last < start) return json_([]);
    const rows = sheet.getRange(start, 1, last - start + 1, 4).getValues();
    return json_(rows.reverse().map(r => ({ deletedAt: r[0], id: r[1], customerName: r[2], total: r[3] })));
  }

  const sheet = getOrdersSheet_();
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
    const sheet = getOrdersSheet_();

    if (data.action === 'add') {
      sheet.appendRow([data.orderId, data.date, data.customer, data.items, data.total, '', '']);
      return json_({ ok: true });
    }

    if (data.action === 'pay' || data.action === 'unpay') {
      const row = findOrderRow_(sheet, data.orderId);
      if (row < 0) return json_({ ok: false, error: 'not found' });
      const values = data.action === 'pay' ? [[data.paidBy, data.paidAt]] : [['', '']];
      sheet.getRange(row, 6, 1, 2).setValues(values);
      return json_({ ok: true });
    }

    if (data.action === 'delete') {
      const row = findOrderRow_(sheet, data.orderId);
      if (row < 0) return json_({ ok: false, error: 'not found' });
      const r = sheet.getRange(row, 1, 1, 5).getValues()[0];
      getLogsSheet_().appendRow([new Date().toLocaleString('th-TH'), r[0], r[2], r[4]]);
      sheet.deleteRow(row);
      return json_({ ok: true });
    }

    // action ที่ไม่รู้จัก: ไม่บันทึกอะไรลงชีต
    return json_({ ok: false, error: 'unknown action' });
  } finally {
    lock.releaseLock();
  }
}

function showSheetUrl() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('ชื่อไฟล์: ' + ss.getName());
  Logger.log('ลิงก์: ' + ss.getUrl());
}

function cleanBlankRows() {
  const sheet = getOrdersSheet_();
  const start = dataStartRow_(sheet);
  const last = sheet.getLastRow();
  if (last < start) return;
  const rows = sheet.getRange(start, 1, last - start + 1, 5).getValues();
  let removed = 0;
  // ลบจากล่างขึ้นบน เลขแถวจะได้ไม่เลื่อน
  for (let i = rows.length - 1; i >= 0; i--) {
    const [id, date, customer, items, total] = rows[i];
    if (id && !date && !customer && !items && total === '') {
      Logger.log('ลบแถว ' + (start + i) + ': ' + id);
      sheet.deleteRow(start + i);
      removed++;
    }
  }
  Logger.log('ลบแถวว่างทั้งหมด ' + removed + ' แถว');
}
