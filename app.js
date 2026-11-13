'use strict';
const KEY='mein-training-v1';
const defaults={
  push:[
    {id:'dips',name:'Dips',equipment:'Dip-Stangen',rest:240,kind:'bodyweight',reference:[[15,0],[9,20],[8,17.5],[9,15]],hint:'Zusatzgewicht; 0 kg = nur Körpergewicht'},
    {id:'ohp',name:'Overhead Press',equipment:'Langhantel',rest:240,kind:'weight',reference:[[20,20],[15,30],[14,35],[11,40]]},
    {id:'flys',name:'Flys',equipment:'Kabelzug',rest:180,kind:'weight',reference:[[7,27],[12,23],[10,23]]},
    {id:'triceps',name:'Trizepsdrücken',equipment:'Kabelzug',rest:120,kind:'weight',reference:[[11,50],[9.5,50]],dropLast:true},
    {id:'lateral_push',name:'Seitheben (abwechselnd)',equipment:'Kabelzug',rest:60,kind:'weight',reference:[[9,9],[8,9]],hint:'2 Sätze je Seite. Auf Push und Pull verteilt; Fortschritt über kontrollierte Wiederholungen.'}
  ],
  pull:[
    {id:'pullups',name:'Klimmzüge',equipment:'Klimmzugstange',rest:240,kind:'pullup',reference:[[8,0],[7,0],[6,0],[5,0]],hint:'Widerstandsband nach Farbe/Hersteller benennen – keine pauschale kg-Umrechnung'},
    {id:'row',name:'Rudern mittel',equipment:'Kabelzug',rest:180,kind:'weight',reference:[[12,63],[12,63],[10,63]]},
    {id:'reverse',name:'Reverse Butterfly',equipment:'Kabelzug',rest:180,kind:'weight',reference:[[11,9],[9,9],[9,9]]},
    {id:'curls',name:'Hammer Curls',equipment:'Kabelzug',rest:120,kind:'weight',reference:[[6,54],[9,50],[8,50]],dropLast:true},
    {id:'lateral',name:'Seitheben (abwechselnd)',equipment:'Kabelzug',rest:60,kind:'weight',reference:[[9,9],[8,9]],hint:'Wiederholungen je Seite; gleiche Zählweise beibehalten'}
  ],
  legs:[
    {id:'deadlift',name:'Kreuzheben',equipment:'Langhantel',rest:240,kind:'weight',reference:[[5,100],[5,100],[5,100]]},
    {id:'squat',name:'Squats',equipment:'Langhantel',rest:240,kind:'weight',reference:[[8,60],[8,70],[5,80]]}
  ]
};
const days={push:'Push',pull:'Pull',legs:'Beine'};
function initial(){return {version:1,settings:{care:true,bands:['Leicht','Mittel','Stark'],weightUnit:'kg'},plan:structuredClone(defaults),sessions:[],draft:null};}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)); if(x && x.version===1 && x.plan && Array.isArray(x.sessions))return x;}catch(e){}return initial();}
// Einmalige, nicht destruktive Erweiterung bestehender Installationen: vorhandene
// Trainingseinheiten und Entwürfe bleiben vollständig unverändert.
function migratePlan(){
  if(!db.settings)db.settings={care:true,bands:['Leicht','Mittel','Stark'],weightUnit:'kg'};
  if(!db.settings.pushLateralAdded){
    if(Array.isArray(db.plan?.push) && !db.plan.push.some(e=>e.id==='lateral_push')){
      db.plan.push.push(structuredClone(defaults.push.find(e=>e.id==='lateral_push')));
    }
    db.settings.pushLateralAdded=true;
    try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
  }
}
let db=load(), tab='home', selectedDay='push', currentExercise=0, chartExercise='ohp', chartMetric='e1rm', editing=false;
let timer={end:0,length:0,remaining:0,paused:false,beeped:false};
migratePlan();
const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>{const n=Number(x);return Number.isFinite(n)?n:0;};
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(n):'–';
const today=()=>new Date().toLocaleDateString('de-DE');
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){toast('Speicher voll oder blockiert – bitte Backup exportieren.');}}
function toast(t){const el=$('#toast');el.textContent=t;el.style.display='block';clearTimeout(toast._id);toast._id=setTimeout(()=>el.style.display='none',2600);}
function btn(label,action,klass=''){return `<button class="btn ${klass}" data-action="${action}">${label}</button>`;}
function nav(){return `<nav class="nav" aria-label="Hauptnavigation">${[['home','⌂','Start'],['train','◉','Training'],['stats','▥','Analyse'],['settings','⚙','Einstellungen']].map(([id,icon,label])=>`<button class="${tab===id?'selected':''}" data-action="tab" data-value="${id}"><span>${icon}</span>${label}</button>`).join('')}</nav>`;}
function header(title,subtitle=''){return `<header class="top"><div><div class="eyebrow">MEIN TRAINING</div><h1>${title}</h1>${subtitle?`<p class="muted">${subtitle}</p>`:''}</div><span class="pill ${db.settings.care?'warn':'good'}">${db.settings.care?'♡ Schonmodus':'↗ Progression'}</span></header>`;}
function latestExercise(id){for(let i=db.sessions.length-1;i>=0;i--){const e=db.sessions[i].exercises.find(e=>e.id===id);if(e)return e;}return null;}
function refs(ex){return ex.reference.map(([reps,kg],i)=>`${i+1}: ${fmt(reps)} × ${ex.kind==='pullup'?'BW':(ex.kind==='bodyweight'&&kg===0?'BW':`${fmt(kg)} kg${ex.kind==='bodyweight'?' Zusatz':''}`)}`).join(' · ');}
function home(){const count=db.sessions.length;const last=db.sessions.at(-1);return `${header('Dein Training','Push · Pull · Beine – individuell für dich')}
 <div class="card soft"><div class="cardhead"><div><div class="eyebrow">HEUTE</div><h2>${db.draft?'Training fortsetzen':'Bereit für deine Einheit?'}</h2></div><span class="pill">${today()}</span></div>
 <p class="sub">${db.draft?'Deine laufende Einheit ist automatisch zwischengespeichert.':'Wähle deinen Trainingstag. Deine letzten Werte sind als Orientierung hinterlegt.'}</p>
 ${db.draft?btn('Training fortsetzen','resume','primary full'):`<div class="grid3">${Object.keys(days).map(d=>`<button class="btn ${selectedDay===d?'primary':''}" data-action="day" data-value="${d}">${days[d]}</button>`).join('')}</div><div style="height:11px"></div>${btn(`${days[selectedDay]} starten`,'start','primary full')}`}</div>
 <div class="grid2"><div class="metric"><div class="hint">Gespeicherte Einheiten</div><div class="big">${count}</div></div><div class="metric"><div class="hint">Letztes Training</div><div class="big" style="font-size:17px">${last?`${days[last.day]} · ${new Date(last.finished).toLocaleDateString('de-DE')}`:'Noch keines'}</div></div></div>
 <div class="card"><h2>Dein Trainingsplan</h2><p class="sub">Die Satzpausen sind bereits genau nach deinen Angaben eingestellt.</p>${Object.entries(db.plan).map(([day,arr])=>`<div class="exercise"><div class="row between"><strong>${days[day]}</strong><span class="pill">${arr.length} Übungen</span></div>${arr.map(e=>`<div class="history"><span>${esc(e.name)}</span><span class="muted">${e.rest/60} Min.</span></div>`).join('')}</div>`).join('')}</div>
 ${db.settings.care?'<div class="notice">Schonmodus aktiv: Keine automatische Aufforderung zur Gewichtssteigerung. Belastung schmerzarm halten; bei zunehmenden oder wiederkehrenden Beschwerden fachlich abklären lassen.</div>':''}
 <div class="card"><h3>So funktioniert die Auswertung</h3><p class="sub">Verglichen werden vor allem gleichartige Übungen mit gleicher Geräteeinstellung. Aufwärmen, Dropsätze und bandunterstützte Klimmzüge werden getrennt berücksichtigt.</p>${btn('Fortschritt ansehen','stats','full')}</div>`;}
