/**
 * بوابة شواهد المنشأة — Google Apps Script
 * إعداد المهندس/ علي الأحمري
 *
 * الإعداد مرة واحدة:
 * 1) أنشئ مجلداً في Drive بالحساب الذي تختاره، وانسخ معرّفه من الرابط.
 * 2) في إعدادات المشروع، أضف خاصيتين في Script properties:
 *      ROOT_FOLDER_ID = معرّف المجلد
 *      ADMIN_KEY      = كلمة سر طويلة لفريق المراجعة
 * 3) نفّذ الدالة selfCheck مرة واحدة ووافق على الصلاحيات.
 * 4) انشر المشروع: Deploy ثم Web app. Execute as: Me. Who has access: Anyone.
 *
 * لا تُرجع هذه البوابة أي رابط مجلد للمنشأة، ولا ترى المنشأة إلا صفوفها.
 */

var MAX_CHUNKS = 7;             // 7 × 1.5MB تقريباً = 10MB
var MAX_B64 = 2100000;          // أقصى طول لقطعة base64 واحدة
var BAD_EXT = /\.(exe|js|jse|bat|cmd|com|scr|msi|apk|ps1|vbs|vbe|jar|sh|dll|lnk|html?|svg)$/i;
var LV_NAME = { e: 'الوجود', p: 'الممارسة', f: 'الفاعلية' };

function props_() { return PropertiesService.getScriptProperties(); }
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) { return handle_((e && e.parameter) || {}); }
function doPost(e) {
  var b = {};
  try { b = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: 0, error: 'طلب غير صالح' }); }
  return handle_(b);
}

function handle_(q) {
  try {
    switch (q.action) {
      case 'ping': return out_({ ok: 1 });
      case 'createVisit': return out_(createVisit_(q));
      case 'portal': return out_(portal_(q));
      case 'uploadChunk': return out_(uploadChunk_(q));
      case 'addLink': return out_(addLink_(q));
      case 'remove': return out_(remove_(q));
      case 'team': return out_(team_(q));
      case 'review': return out_(review_(q));
      case 'rotate': return out_(rotate_(q));
      case 'setDeadline': return out_(setDeadline_(q));
      default: return out_({ ok: 0, error: 'إجراء غير معروف' });
    }
  } catch (err) {
    return out_({ ok: 0, error: String(err && err.message ? err.message : err) });
  }
}

/* ---------- أدوات ---------- */
function admin_(q) {
  var k = props_().getProperty('ADMIN_KEY');
  if (!k || !q.key || String(q.key).length !== k.length) throw new Error('كلمة سر الفريق غير صحيحة');
  var d = 0;
  for (var i = 0; i < k.length; i++) d |= k.charCodeAt(i) ^ String(q.key).charCodeAt(i);
  if (d) throw new Error('كلمة سر الفريق غير صحيحة');
}
function clean_(s, n) {
  return String(s == null ? '' : s).replace(/[\\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 80);
}
function sub_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
function token_() {
  var s = '', a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  var u = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  for (var i = 0; i < 22; i++) s += a.charAt(parseInt(u.substr(i * 2, 2), 16) % a.length);
  return s;
}
function loadV_(code) {
  var id = props_().getProperty('VMAN_' + code);
  if (!id) throw new Error('الزيارة غير موجودة');
  return { id: id, m: JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString()) };
}
function saveV_(v) { DriveApp.getFileById(v.id).setContent(JSON.stringify(v.m)); }
function withLock_(fn) {
  var l = LockService.getScriptLock();
  l.waitLock(25000);
  try { return fn(); } finally { l.releaseLock(); }
}
function byToken_(token) {
  var t = String(token || '');
  if (!/^[A-Za-z0-9]{10,40}$/.test(t)) throw new Error('الرابط غير صالح');
  var ref = props_().getProperty('TOK_' + t);
  if (!ref) throw new Error('الرابط غير صالح أو انتهى');
  var p = ref.split('|');
  var v = loadV_(p[0]);
  var f = v.m.facilities[p[1]];
  if (!f || f.token !== t) throw new Error('الرابط غير صالح أو انتهى');
  return { v: v, f: f, fid: p[1] };
}
function closed_(m) { return !!m.deadline && Date.now() > new Date(m.deadline).getTime(); }
function pageLink_(m, token) {
  var base = m.pageUrl || '';
  var j = JSON.stringify({ u: ScriptApp.getService().getUrl(), t: token });
  return base + '#f=' + Utilities.base64Encode(Utilities.newBlob(j).getBytes());
}
function rowView_(r, admin) {
  return {
    id: r.id, sub: r.sub, lv: r.lv, txt: r.txt, status: r.status, note: r.note || '',
    files: r.files.map(function (f) { return admin ? { name: f.name, size: f.size, url: f.url, at: f.at } : { name: f.name, size: f.size }; }),
    links: r.links.slice(),
    folderUrl: admin ? r.folderUrl : undefined
  };
}

