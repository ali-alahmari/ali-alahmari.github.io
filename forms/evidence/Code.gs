/**
 * بوابة شواهد المنشأة — Google Apps Script
 * إعداد المهندس/ علي الأحمري
 *
 * الإعداد مرة واحدة:
 * 1) أنشئ مجلداً في Drive بالحساب الذي تختاره، وانسخ معرّفه من الرابط.
 * 2) في إعدادات المشروع، أضف خاصيتين في Script properties:
 *      ROOT_FOLDER_ID = معرّف المجلد
 *      ADMIN_KEY      = كلمة سر طويلة لفريق المراجعة
 *      LEAD_KEY       = كلمة سر الرئيس (اختيارية؛ إن لم تُضف فالرئيس يستعمل ADMIN_KEY)
 * 3) نفّذ الدالة selfCheck مرة واحدة ووافق على الصلاحيات.
 * 4) انشر المشروع: Deploy ثم Web app. Execute as: Me. Who has access: Anyone.
 *
 * بعد النشر مرة واحدة لا تحتاج إلى أي تعديل في الكود. كل زيارة جديدة تُنشأ من صفحة الفريق
 * بمنشآتها وشواهدها وموعدها، ولها مجلدها وروابطها الخاصة، وتبقى الزيارات السابقة محفوظة.
 *
 * لا تُرجع هذه البوابة أي رابط مجلد للمنشأة، ولا ترى المنشأة إلا صفوفها.
 *
 * التصميم: رابط واحد دائم لكل منشأة. للزيارة طلب مكتبي، وطلبات للميدان موزعة على أيام.
 * في الميدان تكتب المنشأة ما طُلب منها في معايير اليوم، ويعتمده الفريق، ثم ترفع الشواهد.
 * لا تظهر للمنشأة حالة القبول، بل تظهر لها فقط حالة «تم الرفع» أو «مطلوب استكمال».
 * يدخل الفريق برمز خاص بكل زيارة (tc) يتغير في كل زيارة، ويملك الرئيس وحده إنشاء الزيارات.
 */

var MAX_CHUNKS = 14;            // 14 × 1.5MB تقريباً = 20MB
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
      case 'listVisits': return out_(listVisits_(q));
      case 'setMembers': return out_(setMembers_(q));
      case 'setSync': return out_(setSync_(q));
      case 'importSync': return out_(importSync_(q));
      case 'publishForm': return out_(publishForm_(q));
      case 'portal': return out_(portal_(q));
      case 'uploadChunk': return out_(uploadChunk_(q));
      case 'addLink': return out_(addLink_(q));
      case 'remove': return out_(remove_(q));
      case 'team': return out_(team_(q));
      case 'review': return out_(review_(q));
      case 'rotate': return out_(rotate_(q));
      case 'setDeadline': return out_(setDeadline_(q));
      case 'leader': return out_(leader_(q));
      case 'setDays': return out_(setDays_(q));
      case 'openDay': return out_(openDay_(q));
      case 'facReq': return out_(facReq_(q));
      case 'facRmReq': return out_(facRmReq_(q));
      case 'teamAddReq': return out_(teamAddReq_(q));
      case 'approve': return out_(approve_(q));
      case 'closeDay': return out_(closeDay_(q));
      default: return out_({ ok: 0, error: 'إجراء غير معروف' });
    }
  } catch (err) {
    return out_({ ok: 0, error: String(err && err.message ? err.message : err) });
  }
}

/* ---------- أدوات ---------- */
function keyEq_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || a.length !== b.length) return false;
  var d = 0;
  for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