function newSet(ex,idx){const ref=ex.reference[idx]||ex.reference.at(-1)||[8,0];const last=latestExercise(ex.id)?.sets[idx];return {reps:last?.reps??ref[0],kg:last?.kg??ref[1],type:'normal',rir:'',done:false,band:ex.kind==='pullup'?'Ohne Unterstützung':'',assistance:0,drop:null};}
function start(){if(db.draft){tab='train';render();return;}db.draft={day:selectedDay,started:new Date().toISOString(),exercises:db.plan[selectedDay].map(ex=>({id:ex.id,pain:'',notes:'',sets:ex.reference.map((_,i)=>newSet(ex,i))}))};currentExercise=0;save();tab='train';render();}
function activeInfo(){if(!db.draft)return null;const e=db.draft.exercises[currentExercise];return {entry:e,ex:db.plan[db.draft.day].find(x=>x.id===e.id)};}
function train(){if(!db.draft)return `${header('Training','Keine laufende Einheit')}${btn('Training auswählen','home','primary full')}`;
 const {entry,ex}=activeInfo();const n=db.draft.exercises.length;const done=db.draft.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);const total=db.draft.exercises.reduce((a,e)=>a+e.sets.length,0);
 return `${header(`${days[db.draft.day]}-Training`,`${new Date(db.draft.started).toLocaleString('de-DE')} · ${done}/${total} Sätze erfasst`)}
 <div class="progress"><div style="width:${total?100*done/total:0}%"></div></div><div class="tabs">${db.draft.exercises.map((e,i)=>`<button class="btn small ${i===currentExercise?'chosen':''}" data-action="exercise" data-value="${i}">${esc(db.plan[db.draft.day].find(x=>x.id===e.id).name)}</button>`).join('')}</div>
 ${timer.end||timer.paused?timerMarkup():''}
 <div class="card"><div class="cardhead"><div><div class="eyebrow">ÜBUNG ${currentExercise+1} VON ${n}</div><h2>${esc(ex.name)}</h2><div class="hint">${esc(ex.equipment)} · Pause: ${Math.floor(ex.rest/60)}:${String(ex.rest%60).padStart(2,'0')} min</div></div><span class="pill">${entry.sets.filter(s=>s.done).length}/${entry.sets.length}</span></div>
 <div class="hint">Letzte Referenz: ${esc(refs(ex))}</div>${latestExercise(ex.id)?`<div class="notice">Letzte abgeschlossene Einheit: ${latestExercise(ex.id).sets.filter(s=>s.done).map(s=>`${fmt(s.reps)}×${fmt(s.kg)} kg`).join(' · ')||'keine Sätze'}</div>`:''}
 ${ex.hint?`<p class="hint" style="margin-top:7px">${esc(ex.hint)}</p>`:''}
 <div class="divider"></div>${entry.sets.map((s,i)=>setMarkup(s,i,ex)).join('')}
 <div class="row wrap">${btn('+ Satz hinzufügen','addset','small')}${btn('Standardpause starten','rest','small')}</div>
 <div class="divider"></div><h3>Schmerzbewertung (optional)</h3><p class="hint" style="margin:6px 0 10px">0 = keine Schmerzen, 10 = stärkste vorstellbare Schmerzen. Pro Übung und Einheit.</p><div class="row"><select aria-label="Schmerzbewertung" data-field="pain"><option value="">Nicht erfasst</option>${Array.from({length:11},(_,i)=>`<option value="${i}" ${String(entry.pain)===String(i)?'selected':''}>${i} / 10</option>`).join('')}</select></div>
 <label style="margin-top:10px">Notiz zur Übung (optional)</label><input data-field="notes" value="${esc(entry.notes)}" placeholder="z. B. rechte Schulter, Ausführung angepasst" /></div>
 <div class="grid2">${btn('← Vorherige','prev',`full ${currentExercise===0?'':''}`)}${btn(currentExercise<n-1?'Nächste →':'Zum Abschluss →','next','primary full')}</div>
 <div style="height:12px"></div>${btn('Einheit abschließen','finish','full')}
 <div style="height:9px"></div>${btn('Einheit verwerfen','discard','danger full')}
 <p class="hint" style="margin-top:10px">Änderungen werden automatisch auf diesem Gerät gespeichert. Der Timer läuft anhand der Uhrzeit weiter, auch wenn du kurz die Ansicht wechselst; Ton/Vibration bei gesperrtem iPhone sind nicht garantiert.</p>`;}