/* ---------- الفريق ---------- */
function createVisit_(q) {
  admin_(q);
  var code = String(q.visit || '').replace(/[^A-Za-z0-9\-]/g, '');
  if (code.length < 3) throw new Error('رمز الزيارة غير صالح');
  if (!q.facilities || !q.facilities.length) throw new Error('أضف منشأة واحدة على الأقل');
  return withLock_(function () {
    if (props_().getProperty('VMAN_' + code)) throw new Error('رمز الزيارة مستخدم من قبل');
    var root = DriveApp.getFolderById(props_().getProperty('ROOT_FOLDER_ID'));
    var vf = sub_(root, 'زيارة ' + code);
    var m = { code: code, created: new Date().toISOString(), deadline: q.deadline || '', pageUrl: String(q.pageUrl || ''), facilities: {} };
    var res = [];
    q.facilities.forEach(function (fa, i) {
      var fid = 'f' + (i + 1), fname = clean_(fa.name, 80) || ('منشأة ' + (i + 1));
      var ff = sub_(vf, fname), token = token_();
      var f = { name: fname, token: token, folderId: ff.getId(), folderUrl: ff.getUrl(), rows: {} };
      (fa.rows || []).forEach(function (r) {
        var id = String(r.id || '').replace(/[^A-Za-z0-9_\-]/g, '');
        var lv = LV_NAME[r.lv] ? r.lv : 'e', sb = String(r.sub || '').replace(/[^0-9\-]/g, '');
        if (!id || !sb || f.rows[id]) return;
        var sd = sb.split('-')[0];
        var rf = sub_(sub_(sub_(sub_(ff, 'المعيار ' + sd), sb), LV_NAME[lv]), 'شاهد ' + id);
        f.rows[id] = { id: id, sub: sb, lv: lv, txt: clean_(r.txt, 300), status: 'none', note: '', files: [], links: [], folderId: rf.getId(), folderUrl: rf.getUrl() };
      });
      m.facilities[fid] = f;
      props_().setProperty('TOK_' + token, code + '|' + fid);
      res.push({ fid: fid, name: fname, rows: Object.keys(f.rows).length, folderUrl: f.folderUrl, link: pageLink_(m, token) });
    });
    var mf = vf.createFile('_manifest.json', JSON.stringify(m), 'application/json');
    props_().setProperty('VMAN_' + code, mf.getId());
    return { ok: 1, visit: code, folderUrl: vf.getUrl(), facilities: res };
  });
}

function team_(q) {
  admin_(q);
  var v = loadV_(String(q.visit || ''));
  var m = v.m;
  return {
    ok: 1, visit: m.code, deadline: m.deadline, closed: closed_(m),
    facilities: Object.keys(m.facilities).map(function (fid) {
      var f = m.facilities[fid];
      return {
        fid: fid, name: f.name, folderUrl: f.folderUrl, link: pageLink_(m, f.token),
        rows: Object.keys(f.rows).map(function (id) { return rowView_(f.rows[id], true); })
      };
    })
  };
}

function review_(q) {
  admin_(q);
  return withLock_(function () {
    var v = loadV_(String(q.visit || ''));
    var f = v.m.facilities[q.fid], r = f && f.rows[q.row];
    if (!r) throw new Error('الشاهد غير موجود');
    if (q.status !== 'ok' && q.status !== 'redo') throw new Error('حالة غير صالحة');
    r.status = q.status;
    r.note = q.status === 'redo' ? (clean_(q.note, 300) || 'يحتاج الشاهد إلى استكمال.') : '';
    saveV_(v);
    return { ok: 1 };
  });
}

function rotate_(q) {
  admin_(q);
  return withLock_(function () {
    var v = loadV_(String(q.visit || ''));
    var f = v.m.facilities[q.fid];
    if (!f) throw new Error('المنشأة غير موجودة');
    props_().deleteProperty('TOK_' + f.token);
    f.token = token_();
    props_().setProperty('TOK_' + f.token, v.m.code + '|' + q.fid);
    saveV_(v);
    return { ok: 1, link: pageLink_(v.m, f.token) };
  });
}

function setDeadline_(q) {
  admin_(q);
  return withLock_(function () {
    var v = loadV_(String(q.visit || ''));
    v.m.deadline = String(q.deadline || '');
    saveV_(v);
    return { ok: 1, deadline: v.m.deadline };
  });
}

/* ---------- المنشأة ---------- */
function portal_(q) {
  var h = byToken_(q.token), m = h.v.m;
  return {
    ok: 1, visit: m.code, facility: h.f.name, deadline: m.deadline, closed: closed_(m),
    rows: Object.keys(h.f.rows).map(function (id) { return rowView_(h.f.rows[id], false); })
  };
}