/* كلمة سر الفريق القديمة أو كلمة سر الرئيس */
function admin_(q) {
  if (keyEq_(props_().getProperty('ADMIN_KEY'), q.key) || keyEq_(props_().getProperty('LEAD_KEY'), q.key)) return;
  throw new Error('كلمة سر الفريق غير صحيحة');
}
/* الرئيس وحده: LEAD_KEY إن وُجدت وإلا ADMIN_KEY */
function leaderAuth_(q) {
  var k = props_().getProperty('LEAD_KEY') || props_().getProperty('ADMIN_KEY');
  if (!keyEq_(k, q.key)) throw new Error('كلمة سر الرئيس غير صحيحة');
}
/* الفريق: رمز الزيارة tc، أو كلمة سر الفريق/الرئيس */
function teamAuth_(q, m) {
  if (m && m.tc && keyEq_(m.tc, q.tc)) return;
  admin_(q);
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
function dayOf_(m, k) { return (m.days || []).filter(function (x) { return x.k === k; })[0] || null; }
function dayClosed_(d) { return !d || !d.open || (!!d.dl && Date.now() > new Date(d.dl).getTime()); }
function closedRd_(m, rd) { return (!rd || rd === 'o') ? closed_(m) : dayClosed_(dayOf_(m, rd)); }
function rdName_(m, rd) { if (!rd || rd === 'o') return 'الطلب المكتبي'; var d = dayOf_(m, rd); return d ? d.label : rd; }
function facToken_(name) {
  var map = {};
  try { map = JSON.parse(props_().getProperty('FACTOK') || '{}'); } catch (e) {}
  if (!map[name]) { map[name] = token_(); props_().setProperty('FACTOK', JSON.stringify(map)); }
  return map[name];
}
function newRow_(id, sb, lv, txt, rd, src, ap) {
  return { id: id, sub: sb, lv: lv, txt: clean_(txt, 300), status: 'none', note: '', files: [], links: [], folderId: '', folderUrl: '', rd: rd || 'o', src: src || 'team', ap: ap === 0 ? 0 : 1 };
}
function normDays_(a, prev) {
  var out = [];
  (a || []).slice(0, 7).forEach(function (d, i) {
    var k = 'd' + (i + 1), old = (prev || []).filter(function (x) { return x.k === k; })[0] || {};
    var subs = (d.subs || []).map(function (x) { return String(x).replace(/[^0-9\-]/g, ''); }).filter(function (x) { return /^[0-9]+-[0-9]+$/.test(x); }).slice(0, 80);
    out.push({ k: k, label: clean_(d.label, 40) || ('اليوم ' + (i + 1)), dl: String(d.dl || ''), subs: subs, open: !!old.open, opened: old.opened || '' });
  });
  return out;
}
function pageLink_(m, token) {
  var base = m.pageUrl || '';
  var j = JSON.stringify({ u: ScriptApp.getService().getUrl(), t: token });
  return base + '#f=' + Utilities.base64Encode(Utilities.newBlob(j).getBytes());
}
function rowView_(r, admin) {
  return {
    id: r.id, sub: r.sub, lv: r.lv, txt: r.txt, rd: r.rd || 'o', src: r.src || 'team', ap: r.ap === 0 ? 0 : 1,
    status: admin ? r.status : (r.status === 'ok' ? 'up' : r.status), locked: r.status === 'ok',
    note: (admin || r.status === 'redo') ? (r.note || '') : '',
    files: r.files.map(function (f) { return admin ? { name: f.name, size: f.size, url: f.url, at: f.at } : { name: f.name, size: f.size }; }),
    links: r.links.slice(),
    folderUrl: admin ? r.folderUrl : undefined
  };
}

/* ---------- الفريق ---------- */
var MAIL = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
function idx_() { try { return JSON.parse(props_().getProperty('VISITS') || '[]'); } catch (e) { return []; } }
function putIdx_(a) { props_().setProperty('VISITS', JSON.stringify(a.slice(0, 50))); }
function members_() { return (props_().getProperty('MEMBERS') || '').split(',').filter(String); }
function mail_(a) {
  var seen = {}, out = [];
  (a || []).forEach(function (x) {
    var e = String(x || '').trim().toLowerCase();
    if (MAIL.test(e) && e.length < 120 && !seen[e]) { seen[e] = 1; out.push(e); }
  });
  return out.slice(0, 40);
}
function autoCode_() { return Utilities.formatDate(new Date(), 'Asia/Riyadh', 'yyyyMMdd-HHmmss'); }

function listVisits_(q) {
  admin_(q);
  return { ok: 1, visits: idx_(), members: members_(), sync: !!props_().getProperty('SYNC_U') };
}

/* مشاركة المجلد الرئيسي مع أعضاء الفريق مرة واحدة، وتنتقل الصلاحية إلى كل زيارة جديدة تلقائياً */
function setMembers_(q) {
  leaderAuth_(q);
  var next = mail_(q.emails), prev = members_(), failed = [];
  var root = DriveApp.getFolderById(props_().getProperty('ROOT_FOLDER_ID'));
  next.forEach(function (e) { if (prev.indexOf(e) < 0) { try { root.addViewer(e); } catch (x) { failed.push(e); } } });
  prev.forEach(function (e) { if (next.indexOf(e) < 0) { try { root.removeViewer(e); } catch (x) {} } });
  var kept = next.filter(function (e) { return failed.indexOf(e) < 0; });
  props_().setProperty('MEMBERS', kept.join(','));
  return { ok: 1, members: kept, failed: failed };
}

function createVisit_(q) {
  leaderAuth_(q);
  var code = String(q.visit || '').replace(/[^A-Za-z0-9\-]/g, ''), auto = !code;
  if (auto) {
    code = autoCode_();
    while (props_().getProperty('VMAN_' + code)) code += token_().charAt(0).toLowerCase();
  }
  if (code.length < 3) throw new Error('رمز الزيارة غير صالح');
  var fas = q.facilities || [];
  if (!fas.length) throw new Error('أضف منشأة واحدة على الأقل');
  if (fas.length > 40) throw new Error('الحد الأعلى 40 منشأة في الزيارة');
  var shared = q.rows || [];
  return withLock_(function () {
    if (props_().getProperty('VMAN_' + code)) throw new Error('رمز الزيارة مستخدم من قبل');
    var root = DriveApp.getFolderById(props_().getProperty('ROOT_FOLDER_ID'));
    var title = clean_(q.title, 60);
    var vf = sub_(root, 'زيارة ' + code);
    var m = { code: code, title: title, created: new Date().toISOString(), deadline: q.deadline || '', pageUrl: String(q.pageUrl || ''), tc: token_(), days: normDays_(q.days, []), facilities: {} };
    var res = [], nrows = 0;
    fas.forEach(function (fa, i) {
      var fid = 'f' + (i + 1), fname = clean_(fa.name, 80) || ('منشأة ' + (i + 1));
      var ff = sub_(vf, fname), token = facToken_(fname);
      var f = { name: fname, token: token, folderId: ff.getId(), folderUrl: ff.getUrl(), rows: {} };
      (fa.rows || shared).slice(0, 400).forEach(function (r) {
        var id = String(r.id || '').replace(/[^A-Za-z0-9_\-]/g, '');
        var lv = LV_NAME[r.lv] ? r.lv : 'e', sb = String(r.sub || '').replace(/[^0-9\-]/g, '');
        if (!id || !sb || f.rows[id]) return;
        f.rows[id] = newRow_(id, sb, lv, r.txt, 'o', 'team', 1);
      });
      nrows += Object.keys(f.rows).length;
      m.facilities[fid] = f;
      props_().setProperty('TOK_' + token, code + '|' + fid);
      res.push({ fid: fid, name: fname, rows: Object.keys(f.rows).length, folderUrl: f.folderUrl, link: pageLink_(m, token) });
    });
    var mf = vf.createFile('_manifest.json', JSON.stringify(m), 'application/json');
    props_().setProperty('VMAN_' + code, mf.getId());
    members_().forEach(function (e) { try { vf.addViewer(e); } catch (x) {} });
    var a = idx_();
    a.unshift({ c: code, t: title, d: m.created, e: m.deadline, n: res.length });
    putIdx_(a);
    return { ok: 1, visit: code, tc: m.tc, folderUrl: vf.getUrl(), rows: nrows, facilities: res };
  });
}

/* مجلد الشاهد يُنشأ عند أول رفع فقط، بترتيب ثابت: المنشأة › المعيار › الفرعي › المستوى › الشاهد */
function rowFolder_(f, r, m) {
  if (r.folderId) { try { return DriveApp.getFolderById(r.folderId); } catch (e) {} }
  var sd = r.sub.split('-')[0];
  var ff = sub_(DriveApp.getFolderById(f.folderId), clean_(rdName_(m, r.rd), 40));
  var rf = sub_(sub_(sub_(sub_(ff, 'المعيار ' + sd), r.sub), LV_NAME[r.lv]), 'شاهد ' + r.id);
  r.folderId = rf.getId(); r.folderUrl = rf.getUrl();
  return rf;
}

/* ---------- الاستيراد من مزامنة نموذج 22م ----------
 * يُحفظ رابط المزامنة ورمز الفريق مرة واحدة داخل السكربت نفسه (Script properties)،
 * فلا يحتاج الرئيس إلى لصقهما في كل زيارة، ولا يظهران في أي صفحة. */
function setSync_(q) {
  leaderAuth_(q);
  var u = String(q.u || '').trim(), c = String(q.c || '').trim();
  if (!u && !c) {
    props_().deleteProperty('SYNC_U'); props_().deleteProperty('SYNC_C');
    return { ok: 1, sync: false };
  }
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_\-]+\/exec$/.test(u)) throw new Error('رابط المزامنة غير صالح');
  if (c.length > 200) throw new Error('رمز الفريق غير صالح');
  props_().setProperty('SYNC_U', u); props_().setProperty('SYNC_C', c);
  return { ok: 1, sync: true };
}

