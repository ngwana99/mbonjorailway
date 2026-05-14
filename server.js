const express = require('express');
const cors = require('cors');
const path = require('path');
const { UAParser } = require('ua-parser-js');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function parseDevice(ua) {
  const parser = new UAParser(ua);
  const r = parser.getResult();
  const device = r.device.type || 'desktop';
  const vendor = r.device.vendor || '';
  const model = r.device.model || '';
  let label = device === 'mobile' ? '📱 Phone' : device === 'tablet' ? '📲 Tablet' : '💻 Computer';
  if (vendor) label += ` (${vendor}${model ? ' ' + model : ''})`;
  return {
    device_type: device,
    device_label: label,
    browser: `${r.browser.name || 'Unknown'}${r.browser.major ? ' ' + r.browser.major : ''}`,
    os: `${r.os.name || 'Unknown'}${r.os.version ? ' ' + r.os.version : ''}`
  };
}

function getIP(req) {
  return (req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] || req.socket?.remoteAddress || 'Unknown').replace('::ffff:', '');
}

const ALL_STUDENTS = {
  "116285040":"ABIA LORDINHO LEE","116285033":"ACHARA RISA EMAKUN",
  "116285090":"AFUH CARINE NGUM","116285048":"AJEDMO NAMI SYLVIE INGEE",
  "116285088":"AKWO DAMARIS EMMA","116285076":"ANCHI NADINE ANJA",
  "116285051":"ANDINE JOSOPHINE BABILA","116285001":"ASONGATABONG MBIANDJI DIEUDONNE EBI",
  "116285049":"ASSAH RUDOFF KEKUMI","116285046":"AVUMBOM FAVOUR",
  "116285026":"AWAH MIGUEL PRECIOUS WOTOH","116285056":"AYUK EGBE STACY",
  "116285027":"AZONG ACHAH OCHAL","116285019":"BANDJEM MKWESLEY TONIAN",
  "116285065":"BERN LEAH NDUM","116285061":"CHEFOR BRIGHTNEY NGONGEH",
  "116285062":"CHEFOR BURNSLEY FO'O-ZO","116285050":"CHIA RIHANNA MADAH SIH",
  "116285064":"CLAUDINE SHIWOME","116285099":"DAVID AKEM DISONGE",
  "116285007":"EBANI BLAISE ESOE","116285098":"EBOA STEPHEN BALIKI",
  "116285073":"ELUM FAVOUR OZEN","116285038":"ESUKWE KERA BOSEMEH",
  "116285020":"FOKOH CLARIS CLEAR","116285085":"GINAH MIKERA AFOR",
  "116285023":"KUM NELLY-BRIGHT BENG","116285103":"LAROMI CARINE GORROTI",
  "116285079":"LEKEAKA EMMANUELA ATEHNJU","116285089":"LUM LIZETTE",
  "116285002":"MBAH ASHELY ENGOH","116285066":"MBUBI CLERIJOYCE PANGMEH",
  "116285013":"MENSEH CHEALSE NAMON","116285036":"MOKOLI PENIEL NYAMA",
  "116285052":"NAMINA GLORY MALIKE","116285008":"NDITAH ALEXIM TAMENJOH",
  "116285022":"NDO VANESSA ONYA","116285075":"NEWEH TREVORE NGELON",
  "116285015":"NGOMBA SALOME","116285016":"NGUFOR BERLINE FLORE TAMETA",
  "116285035":"NGULEFAC DAVID ATEAWUNG","116285009":"NGWA PASCAL NJENJI",
  "116285068":"NGWESSE ROWLLINGS DIABE","116285031":"NKWENYI VICTORY NSANNEH",
  "116285094":"NOTO CHRISTIANA NYAMA","116285014":"NTOUBE SIANA MAROLE",
  "116285010":"NYAME FAVOUR DIONE","116285012":"PEWAKE GODWILL WOPENASE",
  "116285072":"ROBERT BETOTO MUDIKA","116285032":"SAMA ALCASIM FIAGMENYI",
  "116285058":"TAMPA DANIEL TABU","116285110":"VICTOR-BLOSSOM MAKAINLY",
  "116285000":"VELUYEN"
};

// ── POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { cin, name, location } = req.body;
    if (!cin || !name) return res.status(400).json({ error: 'CIN and name required' });
    const sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const { error } = await supabase.from('sessions').insert({
      id: sessionId, cin, name,
      login_time: new Date().toISOString(),
      login_timestamp: Date.now(),
      ip: getIP(req), location: location || null,
      ...parseDevice(req.headers['user-agent'] || '')
    });
    if (error) { console.error('Login insert error:', error.message); return res.status(500).json({ error: error.message }); }
    res.json({ success: true, sessionId });
  } catch (e) { console.error(e.message); res.status(500).json({ error: e.message }); }
});

