// نموذج 22م - خدمة مزامنة الفريق (Google Apps Script)
// إعداد المهندس/ علي الأحمري — جميع حقوق الملكية الفكرية محفوظة، ولا يجوز التعديل أو إعادة النشر دون إذن كتابي.
// الاستخدام: افتح script.new، الصق هذا الكود، نفّذ الدالة setup مرة واحدة ووافق على الصلاحيات (تنشئ جدول Google Sheet في حسابك)،
// ثم «نشر» ← «عملية نشر جديدة» ← تطبيق ويب، التنفيذ باسمي، الوصول: أي شخص. انسخ الرابط المنتهي بـ /exec.
// الإصدار 3: يضيف دور «مراقب الهيئة» (مفتاح قراءة فقط view) مع الإبقاء على كل ما سبق (الرمز السري، مفتاح الرئيس، الأرشفة).
var TEAM_CODE = '__CODE__';   // رمز الفريق السري (يجب أن يطابق الرمز في الصفحة؛ اتركه فارغاً إن لم تستخدم رمزاً)
var SHEET_NAME = 'data';

function ss_() {
  var id = PropertiesService.getScriptProperties().getProperty('sid');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  var a = null;
  try { a = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (a) return a;
  var n = SpreadsheetApp.create('نموذج 22م - بيانات الفريق');
  PropertiesService.getScriptProperties().setProperty('sid', n.getId());
  return n;
}
/* تشغيل مرة واحدة: ينشئ جدول البيانات في حساب صاحب المشروع */
function setup() {
  var ss = ss_(); sheet_();
  Logger.log('تم إنشاء الجدول: ' + ss.getUrl());
}
function sheet_() {
  var ss = ss_();
  var s = ss.getSheetByName(SHEET_NAME);
  if (!s) {
    s = ss.insertSheet(SHEET_NAME);
    s.getRange('A:B').setNumberFormat('@');
    s.appendRow(['key', 'value', 't', 'by']);
  }
  return s;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function props_() { return PropertiesService.getScriptProperties(); }
function code_() { return props_().getProperty('code') || TEAM_CODE; }
function lead_() { return props_().getProperty('lead') || ''; }
function view_() { return props_().getProperty('vkey') || ''; }      // مفتاح القراءة فقط لمراقب الهيئة
function lastT_() { return Number(props_().getProperty('lastT') || 0); }

function doGet(e) {
  var p = (e && e.parameter) || {};
  var cc = code_(), lk = lead_(), vk = view_();
  // استرجاع الرمز الحالي برابط الرئيس بعد تغييره
  if (p.action === 'recover') {
    if (lk && p.lead === lk) return out_({ ok: true, code: cc });
    return out_({ error: 'lead' });
  }
  var okCode = !cc || p.code === cc;
  var okView = !!vk && p.view === vk;          // مراقب الهيئة: قراءة فقط
  if (!okCode && !okView) return out_({ error: 'code' });
  if (p.action === 'ping') return out_({ ok: true, t: lastT_(), view: okView && !okCode ? 1 : 0 });
  var since = Number(p.since || 0), last = lastT_();
  if (last <= since) return out_({ t: last, rows: [] });
  var v = sheet_().getDataRange().getValues(), rows = [];
  for (var i = 1; i < v.length; i++) {
    if (Number(v[i][2]) > since) rows.push([v[i][0], v[i][1], Number(v[i][2]), v[i][3]]);
  }
  return out_({ t: last, rows: rows });
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ error: 'bad' }); }
  var cc = code_(), vk = view_();
  var byCode = !cc || body.code === cc;
  var byView = !!vk && body.view === vk && !byCode;   // دخول بمفتاح المراقب فقط
  if (!byCode && !byView) return out_({ error: 'code' });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // ---- أوامر الرئيس (تحتاج رمز الفريق) ----
    if (byCode && body.setLead) {              // مفتاح الرئيس (لاسترجاع الرمز بعد تغييره)
      props_().setProperty('lead', String(body.setLead));
      return out_({ ok: true, t: lastT_() });
    }
    if (byCode && body.setView) {              // إنشاء مفتاح القراءة فقط لمراقب الهيئة
      props_().setProperty('vkey', String(body.setView));
      return out_({ ok: true, t: lastT_(), view: String(body.setView) });
    }
    var s = sheet_(), n = s.getLastRow(), idx = {};
    if (byCode && body.archive) {              // أرشفة الزيارة الحالية في ورقة جديدة ثم تفريغ القيم
      var ss = ss_();
      var base = String(body.archive).replace(/[\[\]\*\?:\/\\]/g, ' ').slice(0, 90), nm = base, c = 1;
      while (ss.getSheetByName(nm)) { c++; nm = base + ' (' + c + ')'; }
      s.copyTo(ss).setName(nm);
      var tt = Math.max(Date.now(), lastT_() + 1);
      if (n > 1) {
        var blank = [];
        for (var r = 0; r < n - 1; r++) blank.push(['', tt, '']);
        s.getRange(2, 2, n - 1, 3).setValues(blank);
      }
      props_().setProperty('lastT', String(tt));
      if (body.newCode) {                       // رابط جديد: يتغير رمز الفريق ويسقط مفتاح المراقب القديم معه
        props_().setProperty('code', String(body.newCode));
        props_().deleteProperty('vkey');
      }
      return out_({ ok: true, t: tt, code: body.newCode ? String(body.newCode) : undefined });
    }
    // ---- كتابة القيم ----
    if (n > 1) {
      var keys = s.getRange(2, 1, n - 1, 1).getValues();
      for (var i = 0; i < keys.length; i++) idx[keys[i][0]] = i + 2;
    }
    var t = lastT_(), ops = body.ops || [];
    if (byView) {                               // المراقب لا يكتب إلا ملاحظاته (v2:vn|…) ولا شيء غيرها
      ops = ops.filter(function (op) { return String(op.k || '').indexOf('v2:vn|') === 0; });
      if (!ops.length) return out_({ error: 'readonly' });
    }
    ops.forEach(function (op) {
      t = Math.max(Date.now(), t + 1);
      var val = String(op.v == null ? '' : op.v).slice(0, 45000);
      var row = idx[op.k];
      if (!row) { n++; row = n; idx[op.k] = n; }
      s.getRange(row, 1, 1, 4).setValues([[String(op.k), val, t, String(op.b || '')]]);
    });
    props_().setProperty('lastT', String(t));
    return out_({ ok: true, t: t });
  } finally {
    lock.releaseLock();
  }
}