/* ---------- النشر من نموذج 22م بضغطة زر ----------
 * يستقبل اسم المنشأة وشواهدها، فينشئ الزيارة عند أول مرة،
 * ثم يحدّث الطلب نفسه عند كل ضغطة دون أن يمسّ ما رفعته المنشأة. */
function publishForm_(q) {
  leaderAuth_(q);
  var name = clean_(q.name, 80), rows = q.rows || [];
  if (!name) throw new Error('اكتب اسم المنشأة في النموذج أولاً');
  if (!rows.length) throw new Error('أضف شاهداً مطلوباً واحداً على الأقل');
  var code = String(q.visit || '').replace(/[^A-Za-z0-9\-]/g, '');
  if (!code || !props_().getProperty('VMAN_' + code)) {
    var r = createVisit_({ key: q.key, visit: code, title: q.title || name, deadline: q.deadline || '', pageUrl: q.pageUrl || '', facilities: [{ name: name, rows: rows }] });
    return { ok: 1, visit: r.visit, tc: r.tc, link: r.facilities[0].link, rows: r.rows, created: 1 };
  }
  return withLock_(function () {
    var v = loadV_(code), m = v.m, fid = null, added = 0;
    Object.keys(m.facilities).forEach(function (k) { if (m.facilities[k].name === name) fid = k; });
    var root = DriveApp.getFolderById(props_().getProperty('ROOT_FOLDER_ID'));
    var vf = sub_(root, 'زيارة ' + code), f;
    if (!fid) {
      fid = 'f' + (Object.keys(m.facilities).length + 1);
      var ff = sub_(vf, name), token = facToken_(name);
      f = { name: name, token: token, folderId: ff.getId(), folderUrl: ff.getUrl(), rows: {} };
      m.facilities[fid] = f;
      props_().setProperty('TOK_' + token, code + '|' + fid);
    } else f = m.facilities[fid];
    rows.slice(0, 400).forEach(function (r) {
      var id = String(r.id || '').replace(/[^A-Za-z0-9_\-]/g, '');
      var lv = LV_NAME[r.lv] ? r.lv : 'e', sb = String(r.sub || '').replace(/[^0-9\-]/g, '');
      if (!id || !sb) return;
      if (f.rows[id]) { f.rows[id].txt = clean_(r.txt, 300); f.rows[id].sub = sb; f.rows[id].lv = lv; return; }
      f.rows[id] = newRow_(id, sb, lv, r.txt, 'o', 'team', 1);
      added++;
    });
    if (q.deadline) m.deadline = q.deadline;
    if (!m.tc) m.tc = token_();
    saveV_(v);
    return { ok: 1, visit: code, tc: m.tc, link: pageLink_(m, f.token), rows: Object.keys(f.rows).length, added: added, created: 0 };
  });
}