function setMarkup(s,i,ex){const mode=ex.kind==='pullup';return `<div class="setrow"><div class="setlabel"><strong>Satz ${i+1} ${s.done?'✓':''}</strong><div class="row"><span class="legend">${s.done?'Erfasst':'Noch offen'}</span><button class="btn small" data-action="removeset" data-value="${i}" aria-label="Satz entfernen">×</button></div></div>
 <div class="fieldset"><div><label>Wdh.</label><input type="number" min="0" step="0.5" data-set="${i}" data-prop="reps" value="${esc(s.reps)}"></div><div><label>${mode?'Zusatz kg':'Gewicht kg'}</label><input type="number" min="0" step="0.5" data-set="${i}" data-prop="kg" value="${esc(s.kg)}"></div>
 <div><label>RIR</label><select data-set="${i}" data-prop="rir"><option value="">–</option>${Array.from({length:11},(_,n)=>`<option value="${n}" ${String(s.rir)===String(n)?'selected':''}>${n}</option>`).join('')}</select></div>
 <div><label>Satzart</label><select data-set="${i}" data-prop="type"><option value="normal" ${s.type==='normal'?'selected':''}>Normal</option><option value="warmup" ${s.type==='warmup'?'selected':''}>Aufbau</option></select></div></div>
 ${mode?`<div class="grid2" style="margin-top:8px"><div><label>Unterstützung</label><select data-set="${i}" data-prop="band"><option value="Ohne Unterstützung" ${s.band==='Ohne Unterstützung'?'selected':''}>Ohne Unterstützung</option>${db.settings.bands.map(b=>`<option value="${esc(b)}" ${s.band===b?'selected':''}>${esc(b)}</option>`).join('')}<option value="Maschine" ${s.band==='Maschine'?'selected':''}>Maschine</option></select></div><div>${s.band==='Maschine'?`<label>Hilfe (kg)</label><input type="number" min="0" data-set="${i}" data-prop="assistance" value="${esc(s.assistance)}">`:'<label>Hinweis</label><div class="hint">Bandangabe separat vergleichen</div>'}</div></div>`:''}
 <div class="row wrap" style="margin-top:9px"><button class="btn small ${s.done?'':'primary'}" data-action="toggle" data-value="${i}">${s.done?'✓ Erfasst – korrigieren':'✓ Satz fertig'}</button><button class="btn small" data-action="drop" data-value="${i}">${s.drop?'Dropsatz bearbeiten':'＋ Dropsatz'}</button></div>
 ${s.drop?`<div class="grid2" style="margin-top:9px"><div><label>Drop-Wdh.</label><input type="number" min="0" step="0.5" data-set="${i}" data-prop="drop.reps" value="${esc(s.drop.reps)}"></div><div><label>Drop-Gewicht kg</label><input type="number" min="0" step="0.5" data-set="${i}" data-prop="drop.kg" value="${esc(s.drop.kg)}"></div></div><p class="hint" style="margin-top:5px">Ohne Satzpause direkt anschließend. Dropsatz wird getrennt ausgewertet.</p>`:''}</div>`;}