// ── POST /api/logout
app.post('/api/logout', async (req, res) => {
  try {
    const { sessionId, duration } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    await supabase.from('sessions').update({ logout_time: new Date().toISOString(), duration: duration || null }).eq('id', sessionId);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/location
app.post('/api/location', async (req, res) => {
  try {
    const { sessionId, location } = req.body;
    if (!sessionId || !location) return res.status(400).json({ error: 'sessionId and location required' });
    await supabase.from('sessions').update({ location }).eq('id', sessionId);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/quiz
app.post('/api/quiz', async (req, res) => {
  try {
    const { cin, name, topic, score, correct, total } = req.body;
    if (!cin) return res.status(400).json({ error: 'CIN required' });
    const { error } = await supabase.from('quiz_results').insert({ cin, name, topic, score, correct, total, date: new Date().toISOString() });
    if (error) console.error('Quiz insert error:', error.message);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/grade
app.post('/api/grade', async (req, res) => {
  try {
    const { cin, name, qIndex, partIndex, grade, maxMarks } = req.body;
    const { error } = await supabase.from('structured_grades').upsert(
      { cin, name, q_index: qIndex, part_index: partIndex, grade, max_marks: maxMarks, date: new Date().toISOString() },
      { onConflict: 'cin,q_index,part_index' }
    );
    if (error) console.error('Grade upsert error:', error.message);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/admin
app.get('/api/admin', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token !== 'ADMIN2026') return res.status(401).json({ error: 'Unauthorized' });

    const [sRes, qRes, gRes] = await Promise.all([
      supabase.from('sessions').select('*').order('login_time', { ascending: false }).limit(500),
      supabase.from('quiz_results').select('*').order('date', { ascending: false }).limit(500),
      supabase.from('structured_grades').select('*')
    ]);

    const sessions = (sRes.data || []).map(s => ({
      ...s, loginTime: s.login_time, logoutTime: s.logout_time,
      deviceLabel: s.device_label, deviceType: s.device_type
    }));
    const quizResults = qRes.data || [];
    const structuredGrades = gRes.data || [];

    // Build student summary — all 52 always included
    const studentMap = {};
    Object.entries(ALL_STUDENTS).forEach(([cin, name]) => {
      studentMap[cin] = { cin, name, logins: 0, totalDuration: 0, devices: new Set(), lastSeen: null, quizCount: 0, quizAvg: null };
    });
    sessions.forEach(s => {
      if (!studentMap[s.cin]) studentMap[s.cin] = { cin: s.cin, name: s.name, logins: 0, totalDuration: 0, devices: new Set(), lastSeen: null, quizCount: 0, quizAvg: null };
      studentMap[s.cin].logins++;
      if (s.duration) studentMap[s.cin].totalDuration += s.duration;
      if (s.device_label) studentMap[s.cin].devices.add(s.device_label);
      if (!studentMap[s.cin].lastSeen || s.login_time > studentMap[s.cin].lastSeen) studentMap[s.cin].lastSeen = s.login_time;
    });
    Object.values(studentMap).forEach(st => {
      const qrs = quizResults.filter(q => q.cin === st.cin);
      st.quizCount = qrs.length;
      st.quizAvg = qrs.length ? Math.round(qrs.reduce((s, r) => s + r.score, 0) / qrs.length) : null;
      st.devices = [...st.devices];
    });

    const withDur = sessions.filter(s => s.duration);
    res.json({
      sessions, quizResults, structuredGrades,
      studentSummary: Object.values(studentMap),
      totals: {
        totalSessions: sessions.length,
        uniqueStudents: sessions.length > 0 ? new Set(sessions.map(s => s.cin)).size : 0,
        quizzesTaken: quizResults.length,
        avgDuration: withDur.length ? Math.round(withDur.reduce((a, s) => a + s.duration, 0) / withDur.length) : 0
      }
    });
  } catch (e) { console.error('Admin error:', e.message); res.status(500).json({ error: e.message }); }
});

// ── GET /api/export
app.get('/api/export', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token !== 'ADMIN2026') return res.status(401).json({ error: 'Unauthorized' });
    const [sRes, qRes] = await Promise.all([
      supabase.from('sessions').select('*').order('login_time', { ascending: false }),
      supabase.from('quiz_results').select('*').order('date', { ascending: false })
    ]);
    let csv = 'Type,CIN,Name,Login Time,Logout Time,Duration(s),Device,Browser,OS,Location,IP\n';
    (sRes.data || []).forEach(s => {
      csv += `Login,"${s.cin}","${s.name}","${s.login_time}","${s.logout_time||'–'}","${s.duration||'–'}","${s.device_label||'–'}","${s.browser||'–'}","${s.os||'–'}","${s.location||'Unknown'}","${s.ip||'–'}"\n`;
    });
    csv += '\nType,CIN,Name,Topic,Score(%),Correct,Total,Date\n';
    (qRes.data || []).forEach(r => {
      csv += `Quiz,"${r.cin}","${r.name}","${r.topic}","${r.score}","${r.correct}","${r.total}","${r.date}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="GHSMbonjo_CS_AllData.csv"');
    res.send(csv);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/grades/:cin
app.get('/api/grades/:cin', async (req, res) => {
  try {
    const { data, error } = await supabase.from('structured_grades').select('*').eq('cin', req.params.cin);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE /api/admin/clear
app.delete('/api/admin/clear', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token !== 'ADMIN2026') return res.status(401).json({ error: 'Unauthorized' });
    const { type } = req.body;
    if (type === 'sessions' || type === 'all') await supabase.from('sessions').delete().neq('id', '___');
    if (type === 'quiz' || type === 'all') await supabase.from('quiz_results').delete().gt('id', 0);
    if (type === 'all') await supabase.from('structured_grades').delete().gt('id', 0);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GHS Mbonjo CS Platform (Supabase Edition) running on port ${PORT}`);
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.warn('⚠️  SUPABASE_URL or SUPABASE_KEY not set — set them in Railway environment variables!');
  } else {
    console.log('✅ Supabase URL:', process.env.SUPABASE_URL);
  }
});
process.on('uncaughtException', err => console.error('Uncaught:', err.message));
process.on('unhandledRejection', reason => console.error('Rejection:', reason));