function importSync_(q) {
  admin_(q);
  var u = props_().getProperty('SYNC_U');
  if (!u) throw new Error('لم يُحفظ رابط المزامنة بعد');
  var c = props_().getProperty('SYNC_C') || '';
  var r = UrlFetchApp.fetch(u + '?action=pull&since=0&code=' + encodeURIComponent(c), { muteHttpExceptions: true, followRedirects: true });
  var j;
  try { j = JSON.parse(r.getContentText()); } catch (e) { throw new Error('تعذر قراءة المزامنة. تحقق من الرابط'); }
  if (!j || j.error) throw new Error(j && j.error === 'code' ? 'رمز الفريق المحفوظ لم يعد صالحاً. احفظ الرمز الجديد' : 'تعذر قراءة المزامنة');
  var name = '', f = {};
  (j.rows || []).forEach(function (row) {
    var k = String(row[0]), v = String(row[1] == null ? '' : row[1]);
    if (k === 'v2:m|setup') { try { name = String(JSON.parse(v).facility || ''); } catch (e) {} }
    else if (k.indexOf('v2:f|rq.') === 0) f[k.slice(8)] = v;
  });
  var ids = {};
  Object.keys(f).forEach(function (k) { var m = /^(r[a-z0-9]+)\./.exec(k); if (m) ids[m[1]] = 1; });
  var rows = [], skip = 0, got = 0;
  Object.keys(ids).forEach(function (id) {
    var g = function (x) { return f[id + '.' + x] || ''; };
    if (g('del') === '1') return;
    var sub = g('sub'), lv = g('lv'), txt = g('txt').trim();
    if (!/^[0-9]+-[0-9]+$/.test(sub) || !LV_NAME[lv]) { if (sub || txt) skip++; return; }
    if (g('st') === 'وصل') { got++; return; }
    rows.push({ id: id, sub: sub, lv: lv, txt: txt, n: Number(g('n')) || 0 });
  });
  rows.sort(function (a, b) { return a.n - b.n; });
  return { ok: 1, name: clean_(name, 80), rows: rows.map(function (x) { return { id: x.id, sub: x.sub, lv: x.lv, txt: x.txt }; }), skip: skip, got: got };
}