function timerMarkup(){const remaining=timer.paused?timer.remaining:Math.max(0,Math.ceil((timer.end-Date.now())/1000));const done=remaining===0;return `<div class="timer ${done?'done':''}"><div class="eyebrow">${done?'PAUSE BEENDET':'SATZPAUSE'}</div><div class="clock" id="clock">${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}</div><p class="hint">${done?'Du kannst den nächsten Satz beginnen.':'Individuelle Pause – jederzeit anpassbar'}</p><div class="timer-controls">${btn('−15 s','timer-minus','small')}${btn(timer.paused?'Weiter':'Pausieren','timer-pause','small')}${btn('+15 s','timer-plus','small')}${btn('Beenden','timer-stop','small')}</div></div>`;}
function timerStart(seconds){timer={end:Date.now()+seconds*1000,length:seconds,remaining:seconds,paused:false,beeped:false};render();}
function timerStop(){timer={end:0,length:0,remaining:0,paused:false,beeped:false};render();}
function timerTick(){if(!timer.end||timer.paused)return;const left=Math.max(0,Math.ceil((timer.end-Date.now())/1000));const clock=$('#clock');if(clock)clock.textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;if(left===0&&!timer.beeped){timer.beeped=true;if(navigator.vibrate)navigator.vibrate([180,80,180]);toast('Satzpause beendet');if(tab==='train')render();}}
setInterval(timerTick,500);
function hintFor(exId){const entries=db.sessions.map(s=>({session:s,ex:s.exercises.find(e=>e.id===exId)})).filter(x=>x.ex);const current=entries.at(-1);if(!current)return 'Nach der ersten abgeschlossenen Einheit erhältst du hier persönliche Hinweise.';
const pain=current.ex.pain===''?null:num(current.ex.pain);if(pain!==null&&pain>=3)return 'Schmerzbewertung erhöht: Belastung nicht steigern. Bei wiederkehrenden oder zunehmenden Beschwerden medizinisch/physiotherapeutisch abklären.';
if(db.settings.care)return 'Schonmodus aktiv: schmerzarme Ausführung und kontrollierter Belastungsaufbau sind wichtiger als eine Leistungssteigerung.';
const prev=entries.at(-2);if(!prev)return 'Erste dokumentierte Einheit. Nach weiteren Einheiten werden Veränderungen sichtbar.';
const a=summary(current.ex), b=summary(prev.ex);if(a.maxE1rm>b.maxE1rm*1.02)return 'Deine geschätzte Leistung ist gegenüber der letzten Einheit gestiegen. Achte auf vergleichbare Ausführung und RIR.';
if(a.volume>b.volume*1.05)return 'Dein dokumentiertes Zusatz-/Gerätevolumen ist gestiegen. Das ist nicht automatisch gleichbedeutend mit einem Kraftzuwachs.';
return 'Leistung ähnlich wie zuletzt. Vergleiche zusätzlich RIR, Bewegungsausführung und Schmerzverlauf.';}
function summary(entry){const good=entry.sets.filter(s=>s.done&&s.type!=='warmup');return {volume:good.reduce((n,s)=>n+num(s.kg)*num(s.reps),0),maxE1rm:Math.max(0,...good.map(s=>num(s.kg)*(1+Math.min(30,num(s.reps))/30))),maxKg:Math.max(0,...good.map(s=>num(s.kg))),maxReps:Math.max(0,...good.map(s=>num(s.reps)))};}
function stats(){const all=Object.values(db.plan).flat();const ex=all.find(e=>e.id===chartExercise)||all[0];const samples=db.sessions.map(s=>({date:new Date(s.finished),day:s.day,entry:s.exercises.find(x=>x.id===ex.id)})).filter(s=>s.entry);const values=samples.map(s=>({...s,stat:summary(s.entry)}));const labels={e1rm:'Geschätzte Maximalkraft (kg)',volume:'Geräte-/Zusatzlast-Volumen (kg)',maxKg:'Maximales Satzgewicht (kg)',maxReps:'Beste Satz-Wiederholungen',pain:'Schmerz (0–10)'};const key=chartMetric==='e1rm'?'maxE1rm':chartMetric;const points=values.map((v,i)=>({x:i,y:chartMetric==='pain'?(v.entry.pain===''?null:num(v.entry.pain)):v.stat[key]})).filter(p=>p.y!==null);
 return `${header('Fortschritt','Deine Daten, übersichtlich ausgewertet')}<div class="grid2"><div class="metric"><div class="hint">Abgeschlossene Einheiten</div><div class="big">${db.sessions.length}</div></div><div class="metric"><div class="hint">Erfasste Arbeitssätze</div><div class="big">${db.sessions.reduce((n,s)=>n+s.exercises.reduce((a,e)=>a+e.sets.filter(x=>x.done&&x.type!=='warmup').length,0),0)}</div></div></div>
 <div class="card"><h2>Übungsauswertung</h2><label style="margin-top:10px">Übung</label><select id="chartExercise">${all.map(e=>`<option value="${e.id}" ${ex.id===e.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select><label style="margin-top:10px">Kennzahl</label><select id="chartMetric">${Object.entries(labels).map(([k,label])=>`<option value="${k}" ${chartMetric===k?'selected':''}>${label}</option>`).join('')}</select>
 ${points.length?`<canvas id="progressChart" class="chart" aria-label="Verlaufsdiagramm ${esc(labels[chartMetric])}"></canvas><div class="row between" style="margin-top:8px"><span class="hint">${points.length} Messpunkte</span><strong>${fmt(points.at(-1).y)}${chartMetric==='pain'?' / 10':chartMetric==='maxReps'?' Wdh.':' kg'}</strong></div>`:'<div class="notice">Für diese Kennzahl sind noch keine Werte gespeichert. Zeichne zuerst eine Trainingseinheit auf.</div>'}
 <div class="divider"></div><h3>Trainingshinweis</h3><p class="sub" style="margin:7px 0">${hintFor(ex.id)}</p><p class="hint">e1RM ist eine grobe rechnerische Schätzung. Für Klimmzüge und Dips mit Körpergewicht und Bandunterstützung sind reine Zusatzgewichtskennzahlen nur eingeschränkt sinnvoll. Vergleiche dort Wiederholungen und Bandart.</p></div>
 <div class="card"><h2>Trainingshistorie</h2>${db.sessions.length?db.sessions.slice().reverse().map((s,i)=>`<div class="history"><div><strong>${days[s.day]}</strong><div class="hint">${new Date(s.finished).toLocaleString('de-DE')} · ${s.exercises.reduce((a,e)=>a+e.sets.filter(x=>x.done).length,0)} Sätze</div></div>${btn('Details','history','small')}<input type="hidden" value="${s.id}"></div>`).join(''):'<p class="sub">Noch keine abgeschlossenen Einheiten.</p>'}</div>`;}
function coachReport(){
 const all=Object.values(db.plan).flat();
 const lines=[
  'MEIN TRAINING – BERICHT FÜR CHATGPT',
  `Erstellt: ${new Date().toLocaleString('de-DE')}`,
  `Modus: ${db.settings.care?'Schonmodus (keine Steigerungen erzwingen)':'Normaler Trainingsmodus'}`,
  'Ziel: Schwerpunkt Schultern, Brust, Arme; Beine einmal wöchentlich. Training soll Spaß machen und langfristig durchhaltbar bleiben.',
  'Hinweis: Schmerzen und RIR stets berücksichtigen; die Daten enthalten keine ärztliche Trainingsfreigabe.',
  `Abgeschlossene Einheiten: ${db.sessions.length}`,
  `Davon Push: ${db.sessions.filter(s=>s.day==='push').length}, Pull: ${db.sessions.filter(s=>s.day==='pull').length}, Beine: ${db.sessions.filter(s=>s.day==='legs').length}`,
  '', 'AKTUELLER TRAININGSPLAN UND PAUSEN'
 ];
 for(const [day,exercises] of Object.entries(db.plan)){
  lines.push(`${days[day]}:`);
  for(const ex of exercises)lines.push(`- ${ex.name} | ${ex.equipment} | Pause ${ex.rest} Sekunden`);
 }
 lines.push('', 'TRAININGSHISTORIE (chronologisch; nur abgeschlossene Sätze)');
 if(!db.sessions.length)lines.push('Bisher keine abgeschlossenen Einheiten.');
 for(const session of db.sessions){
  lines.push('', `${new Date(session.finished).toLocaleString('de-DE')} | ${days[session.day]} | Trainingsbeginn ${session.started||'unbekannt'}`);
  for(const entry of session.exercises){
   const ex=all.find(x=>x.id===entry.id);
   const completed=entry.sets.filter(x=>x.done);
   if(!completed.length && entry.pain==='' && !entry.notes)continue;
   lines.push(`  ${ex?.name||entry.id} | Schmerz ${entry.pain===''?'nicht erfasst':entry.pain+'/10'}${entry.notes?' | Notiz: '+entry.notes:''}`);
   completed.forEach((set,i)=>{
    let label=`    Satz ${i+1}: ${set.reps} Wdh. × ${set.kg} kg (${set.type==='warmup'?'Aufwärmen':'regulär'})`;
    if(set.rir!==''&&set.rir!=null)label+=` | RIR ${set.rir}`;
    if(set.band)label+=` | Unterstützung: ${set.band}`;
    if(set.band==='Maschine')label+=` (${set.assistance} kg)`;
    if(set.drop)label+=` | direkt anschließender Dropsatz: ${set.drop.reps} × ${set.drop.kg} kg`;
    lines.push(label);
   });
  }
 }
 if(db.draft)lines.push('', 'Hinweis: Eine noch laufende Einheit ist nicht Teil der abgeschlossenen Trainingshistorie.');
 lines.push('', 'BITTE ANALYSIERE:',
   '1. Trainingshäufigkeit und Kontinuität (einschließlich Push/Pull/Beine-Verteilung).',
   '2. Progression pro Übung: Wiederholungen, Lasten, RIR und möglichst vergleichbare Satzbedingungen.',
   '3. Schmerztrends, inklusive Warnzeichen für nötige Entlastung – keine Steigerung trotz Schmerzen empfehlen.',
   '4. Konkrete, vorsichtige Vorschläge für die nächsten Einheiten; Spaß und Kontinuität haben Priorität.',
   'Verwechsle Kabelzuglasten nicht mit freien Gewichten; berechne Bandunterstützung nicht als festen kg-Abzug.');
 return lines.join('\n');
}
function coachDownload(){
 const blob=new Blob([coachReport()],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mein-training-ki-bericht-'+new Date().toISOString().slice(0,10)+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('KI-Bericht erstellt');
}
async function coachShare(){
 const content=coachReport();
 try{
  if(navigator.share){await navigator.share({title:'Mein Trainingsbericht',text:content});return;}
 }catch(e){if(e.name==='AbortError')return;}
 try{await navigator.clipboard.writeText(content);toast('Bericht kopiert – hier in ChatGPT einfügen.');}
 catch(e){const area=document.getElementById('coachText');if(area){area.value=content;area.focus();area.select();toast('Bericht markieren und kopieren.');}else coachDownload();}
}
function settings(){return `${header('Einstellungen','Dein Training bleibt unter deiner Kontrolle')}<div class="card"><h2>Trainingsmodus</h2><div class="switch" style="margin-top:14px"><input id="care" type="checkbox" ${db.settings.care?'checked':''}><div><strong>Schonmodus</strong><p class="hint">Keine Steigerungsempfehlungen; Schmerzverlauf im Fokus.</p></div></div><div class="notice">Eine App ersetzt keine medizinische Untersuchung. Bei wiederkehrenden Schmerzen keine Steigerungen erzwingen.</div></div>
 <div class="card"><h2>Pausenzeiten ändern</h2><p class="sub">Alle Angaben sind in Sekunden; Standardwerte entsprechen deinen Vorgaben.</p>${Object.entries(db.plan).map(([day,arr])=>`<h3 style="margin:13px 0 6px">${days[day]}</h3>${arr.map(e=>`<div class="row between" style="margin-bottom:10px"><span style="flex:1">${esc(e.name)}</span><input style="width:88px" type="number" min="0" step="15" data-rest="${e.id}" value="${e.rest}" aria-label="Pause ${esc(e.name)} in Sekunden"></div>`).join('')}`).join('')}</div>
 <div class="card"><h2>Deine Klimmzugbänder</h2><p class="sub">Farben, Bandnamen und Hersteller individuell eintragen. Jeweils ein Band pro Zeile.</p><textarea id="bands" rows="4" style="width:100%;padding:12px;background:#0c1525;color:white;border:1px solid var(--line);border-radius:10px">${esc(db.settings.bands.join('\n'))}</textarea>${btn('Bänder speichern','savebands','full')}</div>
 <div class="card"><h2>KI-Coach – Bericht für ChatGPT</h2><p class="sub">Erstellt aus deiner gesamten abgeschlossenen Trainingshistorie einen verständlichen Text mit Übungen, Wiederholungen, Gewichten, RIR, Dropsätzen und Schmerzbewertungen. Nur du entscheidest, ob und wann du den Bericht teilst.</p><div class="stack">${btn('Bericht teilen / kopieren','coach-share','primary full')}${btn('Bericht als Textdatei herunterladen','coach-download','full')}</div><p class="hint" style="margin-top:10px">Keine automatische Übertragung an ChatGPT. Du kannst den Bericht hier in unseren Chat einfügen oder als Datei hochladen. Das JSON-Backup bleibt davon unabhängig.</p><textarea id="coachText" rows="3" readonly style="position:absolute;left:-9999px" aria-label="KI-Trainingsbericht"></textarea></div>
 <div class="card"><h2>Datensicherung</h2><p class="sub">Deine Daten werden lokal im Browser gespeichert. Löschen von Website-Daten, Gerätewechsel oder ein privater Browsermodus können sie entfernen. Bitte regelmäßig exportieren.</p><div class="stack">${btn('Backup als JSON herunterladen','export','primary full')}<label for="importFile" class="btn full" style="text-align:center;color:var(--text);margin:0">Backup importieren</label><input id="importFile" type="file" accept="application/json,.json" style="display:none"></div><p class="hint" style="margin-top:10px">Ein Import ersetzt den bisherigen lokalen Datenbestand. Speichere vorher ein Backup.</p></div>
 <div class="card"><h3>Über diese Version</h3><p class="hint">Version 1.1 · Offlinefähige PWA · Kein Konto, keine Cloud und keine kostenpflichtige KI. Trainingshinweise sind regelbasiert. iPhone-Töne und -Benachrichtigungen im Hintergrund sind browserabhängig.</p></div>`;}
function render(){const content={home,train,stats,settings}[tab]();$('#app').innerHTML=content+nav();if(tab==='stats'&&$('#progressChart'))draw();}
function draw(){const c=$('#progressChart');if(!c)return;const exId=chartExercise;const entries=db.sessions.map(s=>({entry:s.exercises.find(e=>e.id===exId)})).filter(x=>x.entry);const key=chartMetric==='e1rm'?'maxE1rm':chartMetric;let pts=entries.map(x=>chartMetric==='pain'?(x.entry.pain===''?null:num(x.entry.pain)):summary(x.entry)[key]).filter(x=>x!==null);if(!pts.length)return;const width=c.clientWidth||320, height=180,dpr=window.devicePixelRatio||1;c.width=width*dpr;c.height=height*dpr;const ctx=c.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);const pad={l:40,r:13,t:18,b:26},min=Math.min(...pts,0),max=Math.max(...pts,1),lo=chartMetric==='pain'?0:Math.max(0,min-(max-min)*.12),hi=chartMetric==='pain'?10:max+(max-lo)*.18||1;ctx.font='11px system-ui';ctx.fillStyle='#a7b4cb';ctx.strokeStyle='#35435b';for(let j=0;j<=4;j++){let y=pad.t+(height-pad.t-pad.b)*j/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.fillText(fmt(hi-(hi-lo)*j/4),3,y+4);}const xy=pts.map((v,i)=>({x:pad.l+(width-pad.l-pad.r)*(pts.length===1?.5:i/(pts.length-1)),y:pad.t+(hi-v)/(hi-lo)*(height-pad.t-pad.b)}));ctx.strokeStyle='#6ee7b7';ctx.lineWidth=2.5;ctx.beginPath();xy.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.fillStyle='#6ee7b7';xy.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,3.8,0,Math.PI*2);ctx.fill();});ctx.fillStyle='#a7b4cb';ctx.fillText('1',pad.l,height-7);ctx.fillText(String(pts.length),width-pad.r-13,height-7);}
function updateProp(idx,prop,value){const {entry}=activeInfo();const s=entry.sets[idx];if(!s)return;if(prop.startsWith('drop.')){if(!s.drop)s.drop={reps:0,kg:0};s.drop[prop.split('.')[1]]=num(value);}else if(['reps','kg','assistance'].includes(prop))s[prop]=Math.max(0,num(value));else s[prop]=value;save();}
function finish(){const d=db.draft;if(!d)return;const completed=d.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);if(!completed){toast('Bitte mindestens einen Satz erfassen.');return;}if(!confirm(`Einheit mit ${completed} erfassten Sätzen abschließen?`))return;db.sessions.push({...d,id:String(Date.now()),finished:new Date().toISOString()});db.draft=null;timerStop();save();tab='stats';render();toast('Einheit gespeichert!');}
function backup(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mein-training-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);toast('Backup-Datei erstellt');}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,v=b.dataset.value;switch(a){case'tab':tab=v;render();break;case'home':tab='home';render();break;case'stats':tab='stats';render();break;case'day':selectedDay=v;render();break;case'start':start();break;case'resume':tab='train';render();break;case'exercise':currentExercise=num(v);render();break;case'prev':currentExercise=Math.max(0,currentExercise-1);render();break;case'next':if(currentExercise<db.draft.exercises.length-1){currentExercise++;render();}else finish();break;case'addset':{const {entry,ex}=activeInfo();entry.sets.push(newSet(ex,entry.sets.length));save();render();break;}case'removeset':{const {entry}=activeInfo();if(entry.sets.length===1){toast('Mindestens ein Satz bleibt erhalten.');break;}if(!confirm('Diesen Satz entfernen?'))break;entry.sets.splice(num(v),1);save();render();break;}case'toggle':{const {entry,ex}=activeInfo(),s=entry.sets[num(v)];s.done=!s.done;save();if(s.done && entry.sets.some(x=>!x.done))timerStart(ex.rest);else render();break;}case'drop':{const {entry}=activeInfo(),s=entry.sets[num(v)];s.drop=s.drop?null:{reps:0,kg:0};save();render();break;}case'rest':timerStart(activeInfo().ex.rest);break;case'timer-stop':timerStop();break;case'timer-minus':case'timer-plus':{const diff=a==='timer-plus'?15:-15;if(timer.paused)timer.remaining=Math.max(0,timer.remaining+diff);else timer.end+=diff*1000;render();break;}case'timer-pause':if(timer.paused){timer.paused=false;timer.end=Date.now()+timer.remaining*1000;}else{timer.remaining=Math.max(0,Math.ceil((timer.end-Date.now())/1000));timer.paused=true;}render();break;case'finish':finish();break;case'discard':if(confirm('Laufende Einheit unwiderruflich verwerfen?')){db.draft=null;save();timerStop();tab='home';render();}break;case'savebands':{const bands=$('#bands').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,30);if(!bands.length){toast('Bitte mindestens ein Band eintragen.');break;}db.settings.bands=[...new Set(bands)];save();toast('Bänder gespeichert');break;}case'export':backup();break;case'coach-share':coachShare();break;case'coach-download':coachDownload();break;case'history':{const id=b.nextElementSibling?.value;const s=db.sessions.find(s=>s.id===id);if(s){alert(`${days[s.day]} · ${new Date(s.finished).toLocaleString('de-DE')}\n\n`+s.exercises.map(x=>{const ex=Object.values(db.plan).flat().find(e=>e.id===x.id);return `${ex?.name||x.id}: ${x.sets.filter(z=>z.done).map(z=>`${z.reps}×${z.kg}kg${z.band&&z.band!=='Ohne Unterstützung'?' ('+z.band+')':''}`).join(', ')}${x.pain!==''?' · Schmerz '+x.pain+'/10':''}${x.notes?' · '+x.notes:''}`;}).join('\n'));}break;}}});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset.set!==undefined){updateProp(num(el.dataset.set),el.dataset.prop,el.value);if(el.dataset.prop==='band')render();}else if(el.dataset.field){activeInfo().entry[el.dataset.field]=el.value;save();}else if(el.dataset.rest){const ex=Object.values(db.plan).flat().find(x=>x.id===el.dataset.rest);if(ex){ex.rest=Math.min(1800,Math.max(0,num(el.value)));save();}}else if(el.id==='care'){db.settings.care=el.checked;save();render();}else if(el.id==='chartExercise'){chartExercise=el.value;render();}else if(el.id==='chartMetric'){chartMetric=el.value;render();}else if(el.id==='importFile'&&el.files?.[0]){const file=el.files[0];file.text().then(t=>{try{const x=JSON.parse(t);if(!x||x.version!==1||!x.plan||!Array.isArray(x.sessions)||!x.settings)throw Error('Ungültiges Format');if(!confirm('Vorhandene lokale Daten durch dieses Backup ersetzen?'))return;db=x;currentExercise=0;save();tab='home';render();toast('Backup importiert');}catch(err){toast('Backup nicht lesbar oder ungültig.');}});}});
document.addEventListener('input',e=>{const el=e.target;if(el.dataset.set!==undefined)updateProp(num(el.dataset.set),el.dataset.prop,el.value);else if(el.dataset.field){activeInfo().entry[el.dataset.field]=el.value;save();}});
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