function editableRow_(h, rowId) {
  if (closed_(h.v.m)) throw new Error('أُغلق باب رفع الشواهد');
  var r = h.f.rows[rowId];
  if (!r) throw new Error('الشاهد غير موجود');
  if (r.status === 'ok') throw new Error('هذا الشاهد مقبول ولا يمكن تعديله');
  return r;
}

function uploadChunk_(q) {
  var idx = parseInt(q.idx, 10), total = parseInt(q.total, 10);
  var uid = String(q.uid || ''), data = String(q.data || '');
  if (!/^[A-Za-z0-9]{8,24}$/.test(uid)) throw new Error('رقم الرفع غير صالح');
  if (!(total >= 1 && total <= MAX_CHUNKS) || !(idx >= 0 && idx < total)) throw new Error('عدد القطع غير صالح');
  if (!data || data.length > MAX_B64) throw new Error('القطعة كبيرة');
  var name = clean_(q.name, 120) || 'ملف';
  if (BAD_EXT.test(name)) throw new Error('هذا النوع من الملفات غير مسموح');
  return withLock_(function () {
    var h = byToken_(q.token), r = editableRow_(h, String(q.row || ''));
    var rootF = DriveApp.getFolderById(props_().getProperty('ROOT_FOLDER_ID'));
    var tmp = sub_(rootF, '_tmp');
    var nm = 't_' + uid + '_' + idx;
    tmp.createFile(nm, data, 'text/plain');
    if (idx < total - 1) return { ok: 1, done: 0 };
    var bytes = [];
    var files = [];
    for (var i = 0; i < total; i++) {
      var it = tmp.getFilesByName('t_' + uid + '_' + i);
      if (!it.hasNext()) throw new Error('نقصت قطعة، أعد الرفع');
      var f = it.next();
      files.push(f);
      bytes = bytes.concat(Utilities.base64Decode(f.getBlob().getDataAsString()));
    }
    if (bytes.length > 11 * 1024 * 1024) throw new Error('الملف أكبر من 10 ميغابايت. الصق رابطاً بدلاً منه');
    var mime = String(q.mime || 'application/octet-stream').slice(0, 100);
    var stamp = Utilities.formatDate(new Date(), 'Asia/Riyadh', 'yyyyMMdd-HHmmss');
    var file = DriveApp.getFolderById(r.folderId).createFile(Utilities.newBlob(bytes, mime, stamp + ' ' + name));
    files.forEach(function (x) { x.setTrashed(true); });
    r.files.push({ id: file.getId(), name: name, size: bytes.length, url: file.getUrl(), at: new Date().toISOString() });
    if (r.status === 'none' || r.status === 'redo') r.status = 'up';
    saveV_(h.v);
    return { ok: 1, done: 1 };
  });
}

function addLink_(q) {
  var u = String(q.url || '').trim();
  if (!/^https:\/\/[^\s]{4,480}$/.test(u)) throw new Error('اكتب رابطاً يبدأ بـ https://');
  return withLock_(function () {
    var h = byToken_(q.token), r = editableRow_(h, String(q.row || ''));
    if (r.links.length >= 5) throw new Error('الحد الأعلى 5 روابط للشاهد');
    r.links.push(u);
    if (r.status === 'none' || r.status === 'redo') r.status = 'up';
    saveV_(h.v);
    return { ok: 1 };
  });
}

function remove_(q) {
  return withLock_(function () {
    var h = byToken_(q.token), r = editableRow_(h, String(q.row || ''));
    var i = parseInt(q.i, 10);
    if (q.kind === 'file') {
      if (!(i >= 0 && i < r.files.length)) throw new Error('الملف غير موجود');
      try { DriveApp.getFileById(r.files[i].id).setTrashed(true); } catch (e) {}
      r.files.splice(i, 1);
    } else if (q.kind === 'link') {
      if (!(i >= 0 && i < r.links.length)) throw new Error('الرابط غير موجود');
      r.links.splice(i, 1);
    } else throw new Error('نوع غير صالح');
    if (!r.files.length && !r.links.length) r.status = 'none';
    saveV_(h.v);
    return { ok: 1 };
  });
}

/* تشغيل مرة واحدة للتحقق من الإعداد والصلاحيات */
function selfCheck() {
  var id = props_().getProperty('ROOT_FOLDER_ID');
  if (!id) throw new Error('أضف ROOT_FOLDER_ID في Script properties');
  if (!props_().getProperty('ADMIN_KEY') || props_().getProperty('ADMIN_KEY').length < 12) throw new Error('أضف ADMIN_KEY بطول 12 حرفاً على الأقل');
  var f = DriveApp.getFolderById(id);
  Logger.log('المجلد: ' + f.getName() + ' — الإعداد سليم');
}