function team_(q) {
  var code = String(q.visit || '') || (idx_()[0] || {}).c || '';
  var v = loadV_(code);
  var m = v.m;
  teamAuth_(q, m);
  return {
    ok: 1, visit: m.code, title: m.title || '', deadline: m.deadline, closed: closed_(m), days: m.days || [],
    facilities: Object.keys(m.facilities).map(function (fid) {
      var f = m.facilities[fid];
      return {
        fid: fid, name: f.name, folderUrl: f.folderUrl,
        rows: Object.keys(f.rows).map(function (id) { return rowView_(f.rows[id], true); })
      };
    })
  };
}

/* صفحة الرئيس: الزيارة الحالية وروابط المنشآت ورمز الفريق والزيارات المؤرشفة */
function leader_(q) {
  leaderAuth_(q);
  var code = String(q.visit || '') || (idx_()[0] || {}).c || '';
  var out = { ok: 1, visits: idx_(), members: members_(), sync: !!props_().getProperty('SYNC_U'), current: null };
  if (!code) return out;
  return withLock_(function () {
    var v = loadV_(code), m = v.m;
    if (!m.tc) { m.tc = token_(); saveV_(v); }
    out.current = {
      code: m.code, title: m.title || '', deadline: m.deadline, closed: closed_(m), tc: m.tc, days: m.days || [], pageUrl: m.pageUrl || '',
      facilities: Object.keys(m.facilities).map(function (fid) {
        var f = m.facilities[fid], rows = Object.keys(f.rows).map(function (id) { return f.rows[id]; });
        return { fid: fid, name: f.name, folderUrl: f.folderUrl, link: pageLink_(m, f.token), total: rows.length, up: rows.filter(function (r) { return r.files.length || r.links.length; }).length };
      })
    };
    return out;
  });
}

function setDays_(q) {
  leaderAuth_(q);
  return withLock_(function () {
    var v = loadV_(String(q.visit || ''));
    v.m.days = normDays_(q.days, v.m.days);
    if (q.deadline !== undefined) v.m.deadline = String(q.deadline || '');
    saveV_(v);
    return { ok: 1, days: v.m.days, deadline: v.m.deadline };
  });
}

function openDay_(q) {
  return withLock_(function () {
    var v = loadV_(String(q.visit || ''));
    teamAuth_(q, v.m);
    var d = dayOf_(v.m, String(q.day || ''));
    if (!d) throw new Error('اليوم غير موجود');
    var expired = !!d.dl && Date.now() > new Date(d.dl).getTime();
    /* الإغلاق المبكر وإعادة فتح يوم انتهى موعده بإذن رئيس الفريق فقط */
    if (!q.open || expired) leaderAuth_(q);
    d.open = !!q.open;
    if (d.open) {
      if (!d.opened) d.opened = new Date().toISOString();
      /* يُغلق اليوم تلقائياً في نهاية يوم الزيارة (11:59 مساءً بتوقيت الرياض) ما لم يحدد الرئيس موعداً آخر */
      if (!d.dl || expired) d.dl = new Date(Utilities.formatDate(new Date(), 'Asia/Riyadh', 'yyyy-MM-dd') + 'T23:59:00+03:00').toISOString();
    }
    saveV_(v);
    return { ok: 1, days: v.m.days };
  });
}

/* المنشأة تكتب ما طُلب منها في معايير اليوم المفتوح */
function facReq_(q) {
  var sb = String(q.sub || '').replace(/[^0-9\-]/g, ''), lv = LV_NAME[q.lv] ? q.lv : '', txt = clean_(q.txt, 300);
  if (!/^[0-9]+-[0-9]+$/.test(sb) || !lv) throw new Error('اختر المعيار الفرعي والمستوى');
  if (!txt) throw new Error('اكتب الشاهد المطلوب');
  return withLock_(function () {
    var h = byToken_(q.token), d = dayOf_(h.v.m, String(q.day || ''));
    if (!d) throw new Error('اليوم غير موجود');
    if (dayClosed_(d)) throw new Error('هذا اليوم غير مفتوح أو انتهى موعده');
    if (d.subs.length && d.subs.indexOf(sb) < 0) throw new Error('هذا المعيار ليس من معايير هذا اليوم');
    var n = Object.keys(h.f.rows).filter(function (k) { return h.f.rows[k].rd === d.k; }).length;
    if (n >= 80) throw new Error('بلغت الحد الأعلى لطلبات اليوم');
    var id = 'x' + token_().slice(0, 9);
    h.f.rows[id] = newRow_(id, sb, lv, txt, d.k, 'fac', 0);
    saveV_(h.v);
    return { ok: 1, id: id };
  });
}

function facRmReq_(q) {
  return withLock_(function () {
    var h = byToken_(q.token), r = h.f.rows[String(q.row || '')];
    if (!r || r.src !== 'fac') throw new Error('لا يمكن حذف هذا الطلب');
    if (r.files.length || r.links.length || r.status === 'ok') throw new Error('احذف ملفات الشاهد أولاً');
    delete h.f.rows[r.id];
    saveV_(h.v);
    return { ok: 1 };
  });
}

/* الفريق يضيف شاهداً مباشرة إلى منشأة أو إلى كل المنشآت */
function teamAddReq_(q) {
  var sb = String(q.sub || '').replace(/[^0-9\-]/g, ''), lv = LV_NAME[q.lv] ? q.lv : '', txt = clean_(q.txt, 300);
  if (!/^[0-9]+-[0-9]+$/.test(sb) || !lv || !txt) throw new Error('أكمل المعيار والمستوى والشاهد');
  return withLock_(function () {
    var v = loadV_(String(q.visit || '')), m = v.m;
    teamAuth_(q, m);
    var rd = String(q.day || 'o');
    if (rd !== 'o' && !dayOf_(m, rd)) throw new Error('اليوم غير موجود');
    var n = 0;
    Object.keys(m.facilities).forEach(function (fid) {
      if (q.fid && q.fid !== 'all' && q.fid !== fid) return;
      var id = 'y' + token_().slice(0, 9);
      m.facilities[fid].rows[id] = newRow_(id, sb, lv, txt, rd, 'team', 1);
      n++;
    });
    if (!n) throw new Error('المنشأة غير موجودة');
    saveV_(v);
    return { ok: 1, added: n };
  });
}

/* اعتماد طلب كتبته المنشأة، أو تعديل نصه، أو حذفه، أو اعتماد الكل */
function approve_(q) {
  return withLock_(function () {
    var v = loadV_(String(q.visit || '')), m = v.m;
    teamAuth_(q, m);
    var f = m.facilities[q.fid];
    if (!f) throw new Error('المنشأة غير موجودة');
    if (q.op === 'all') {
      var n = 0;
      Object.keys(f.rows).forEach(function (id) {
        var r = f.rows[id];
        if (r.ap === 0 && (!q.day || r.rd === q.day) && (!q.sub || r.sub === q.sub)) { r.ap = 1; n++; }
      });
      saveV_(v);
      return { ok: 1, approved: n };
    }
    var r = f.rows[String(q.row || '')];
    if (!r) throw new Error('الشاهد غير موجود');
    if (q.op === 'ok') { r.ap = 1; if (q.txt) r.txt = clean_(q.txt, 300); }
    else if (q.op === 'edit') { r.txt = clean_(q.txt, 300) || r.txt; }
    else if (q.op === 'del') {
      if (r.files.length || r.links.length) throw new Error('رُفع لهذا الشاهد ملفات، فلا يُحذف');
      delete f.rows[r.id];
    } else throw new Error('إجراء غير صالح');
    saveV_(v);
    return { ok: 1 };
  });
}

/* محضر طلبات اليوم: ملف يُحفظ في مجلد اليوم لدى كل منشأة */
function closeDay_(q) {
  return withLock_(function () {
    var v = loadV_(String(q.visit || '')), m = v.m;
    teamAuth_(q, m);
    var rd = String(q.day || ''), d = dayOf_(m, rd);
    if (!d) throw new Error('اليوم غير موجود');
    var LVN = LV_NAME, SL = { none: 'لم يُرفع', up: 'تم الرفع', ok: 'تم الرفع', redo: 'مطلوب استكمال' };
    var saved = 0;
    Object.keys(m.facilities).forEach(function (fid) {
      var f = m.facilities[fid];
      var rows = Object.keys(f.rows).map(function (k) { return f.rows[k]; }).filter(function (r) { return r.rd === rd && r.ap !== 0; });
      if (!rows.length) return;
      var up = rows.filter(function (r) { return r.files.length || r.links.length; }).length;
      var h = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>طلبات ' + d.label + '</title></head><body style="font-family:Sakkal Majalla,Tahoma,sans-serif">'
        + '<h1>طلبات ' + d.label + '</h1><p>' + f.name + ' · زيارة ' + m.code + '</p><p>المطلوب ' + rows.length + ' · المرفوع ' + up + ' · المتبقي ' + (rows.length - up) + (d.dl ? ' · موعد التسليم ' + d.dl : '') + '</p>'
        + '<table border="1" cellpadding="6" style="border-collapse:collapse"><tr><th>المعيار</th><th>المستوى</th><th>الشاهد</th><th>الحالة</th></tr>'
        + rows.map(function (r) { return '<tr><td>' + r.sub + '</td><td>' + LVN[r.lv] + '</td><td>' + r.txt + '</td><td>' + SL[(r.files.length || r.links.length) ? r.status : 'none'] + '</td></tr>'; }).join('')
        + '</table></body></html>';
      var folder = sub_(DriveApp.getFolderById(f.folderId), clean_(rdName_(m, rd), 40));
      var old = folder.getFilesByName('محضر طلبات اليوم.html');
      while (old.hasNext()) old.next().setTrashed(true);
      folder.createFile('محضر طلبات اليوم.html', h, 'text/html');
      saved++;
    });
    return { ok: 1, saved: saved };
  });
}

function review_(q) {
  return withLock_(function () {
    var v = loadV_(String(q.visit || ''));
    teamAuth_(q, v.m);
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
  leaderAuth_(q);
  return withLock_(function () {
    var v = loadV_(String(q.visit || ''));
    var f = v.m.facilities[q.fid];
    if (!f) throw new Error('المنشأة غير موجودة');
    props_().deleteProperty('TOK_' + f.token);
    f.token = token_();
    props_().setProperty('TOK_' + f.token, v.m.code + '|' + q.fid);
    var map = {};
    try { map = JSON.parse(props_().getProperty('FACTOK') || '{}'); } catch (e) {}
    map[f.name] = f.token;
    props_().setProperty('FACTOK', JSON.stringify(map));
    saveV_(v);
    return { ok: 1, link: pageLink_(v.m, f.token) };
  });
}

function setDeadline_(q) {
  leaderAuth_(q);
  return withLock_(function () {
    var v = loadV_(String(q.visit || ''));
    v.m.deadline = String(q.deadline || '');
    saveV_(v);
    var a = idx_();
    a.forEach(function (x) { if (x.c === v.m.code) x.e = v.m.deadline; });
    putIdx_(a);
    return { ok: 1, deadline: v.m.deadline };
  });
}

/* ---------- المنشأة ---------- */
function portal_(q) {
  var h = byToken_(q.token), m = h.v.m;
  var days = (m.days || []).filter(function (d) { return d.open; }).map(function (d) {
    return { k: d.k, label: d.label, dl: d.dl, closed: dayClosed_(d), subs: d.subs };
  });
  var openKeys = days.map(function (d) { return d.k; });
  return {
    ok: 1, visit: m.code, title: m.title || '', facility: h.f.name, deadline: m.deadline, closed: closed_(m), days: days,
    rows: Object.keys(h.f.rows).map(function (id) { return h.f.rows[id]; })
      .filter(function (r) { return !r.rd || r.rd === 'o' || openKeys.indexOf(r.rd) >= 0; })
      .map(function (r) { return rowView_(r, false); })
  };
}

function editableRow_(h, rowId) {
  var r = h.f.rows[rowId];
  if (!r) throw new Error('الشاهد غير موجود');
  if (closedRd_(h.v.m, r.rd)) throw new Error('أُغلق باب رفع الشواهد');
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
    if (bytes.length > 21 * 1024 * 1024) throw new Error('الملف أكبر من 20 ميغابايت. الصق رابطاً بدلاً منه');
    var mime = String(q.mime || 'application/octet-stream').slice(0, 100);
    var stamp = Utilities.formatDate(new Date(), 'Asia/Riyadh', 'yyyyMMdd-HHmmss');
    var file = rowFolder_(h.f, r, h.v.m).createFile(Utilities.newBlob(bytes, mime, stamp + ' ' + name));
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
  if (!props_().getProperty('ADMIN_KEY') || props_().getProperty('ADMIN_KEY').length < 8) throw new Error('أضف ADMIN_KEY بطول 8 حروف على الأقل');
  var f = DriveApp.getFolderById(id);
  Logger.log('المجلد: ' + f.getName() + ' — الإعداد سليم');
}
