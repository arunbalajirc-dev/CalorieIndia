import { MealPlan, DayMeal, MealFood } from './planner.ts'

const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

// ─── helpers ────────────────────────────────────────────────────────────────

function bmiInfo(bmi: number): { cat: string; color: string; pct: number } {
  if (bmi < 18.5) return { cat: 'Underweight', color: '#3B82F6', pct: 5 }
  if (bmi < 23)   return { cat: 'Healthy',     color: '#22C55E', pct: 30 }
  if (bmi < 25)   return { cat: 'Overweight',  color: '#EAB308', pct: 60 }
  if (bmi < 30)   return { cat: 'Obese I',     color: '#F97316', pct: 75 }
  return               { cat: 'Obese II',     color: '#EF4444', pct: 91 }
}

function activityLabel(level: string): string {
  const map: Record<string,string> = {
    sedentary:         'Sedentary (desk job)',
    lightly_active:    'Lightly Active',
    moderately_active: 'Moderately Active',
    very_active:       'Very Active',
    extra_active:      'Extra Active',
  }
  return map[level] ?? level
}

function activityMultiplier(level: string): number {
  const map: Record<string,number> = {
    sedentary: 1.2, lightly_active: 1.375,
    moderately_active: 1.55, very_active: 1.725, extra_active: 1.9,
  }
  return map[level] ?? 1.375
}

function macroBar(protein: number, carbs: number, fat: number): string {
  const total = protein * 4 + carbs * 4 + fat * 9
  if (total === 0) return ''
  const pPct = Math.round(protein * 4 / total * 100)
  const cPct = Math.round(carbs  * 4 / total * 100)
  const fPct = 100 - pPct - cPct
  return `
    <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin:4px 0;">
      <div style="width:${pPct}%;background:#22C55E;"></div>
      <div style="width:${cPct}%;background:#F97316;"></div>
      <div style="width:${fPct}%;background:#A855F7;"></div>
    </div>
    <div style="display:flex;gap:12px;font-size:9px;color:#7A8C82;">
      <span>Protein ${pPct}%</span><span>Carbs ${cPct}%</span><span>Fat ${fPct}%</span>
    </div>`
}

function foodRow(food: MealFood): string {
  const total = food.protein_g * 4 + food.carbs_g * 4 + food.fat_g * 9 || 1
  const pPct = Math.round(food.protein_g * 4 / total * 100)
  const cPct = Math.round(food.carbs_g   * 4 / total * 100)
  const fPct = 100 - pPct - cPct
  return `
    <tr style="border-bottom:1px solid rgba(255,255,255,.032);">
      <td style="padding:5px 7px;font-size:9.5px;color:#F1F5F2;">${food.name}</td>
      <td style="padding:5px 7px;font-size:9px;text-align:center;font-family:'DM Mono',monospace;color:#7A8C82;">${food.scaled_grams}${food.serving_unit}</td>
      <td style="padding:5px 7px;text-align:center;">
        <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-family:'DM Mono',monospace;font-size:9px;font-weight:700;background:#F9731622;color:#F97316;border:1px solid #F9731644;">${food.calories}</span>
      </td>
      <td style="padding:5px 7px;font-size:9px;text-align:center;font-family:'DM Mono',monospace;color:#22C55E;">${food.protein_g}g</td>
      <td style="padding:5px 7px;font-size:9px;text-align:center;font-family:'DM Mono',monospace;color:#F97316;">${food.carbs_g}g</td>
      <td style="padding:5px 7px;font-size:9px;text-align:center;font-family:'DM Mono',monospace;color:#A855F7;">${food.fat_g}g</td>
      <td style="padding:5px 7px;text-align:center;">
        <div style="display:flex;flex-direction:column;gap:2px;width:52px;">
          <div style="display:flex;align-items:center;gap:3px;">
            <span style="font-size:7px;color:#7A8C82;width:10px;text-align:right;">P</span>
            <div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;">
              <div style="width:${pPct}%;height:100%;background:#22C55E;border-radius:99px;"></div></div></div>
          <div style="display:flex;align-items:center;gap:3px;">
            <span style="font-size:7px;color:#7A8C82;width:10px;text-align:right;">C</span>
            <div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;">
              <div style="width:${cPct}%;height:100%;background:#F97316;border-radius:99px;"></div></div></div>
          <div style="display:flex;align-items:center;gap:3px;">
            <span style="font-size:7px;color:#7A8C82;width:10px;text-align:right;">F</span>
            <div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;">
              <div style="width:${fPct}%;height:100%;background:#A855F7;border-radius:99px;"></div></div></div>
        </div>
      </td>
    </tr>`
}

function mealTable(label: string, emoji: string, foods: MealFood[], color: string): string {
  if (!foods.length) return ''
  const totalCals = foods.reduce((s, f) => s + f.calories, 0)
  return `
    <div style="margin-bottom:14px;">
      <div style="font-size:11px;font-weight:700;color:${color};margin-bottom:6px;padding:5px 10px;background:${color}18;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
        <span>${emoji} ${label}</span>
        <span style="font-family:'DM Mono',monospace;font-size:10px;">${totalCals} kcal</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#1C1F1D;">
            <th style="padding:4px 7px;font-size:8px;text-align:left;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Food</th>
            <th style="padding:4px 7px;font-size:8px;text-align:center;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Amount</th>
            <th style="padding:4px 7px;font-size:8px;text-align:center;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">kcal</th>
            <th style="padding:4px 7px;font-size:8px;text-align:center;color:#22C55E;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Protein</th>
            <th style="padding:4px 7px;font-size:8px;text-align:center;color:#F97316;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Carbs</th>
            <th style="padding:4px 7px;font-size:8px;text-align:center;color:#A855F7;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Fat</th>
            <th style="padding:4px 7px;font-size:8px;text-align:center;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Macros</th>
          </tr>
        </thead>
        <tbody>${foods.map(foodRow).join('')}</tbody>
      </table>
    </div>`
}

// ─── shared layout pieces ────────────────────────────────────────────────────

const NOISE = `<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:.022;pointer-events:none;z-index:0" xmlns="http://www.w3.org/2000/svg">
  <filter id="nf"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>
  <rect width="100%" height="100%" filter="url(#nf)"/>
</svg>`

function header(tag: string, date: string, dotColor = 'linear-gradient(135deg,#F97316,#22C55E)'): string {
  return `
  <div style="position:relative;z-index:1;flex-shrink:0;padding:14px 28px 12px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:9px;height:9px;border-radius:50%;background:${dotColor};"></div>
      <span style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#fff;">Nutrition Tracker</span>
    </div>
    <div style="display:flex;align-items:center;gap:11px;">
      <span style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#7A8C82;padding:3px 10px;border:1px solid rgba(255,255,255,.08);border-radius:99px;">${tag}</span>
      <span style="font-family:'DM Mono',monospace;font-size:10px;color:#7A8C82;">${date}</span>
    </div>
  </div>`
}

function footer(note: string, pageNum: string): string {
  return `
  <div style="position:relative;z-index:1;flex-shrink:0;padding:9px 28px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:8.5px;color:#7A8C82;opacity:.7;">${note}</span>
    <span style="font-family:'DM Mono',monospace;font-size:9px;color:#7A8C82;">${pageNum}</span>
  </div>`
}

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  :root{
    --orange:#F97316;--orange2:#FB923C;
    --green:#22C55E;--green2:#4ADE80;
    --blue:#3B82F6;--purple:#A855F7;
    --yellow:#EAB308;--red:#EF4444;--cyan:#06B6D4;
    --bg:#0D0F0E;--bg2:#131614;--bg3:#1C1F1D;
    --border:rgba(255,255,255,.08);
    --text:#F1F5F2;--muted:#7A8C82;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#0a0b0a;color:#F1F5F2;}
  .page{
    width:210mm;min-height:297mm;background:#0D0F0E;
    position:relative;overflow:hidden;
    display:flex;flex-direction:column;
    page-break-after:always;
  }
  @page{size:A4;margin:0;}
  @media print{body{background:#0D0F0E;}.page{page-break-after:always;}}
`

// ─── PAGE 1 — Health Snapshot ────────────────────────────────────────────────

function page1(plan: MealPlan, intakeData: any): string {
  const { weight_kg, height_cm, age, gender, activity_level, target_calories } = intakeData
  const hm = height_cm / 100
  const bmi = +(weight_kg / (hm * hm)).toFixed(1)
  const B = bmiInfo(bmi)
  const bmr = gender === 'male'
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  const tdee  = Math.round(bmr * activityMultiplier(activity_level))
  const deficit = plan.goal === 'lose' ? 500 : plan.goal === 'gain' ? -300 : 0
  const toChange = +(weight_kg - (intakeData.target_weight ?? weight_kg)).toFixed(1)
  const losing  = toChange > 0
  const weeksTotal = deficit !== 0
    ? Math.round((Math.abs(toChange) * 7700) / (Math.abs(deficit) * 7))
    : 0
  const months = Math.round(weeksTotal / 4.33)

  // timeline SVG points
  const W = 550, H = 135, PAD = { l: 38, r: 24, t: 14, b: 26 }
  const cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b
  const targetWeight = intakeData.target_weight ?? weight_kg
  const wMin = Math.min(targetWeight - 2, weight_kg - 2)
  const wMax = weight_kg + 3
  const xOf = (m: number) => PAD.l + (m / (months || 1)) * cw
  const yOf = (w: number) => PAD.t + ch - ((w - wMin) / (wMax - wMin)) * ch

  let svgH = ''
  for (let i = 0; i <= 4; i++) {
    const gw = wMin + ((wMax - wMin) / 4) * i, gy = yOf(gw)
    svgH += `<line x1="${PAD.l}" y1="${gy.toFixed(1)}" x2="${W - PAD.r}" y2="${gy.toFixed(1)}" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`
    svgH += `<text x="${PAD.l - 4}" y="${(gy + 3.5).toFixed(1)}" text-anchor="end" font-size="7" fill="rgba(255,255,255,.25)" font-family="DM Mono,monospace">${gw.toFixed(0)}</text>`
  }
  const pts = []
  for (let s = 0; s <= 60; s++) {
    const t = s / 60, sw = 1 / (1 + Math.exp(-8 * (t - 0.5)))
    pts.push({ x: xOf(months * t), y: yOf(weight_kg + (targetWeight - weight_kg) * sw) })
  }
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], mx = ((a.x + b.x) / 2).toFixed(1)
    d += ` C ${mx} ${a.y.toFixed(1)}, ${mx} ${b.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
  }
  const lp = pts[pts.length - 1]
  const area = d + ` L ${lp.x.toFixed(1)} ${(PAD.t + ch).toFixed(1)} L ${PAD.l} ${(PAD.t + ch).toFixed(1)} Z`
  const mp = Math.min(7, months)
  for (let m = 0; m <= mp; m++) {
    svgH += `<text x="${xOf(months * m / (mp || 1)).toFixed(1)}" y="${H - 3}" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,.3)" font-family="DM Sans,sans-serif">M${m}</text>`
  }
  const gy2 = yOf(targetWeight)
  svgH += `<line x1="${PAD.l}" y1="${gy2.toFixed(1)}" x2="${W - PAD.r}" y2="${gy2.toFixed(1)}" stroke="#22C55E" stroke-width="1" stroke-dasharray="4,3" opacity=".45"/>`
  svgH += `<text x="${W - PAD.r + 2}" y="${(gy2 + 3).toFixed(1)}" font-size="7" fill="#4ADE80" font-family="DM Mono,monospace">Goal</text>`
  const milestones = [
    { mo: 0, w: weight_kg },
    { mo: 1, w: +(weight_kg - (losing ? 2 : -0.8)).toFixed(1) },
    { mo: Math.round(months * 0.5), w: +(weight_kg + (targetWeight - weight_kg) * 0.5).toFixed(1) },
    { mo: months, w: targetWeight }
  ]
  let mk = ''
  milestones.forEach(cp => {
    const x = xOf(cp.mo).toFixed(1), y = yOf(cp.w).toFixed(1)
    const isGoal = cp.mo === months
    mk += `<circle cx="${x}" cy="${y}" r="4" fill="${isGoal ? '#22C55E' : '#F97316'}" stroke="#0D0F0E" stroke-width="2"/>`
    mk += `<text x="${x}" y="${+y - 7}" text-anchor="middle" font-size="8" fill="${isGoal ? '#4ADE80' : '#FB923C'}" font-family="DM Sans,sans-serif" font-weight="600">${cp.w}kg</text>`
  })

  const svgContent = `<defs>
    <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F97316" stop-opacity=".18"/><stop offset="100%" stop-color="#F97316" stop-opacity="0"/></linearGradient>
    <linearGradient id="lG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#F97316"/><stop offset="100%" stop-color="#22C55E"/></linearGradient>
  </defs>${svgH}<path d="${area}" fill="url(#aG)"/><path d="${d}" fill="none" stroke="url(#lG)" stroke-width="2.5" stroke-linecap="round"/>${mk}`

  const calMax = tdee * 1.1
  const tCalPct = Math.min(100, target_calories / calMax * 100)
  const tdePct  = Math.min(100, tdee / calMax * 100)
  const defPct  = Math.min(100, Math.abs(deficit) / tdee * 100 * 4)

  return `
  <div class="page">
    ${NOISE}
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 60% 40% at 85% 10%,rgba(249,115,22,.07) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 10% 80%,rgba(34,197,94,.05) 0%,transparent 50%);"></div>

    ${header('Health Status Report', plan.generated_date)}

    <!-- HERO -->
    <div style="position:relative;z-index:1;flex-shrink:0;padding:20px 28px 0;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start;">
      <div>
        <h1 style="font-family:'Playfair Display',serif;font-size:26px;font-weight:900;line-height:1.1;margin-bottom:6px;">
          Your Current <em style="font-style:italic;background:linear-gradient(90deg,#F97316,#FB923C);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Health Snapshot</em>
        </h1>
        <p style="font-size:11px;color:#7A8C82;">Personalised for Indian metabolic standards · IFCT 2017 data</p>
      </div>
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px 18px;text-align:center;min-width:120px;">
        <span style="font-family:'Playfair Display',serif;font-size:36px;font-weight:900;line-height:1;display:block;color:${B.color};">${bmi}</span>
        <span style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#7A8C82;margin-top:3px;display:block;">BMI Score</span>
        <span style="margin-top:8px;padding:4px 12px;border-radius:99px;font-size:10px;font-weight:600;display:inline-block;background:${B.color}22;color:${B.color};border:1px solid ${B.color}55;">${B.cat}</span>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div style="position:relative;z-index:1;flex:1;padding:14px 28px;display:grid;grid-template-columns:1fr 1fr;gap:12px;align-content:start;">

      <!-- PROFILE CARD -->
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#F97316,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:11px;font-weight:600;">Your Profile</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:#1C1F1D;border-radius:10px;padding:10px 12px;">
            <span style="font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:#fff;line-height:1;display:block;">${weight_kg} kg</span>
            <span style="font-size:10px;color:#7A8C82;margin-top:3px;display:block;">Current Weight</span>
          </div>
          <div style="background:#1C1F1D;border-radius:10px;padding:10px 12px;">
            <span style="font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:#fff;line-height:1;display:block;">${height_cm} cm</span>
            <span style="font-size:10px;color:#7A8C82;margin-top:3px;display:block;">Height</span>
          </div>
          <div style="background:#1C1F1D;border-radius:10px;padding:10px 12px;">
            <span style="font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:#fff;line-height:1;display:block;">${age} yrs</span>
            <span style="font-size:10px;color:#7A8C82;margin-top:3px;display:block;">Age</span>
          </div>
          <div style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.22);border-radius:10px;padding:10px 12px;">
            <span style="font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:#FB923C;line-height:1;display:block;">${targetWeight} kg</span>
            <span style="font-size:10px;color:#7A8C82;margin-top:3px;display:block;">Target Weight</span>
          </div>
          <div style="background:#1C1F1D;border-radius:10px;padding:10px 12px;grid-column:1/-1;">
            <span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:500;color:#fff;line-height:1;display:block;">${losing ? '−' : '+'} ${Math.abs(toChange)} kg to ${losing ? 'lose' : 'gain'}</span>
            <span style="font-size:10px;color:#7A8C82;margin-top:3px;display:block;">Weight Change Goal · ~${months || '?'} months</span>
          </div>
        </div>
      </div>

      <!-- BMI + CALORIC CARD -->
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#22C55E,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:10px;font-weight:600;">BMI Scale — Asian Standard</div>
        <div style="height:10px;border-radius:99px;position:relative;margin-bottom:8px;background:linear-gradient(90deg,#3B82F6 0%,#22C55E 20%,#22C55E 40%,#EAB308 55%,#F97316 70%,#EF4444 85%,#7C3AED 100%);">
          <div style="position:absolute;top:-4px;width:18px;height:18px;background:#fff;border-radius:50%;border:3px solid #0D0F0E;box-shadow:0 0 0 2px ${B.color};transform:translateX(-50%);left:${B.pct}%;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:8px;color:#3B82F6;text-align:center;">Under<br>&lt;18.5</span>
          <span style="font-size:8px;color:#22C55E;text-align:center;">Normal<br>18.5–22.9</span>
          <span style="font-size:8px;color:#EAB308;text-align:center;">Over<br>23–24.9</span>
          <span style="font-size:8px;color:#F97316;text-align:center;">Obese I<br>25–29.9</span>
          <span style="font-size:8px;color:#EF4444;text-align:center;">Obese II<br>≥30</span>
        </div>
        ${[
          { label: 'TDEE', val: `${tdee} kcal`, pct: tdePct, color: '#F97316' },
          { label: 'Target / Day', val: `${target_calories} kcal`, pct: tCalPct, color: '#22C55E' },
          { label: 'Deficit / Day', val: `${Math.abs(deficit)} kcal`, pct: defPct, color: '#A855F7' },
        ].map(row => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:10px;color:#7A8C82;width:76px;flex-shrink:0;">${row.label}</span>
            <div style="flex:1;height:8px;background:#1C1F1D;border-radius:99px;overflow:hidden;">
              <div style="width:${row.pct}%;height:100%;background:${row.color};border-radius:99px;"></div>
            </div>
            <span style="font-family:'DM Mono',monospace;font-size:10px;color:#F1F5F2;width:60px;text-align:right;">${row.val}</span>
          </div>`).join('')}
      </div>

      <!-- TIMELINE CARD — full width -->
      <div style="grid-column:1/-1;background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#22C55E,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:6px;font-weight:600;">Projected Weight Timeline</div>
        <svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="display:block;height:130px;">${svgContent}</svg>
      </div>

    </div>

    ${footer('⚕ For informational purposes only. Consult a registered dietitian for personalised medical advice.', 'Page 1 of 9')}
  </div>`
}

// ─── PAGE 2 — Macros & Roadmap ───────────────────────────────────────────────

function page2(plan: MealPlan, intakeData: any): string {
  const { weight_kg, height_cm, age, gender, activity_level, target_calories } = intakeData
  const bmr = gender === 'male'
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  const tdee = Math.round(bmr * activityMultiplier(activity_level))
  const deficit = plan.goal === 'lose' ? 500 : plan.goal === 'gain' ? -300 : 0
  const toChange = Math.abs(+(weight_kg - (intakeData.target_weight ?? weight_kg)).toFixed(1))
  const weeksTotal = deficit !== 0 ? Math.round((toChange * 7700) / (Math.abs(deficit) * 7)) : 12
  const ph = Math.round(weeksTotal / 3)

  const protG = plan.protein_target
  const fatG  = plan.fat_target
  const carbG = plan.carbs_target
  const tCal  = target_calories

  // Donut SVG
  const macros = [
    { name: 'Protein',       g: protG, pct: Math.round(protG * 4 / tCal * 100), color: '#22C55E' },
    { name: 'Carbohydrates', g: carbG, pct: Math.round(carbG * 4 / tCal * 100), color: '#F97316' },
    { name: 'Fats',          g: fatG,  pct: Math.round(fatG * 9 / tCal * 100),  color: '#A855F7' },
  ]
  const CX = 45, CY = 45, R = 36, STR = 10, circ = 2 * Math.PI * R
  let off = 0
  let dpaths = `<circle cx="45" cy="45" r="36" fill="none" stroke="#1C1F1D" stroke-width="10"/>`
  macros.forEach(m => {
    const dash = (m.pct / 100) * circ, gap = circ - dash
    const rotate = (off / 100) * 360 - 90
    dpaths += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${m.color}" stroke-width="${STR}" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" transform="rotate(${rotate.toFixed(1)} ${CX} ${CY})"/>`
    off += m.pct
  })

  // Roadmap phases
  const phases = [
    { num: '01', icon: '🔥', name: 'Ignition',      weeks: `Wk 1–${ph}`,              desc: 'Establish calorie deficit, learn portion sizes, build daily tracking habit',    color: '#F97316' },
    { num: '02', icon: '⚙️',  name: 'Adaptation',    weeks: `Wk ${ph + 1}–${ph * 2}`, desc: 'Introduce strength training, optimise protein intake, manage the plateau',     color: '#A855F7' },
    { num: '03', icon: '🏆', name: 'Consolidation', weeks: `Wk ${ph * 2 + 1}–${weeksTotal}`, desc: 'Reach target weight, shift to maintenance calories, lock in new habits', color: '#22C55E' },
  ]

  // Nutrient scores
  const hm = height_cm / 100
  const bmi = weight_kg / (hm * hm)
  const nutrients = [
    { name: 'Protein Adequacy', score: Math.min(100, Math.round(protG / weight_kg * 62.5)), color: '#22C55E' },
    { name: 'Iron',             score: bmi > 25 ? 52 : 74, color: '#EF4444' },
    { name: 'Fibre',            score: bmi > 27 ? 44 : 68, color: '#F97316' },
    { name: 'Vitamin D',        score: 38,                  color: '#EAB308' },
    { name: 'Calcium',          score: 62,                  color: '#3B82F6' },
    { name: 'Vitamin B12',      score: 54,                  color: '#A855F7' },
  ]

  // Radar SVG
  const n = nutrients.length, CX2 = 95, CY2 = 80, MR = 60
  let rh = ''
  ;[0.25, 0.5, 0.75, 1].forEach(r => {
    let pts = ''
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      pts += `${(CX2 + Math.cos(a) * MR * r).toFixed(1)},${(CY2 + Math.sin(a) * MR * r).toFixed(1)} `
    }
    rh += `<polygon points="${pts.trim()}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/>`
  })
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    rh += `<line x1="${CX2}" y1="${CY2}" x2="${(CX2 + Math.cos(a) * MR).toFixed(1)}" y2="${(CY2 + Math.sin(a) * MR).toFixed(1)}" stroke="rgba(255,255,255,.07)" stroke-width="1"/>`
  }
  let dpts = ''
  nutrients.forEach((nu, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const r2 = MR * (nu.score / 100)
    dpts += `${(CX2 + Math.cos(a) * r2).toFixed(1)},${(CY2 + Math.sin(a) * r2).toFixed(1)} `
  })
  rh += `<polygon points="${dpts.trim()}" fill="rgba(168,85,247,.15)" stroke="#A855F7" stroke-width="1.5"/>`
  nutrients.forEach((nu, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const r2 = MR * (nu.score / 100)
    const lx = (CX2 + Math.cos(a) * (MR + 14)).toFixed(1)
    const ly = (CY2 + Math.sin(a) * (MR + 14)).toFixed(1)
    rh += `<circle cx="${(CX2 + Math.cos(a) * r2).toFixed(1)}" cy="${(CY2 + Math.sin(a) * r2).toFixed(1)}" r="3" fill="${nu.color}"/>`
    rh += `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.45)" font-family="DM Sans,sans-serif">${nu.name.split(' ')[0]}</text>`
  })

  return `
  <div class="page">
    ${NOISE}
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 50% 35% at 90% 5%,rgba(168,85,247,.06) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 5% 85%,rgba(34,197,94,.05) 0%,transparent 50%);"></div>
    ${header('Your Fitness Journey', plan.generated_date)}

    <div style="position:relative;z-index:1;flex-shrink:0;padding:14px 28px 0;">
      <h2 style="font-family:'Playfair Display',serif;font-size:21px;font-weight:900;line-height:1.15;margin-bottom:4px;">
        Our <em style="font-style:italic;background:linear-gradient(90deg,#A855F7,#C084FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Approach</em> to Your Transformation
      </h2>
      <p style="font-size:11px;color:#7A8C82;">Macro targets, energy model &amp; 3-phase roadmap — powered by IFCT 2017 &amp; Nutrition Tracker database</p>
    </div>

    <div style="position:relative;z-index:1;flex:1;padding:12px 28px;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-content:start;">

      <!-- MACRO CARD -->
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#A855F7,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:10px;font-weight:600;">Daily Macro Targets</div>
        <div style="display:grid;grid-template-columns:90px 1fr;gap:13px;align-items:center;">
          <div style="position:relative;width:90px;height:90px;">
            <svg width="90" height="90" viewBox="0 0 90 90">${dpaths}</svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <span style="font-family:'DM Mono',monospace;font-size:17px;font-weight:500;color:#fff;line-height:1;">${tCal}</span>
              <span style="font-size:7.5px;color:#7A8C82;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;">kcal/day</span>
            </div>
          </div>
          <div>
            ${macros.map(m => `
            <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;">
              <div style="width:8px;height:8px;border-radius:2px;background:${m.color};flex-shrink:0;"></div>
              <div style="flex:1;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="font-size:11px;color:#F1F5F2;font-weight:500;">${m.name}</span>
                  <span style="font-family:'DM Mono',monospace;font-size:10px;color:#7A8C82;">${m.g}g · ${m.pct}%</span>
                </div>
                <div style="height:5px;background:#1C1F1D;border-radius:99px;overflow:hidden;">
                  <div style="width:${m.pct}%;height:100%;background:${m.color};border-radius:99px;"></div>
                </div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- ENERGY CARD -->
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#F97316,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:10px;font-weight:600;">Energy Foundation</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:10px;">
          <div style="background:#1C1F1D;border-radius:10px;padding:11px 12px;">
            <span style="font-family:'DM Mono',monospace;font-size:21px;font-weight:500;display:block;line-height:1;margin-bottom:3px;color:#FB923C;">${tdee}</span>
            <span style="font-size:10px;color:#7A8C82;display:block;">TDEE kcal/day</span>
          </div>
          <div style="background:#1C1F1D;border-radius:10px;padding:11px 12px;">
            <span style="font-family:'DM Mono',monospace;font-size:21px;font-weight:500;display:block;line-height:1;margin-bottom:3px;color:#3B82F6;">${Math.round(bmr)}</span>
            <span style="font-size:10px;color:#7A8C82;display:block;">BMR kcal/day</span>
          </div>
        </div>
        <div style="font-size:10px;color:#7A8C82;line-height:1.55;background:#1C1F1D;border-radius:9px;padding:9px 11px;">
          <strong style="color:#F1F5F2;">TDEE</strong> is total calories burned daily including activity.<br>
          <strong style="color:#F1F5F2;">BMR</strong> is the minimum energy your body needs at rest. Eating below BMR triggers muscle loss.
        </div>
      </div>

      <!-- ROADMAP — full width -->
      <div style="grid-column:1/-1;background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#22C55E,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:11px;font-weight:600;">Your 3-Phase Fitness Roadmap</div>
        <div style="display:flex;gap:0;position:relative;">
          <div style="position:absolute;top:18px;left:18px;right:18px;height:2px;background:linear-gradient(90deg,#F97316,#A855F7,#22C55E);z-index:0;"></div>
          ${phases.map(p => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;z-index:1;">
            <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;background:${p.color}22;border:2px solid ${p.color}55;margin-bottom:6px;">${p.icon}</div>
            <span style="font-family:'DM Mono',monospace;font-size:8px;color:#7A8C82;margin-bottom:2px;">${p.num}</span>
            <span style="font-size:10.5px;font-weight:600;margin-bottom:2px;color:${p.color};">${p.name}</span>
            <span style="font-size:8px;color:#7A8C82;">${p.weeks}</span>
            <span style="font-size:8.5px;color:#7A8C82;margin-top:4px;line-height:1.35;padding:0 4px;">${p.desc}</span>
          </div>`).join('')}
        </div>
      </div>

      <!-- NUTRIENTS — full width -->
      <div style="grid-column:1/-1;background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#3B82F6,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:10px;font-weight:600;">Micro-Nutrient Focus Areas — Adequacy Score</div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;">
          <div>
            ${nutrients.map(n => `
            <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px;">
              <span style="font-size:10px;color:#F1F5F2;width:130px;flex-shrink:0;">${n.name}</span>
              <div style="flex:1;height:8px;background:#1C1F1D;border-radius:99px;overflow:hidden;">
                <div style="width:${n.score}%;height:100%;background:${n.color};border-radius:99px;"></div>
              </div>
              <span style="font-family:'DM Mono',monospace;font-size:10px;color:${n.color};width:32px;text-align:right;">${n.score}%</span>
            </div>`).join('')}
          </div>
          <svg width="190" height="155" viewBox="0 0 190 155">${rh}</svg>
        </div>
      </div>

    </div>
    ${footer('⚕ Data sourced from IFCT 2017 · INDB · Nutrition Tracker recipe database (16,430 items)', 'Page 2 of 9')}
  </div>`
}

// ─── PAGE 3 — Calorie Burn Engine ────────────────────────────────────────────

function page3(plan: MealPlan, intakeData: any): string {
  const { weight_kg, age, height_cm, gender, activity_level } = intakeData
  const W = weight_kg
  const burn = (met: number, mins: number) => Math.round(met * W * (mins / 60))
  const bmr = gender === 'male'
    ? 10 * W + 6.25 * height_cm - 5 * age + 5
    : 10 * W + 6.25 * height_cm - 5 * age - 161
  const tdee = Math.round(bmr * activityMultiplier(activity_level))

  const exercises = [
    { name: 'Brisk Walk',      icon: '🚶', met: 4.3, color: '#22C55E', intensity: 'Moderate',  tip: 'Best starting point. 30 min daily builds the habit and burns significant calories.' },
    { name: 'Running',         icon: '🏃', met: 9.8, color: '#EF4444', intensity: 'High',      tip: 'Most efficient fat burner. Even 15 min of jogging makes a measurable difference.' },
    { name: 'Swimming',        icon: '🏊', met: 7.0, color: '#3B82F6', intensity: 'High',      tip: 'Full-body, joint-friendly. Ideal if overweight — less stress on knees.' },
    { name: 'Badminton',       icon: '🏸', met: 5.5, color: '#F97316', intensity: 'Moderate',  tip: 'Popular in India. Singles play burns significant calories at an active pace.' },
    { name: 'Cricket',         icon: '🏏', met: 4.8, color: '#A855F7', intensity: 'Moderate',  tip: 'Fielding + batting combined. Bowling adds short intensity bursts.' },
    { name: 'Weight Training', icon: '🏋', met: 5.0, color: '#EAB308', intensity: 'Moderate+', tip: 'Builds muscle which raises BMR by 50–80 kcal/day permanently.' },
  ]
  const durations = [15, 30, 60]
  const timeColors = ['#3B82F6', '#F97316', '#22C55E']

  const strip = [
    { v: Math.round(bmr),          l: 'BMR (Rest)' },
    { v: tdee,                     l: 'TDEE (Daily)' },
    { v: burn(exercises[0].met, 30), l: 'Walk 30 min' },
    { v: burn(exercises[1].met, 30), l: 'Run 30 min' },
    { v: burn(exercises[3].met, 30), l: 'Badminton 30 min' },
    { v: burn(exercises[5].met, 30), l: 'Weights 30 min' },
  ]

  // Chart SVG
  const VW = 700, VH = 195, PAD = { l: 36, r: 16, t: 14, b: 44 }
  const cw2 = VW - PAD.l - PAD.r, ch2 = VH - PAD.t - PAD.b
  const maxBurn = burn(exercises[1].met, 60) + 30
  const groupW = cw2 / exercises.length
  const barGap = 3
  const barW = (groupW - barGap * (durations.length + 1)) / durations.length

  let s = ''
  for (let i = 0; i <= 5; i++) {
    const val = Math.round(maxBurn / 5 * i), y = PAD.t + ch2 - (val / maxBurn) * ch2
    s += `<line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${VW - PAD.r}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`
    s += `<text x="${PAD.l - 4}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="7.5" fill="rgba(255,255,255,.25)" font-family="DM Mono,monospace">${val}</text>`
  }
  exercises.forEach((ex, gi) => {
    const gx = PAD.l + gi * groupW
    durations.forEach((dur, di) => {
      const cal = burn(ex.met, dur)
      const bh = (cal / maxBurn) * ch2
      const bx = gx + barGap + di * (barW + barGap)
      const by = PAD.t + ch2 - bh
      s += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${timeColors[di]}" opacity="0.85"/>`
      if (bh > 14) s += `<text x="${(bx + barW / 2).toFixed(1)}" y="${(by - 3).toFixed(1)}" text-anchor="middle" font-size="7" fill="rgba(255,255,255,.7)" font-family="DM Mono,monospace">${cal}</text>`
    })
    const lx = (gx + groupW / 2).toFixed(1)
    s += `<text x="${lx}" y="${VH - 28}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,.55)" font-family="DM Sans,sans-serif">${ex.icon}</text>`
    const words = ex.name.split(' ')
    if (words.length > 1) {
      s += `<text x="${lx}" y="${VH - 15}" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,.35)" font-family="DM Sans,sans-serif">${words[0]}</text>`
      s += `<text x="${lx}" y="${VH - 5}" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,.35)" font-family="DM Sans,sans-serif">${words.slice(1).join(' ')}</text>`
    } else {
      s += `<text x="${lx}" y="${VH - 10}" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,.35)" font-family="DM Sans,sans-serif">${ex.name}</text>`
    }
  })
  durations.forEach((d, i) => {
    s += `<rect x="${PAD.l + i * 68}" y="${VH - 1}" width="10" height="6" rx="2" fill="${timeColors[i]}" opacity=".85"/>`
    s += `<text x="${PAD.l + i * 68 + 13}" y="${VH + 4}" font-size="8" fill="rgba(255,255,255,.45)" font-family="DM Sans,sans-serif">${d} min</text>`
  })

  const maxBurn60 = burn(exercises[1].met, 60)

  return `
  <div class="page">
    ${NOISE}
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 55% 30% at 80% 5%,rgba(249,115,22,.07) 0%,transparent 60%),radial-gradient(ellipse 35% 25% at 5% 90%,rgba(59,130,246,.05) 0%,transparent 50%);"></div>
    ${header('Energy &amp; Burn Model', plan.generated_date)}

    <div style="position:relative;z-index:1;flex-shrink:0;padding:13px 28px 0;">
      <h2 style="font-family:'Playfair Display',serif;font-size:21px;font-weight:900;line-height:1.15;margin-bottom:3px;">
        Your <em style="font-style:italic;background:linear-gradient(90deg,#F97316,#EAB308);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Calorie Burn</em> Engine
      </h2>
      <p style="font-size:11px;color:#7A8C82;">Energy expenditure at current body weight · Walk · Run · Swim · Badminton · Cricket · Weight Training</p>
    </div>

    <!-- ENERGY STRIP -->
    <div style="position:relative;z-index:1;flex-shrink:0;padding:9px 28px;display:flex;gap:8px;">
      ${strip.map(st => `
      <div style="flex:1;background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:8px 10px;text-align:center;">
        <span style="font-family:'DM Mono',monospace;font-size:18px;font-weight:500;color:#fff;display:block;line-height:1;">${st.v}</span>
        <span style="font-size:8px;color:#7A8C82;margin-top:3px;display:block;text-transform:uppercase;letter-spacing:.05em;">${st.l}</span>
      </div>`).join('')}
    </div>

    <!-- BAR CHART -->
    <div style="position:relative;z-index:1;flex-shrink:0;padding:0 28px 9px;">
      <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;font-weight:600;margin-bottom:7px;">Calories Burned — All Activities Compared (15 / 30 / 60 min)</div>
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 13px 11px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#F97316,#EAB308,#22C55E);"></div>
        <svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" style="width:100%;display:block;">${s}</svg>
      </div>
    </div>

    <!-- EXERCISE GRID -->
    <div style="position:relative;z-index:1;flex:1;padding:0 28px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-content:start;">
      ${exercises.map(ex => {
        const burnRows = durations.map(dur => {
          const cal = burn(ex.met, dur)
          const pct = (cal / maxBurn60 * 100).toFixed(1)
          return `
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:9px;color:#7A8C82;width:30px;flex-shrink:0;">${dur} min</span>
            <div style="flex:1;height:7px;background:#1C1F1D;border-radius:99px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:${ex.color};border-radius:99px;"></div>
            </div>
            <span style="font-family:'DM Mono',monospace;font-size:9px;font-weight:500;width:42px;text-align:right;color:${ex.color};">${cal} kcal</span>
          </div>`
        }).join('')
        return `
        <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:11px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${ex.color},transparent);"></div>
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:8px;">
            <span style="font-size:17px;">${ex.icon}</span>
            <div>
              <div style="font-size:11px;font-weight:700;color:#F1F5F2;">${ex.name}</div>
              <div style="font-size:9px;color:#7A8C82;margin-top:1px;">MET ${ex.met} · <span style="background:${ex.color}22;color:${ex.color};border:1px solid ${ex.color}44;padding:1px 6px;border-radius:99px;font-size:8px;font-weight:600;">${ex.intensity}</span></div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;">${burnRows}</div>
          <div style="margin-top:6px;padding-top:5px;border-top:1px solid rgba(255,255,255,.08);font-size:9px;color:#7A8C82;line-height:1.35;">${ex.tip}</div>
        </div>`
      }).join('')}
    </div>

    ${footer('⚡ MET values from Compendium of Physical Activities (Ainsworth et al.) · Calories = MET x weight(kg) x hours', 'Page 3 of 9')}
  </div>`
}

// ─── PAGE 4 — 80/20 Method ───────────────────────────────────────────────────

function page4(plan: MealPlan, intakeData: any): string {
  const { weight_kg, height_cm, age, gender, activity_level, target_calories } = intakeData
  const bmr = gender === 'male'
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  const tdee      = Math.round(bmr * activityMultiplier(activity_level))
  const totalDef  = plan.goal === 'lose' ? 500 : plan.goal === 'gain' ? -300 : 0
  const dietDef   = Math.round(totalDef * 0.8)
  const exerDef   = Math.round(totalDef * 0.2)
  const toChange  = Math.abs(+(weight_kg - (intakeData.target_weight ?? weight_kg)).toFixed(1))
  const weeksTotal = totalDef !== 0 ? Math.round((toChange * 7700) / (Math.abs(totalDef) * 7)) : 12
  const months    = Math.round(weeksTotal / 4.33)

  const mealSlots = [
    { meal: 'Breakfast',   pct: 0.25, icon: '☀️' },
    { meal: 'Mid-Morning', pct: 0.10, icon: '🍎' },
    { meal: 'Lunch',       pct: 0.35, icon: '🍱' },
    { meal: 'Evening',     pct: 0.10, icon: '🌿' },
    { meal: 'Dinner',      pct: 0.20, icon: '🌙' },
  ]
  const exerciseSuggestions = [
    { icon: '🚶', name: 'Brisk Walk', met: 4.3 },
    { icon: '🏃', name: 'Light Jog',  met: 7.0 },
    { icon: '🏸', name: 'Badminton',  met: 5.5 },
    { icon: '🏋', name: 'Weights',    met: 5.0 },
    { icon: '🏊', name: 'Swimming',   met: 7.0 },
  ]
  const mealGuide = [
    { icon: '☀️', meal: 'Breakfast', page: 6, pct: 0.25, color: '#F97316', bg: 'rgba(249,115,22,.12)', bd: 'rgba(249,115,22,.3)' },
    { icon: '🍱', meal: 'Lunch',     page: 7, pct: 0.35, color: '#22C55E', bg: 'rgba(34,197,94,.12)',  bd: 'rgba(34,197,94,.3)'  },
    { icon: '🍎', meal: 'Snacks',    page: 8, pct: 0.20, color: '#3B82F6', bg: 'rgba(59,130,246,.12)', bd: 'rgba(59,130,246,.3)' },
    { icon: '🌙', meal: 'Dinner',    page: 9, pct: 0.20, color: '#A855F7', bg: 'rgba(168,85,247,.12)', bd: 'rgba(168,85,247,.3)' },
  ]

  return `
  <div class="page">
    ${NOISE}
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 55% 35% at 88% 6%,rgba(34,197,94,.06) 0%,transparent 60%),radial-gradient(ellipse 40% 28% at 6% 88%,rgba(249,115,22,.05) 0%,transparent 55%);"></div>
    ${header('The 80 / 20 Method', plan.generated_date)}

    <div style="position:relative;z-index:1;flex-shrink:0;padding:13px 28px 0;">
      <h2 style="font-family:'Playfair Display',serif;font-size:21px;font-weight:900;line-height:1.15;margin-bottom:3px;">
        The <em style="font-style:italic;background:linear-gradient(90deg,#22C55E,#4ADE80);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">80 / 20</em> Calorie Approach
      </h2>
      <p style="font-size:11px;color:#7A8C82;">80% through food choices · 20% through movement — sustainable, no crash diets, no extreme workouts</p>
    </div>

    <div style="position:relative;z-index:1;flex:1;padding:11px 28px;display:flex;flex-direction:column;gap:10px;">

      <!-- 80/20 VISUAL -->
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;position:relative;overflow:hidden;flex-shrink:0;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#22C55E,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:10px;font-weight:600;">The Core Philosophy</div>
        <div style="display:flex;gap:0;height:42px;border-radius:10px;overflow:hidden;margin-bottom:11px;">
          <div style="flex:8;background:linear-gradient(135deg,#166534,#22C55E);display:flex;align-items:center;justify-content:center;gap:8px;">
            <span style="font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:#fff;">80%</span>
            <span style="font-size:10px;color:rgba(255,255,255,.75);font-weight:500;">Diet &amp; Food Choices</span>
          </div>
          <div style="flex:2;background:linear-gradient(135deg,#7C2D12,#F97316);display:flex;align-items:center;justify-content:center;">
            <span style="font-family:'Playfair Display',serif;font-size:15px;font-weight:900;color:#fff;">20%</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${[
            { dot: '#22C55E', title: '80% — What You Eat', body: 'Your calorie deficit is driven primarily by food — what you pick, how much, and when. This is the controllable lever.' },
            { dot: '#F97316', title: '20% — How You Move', body: 'Exercise accelerates results and builds muscle, but you cannot out-train a bad diet. Achievable with just 30 min daily.' },
          ].map(item => `
          <div style="background:#1C1F1D;border-radius:9px;padding:9px 11px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${item.dot};flex-shrink:0;"></div>
              <span style="font-size:10.5px;font-weight:600;color:#F1F5F2;">${item.title}</span>
            </div>
            <div style="font-size:9.5px;color:#7A8C82;line-height:1.45;">${item.body}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- DEFICIT BREAKDOWN -->
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;position:relative;overflow:hidden;flex-shrink:0;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#A855F7,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:10px;font-weight:600;">Your Calorie Deficit Breakdown</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:30px;font-weight:900;line-height:1;">${tdee} kcal</div>
            <div style="font-size:10px;color:#7A8C82;margin-top:2px;">TDEE — your daily maintenance</div>
          </div>
          <div style="text-align:right;">
            <span style="padding:5px 14px;border-radius:99px;font-size:11px;font-weight:700;background:rgba(168,85,247,.15);color:#A855F7;border:1px solid rgba(168,85,247,.3);">${totalDef} kcal deficit needed</span>
            <div style="font-size:9px;color:#7A8C82;margin-top:4px;">to reach <span style="color:#22C55E;">${intakeData.target_weight ?? weight_kg} kg</span> in ${months} months</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 24px 1fr 24px 1fr;gap:0;align-items:center;margin-bottom:9px;">
          ${[
            { pct: '80%', val: `${dietDef} kcal`, lbl: 'from Diet',     color: '#22C55E', bg: 'rgba(34,197,94,.15)',  bd: 'rgba(34,197,94,.3)'  },
            null,
            { pct: '20%', val: `${exerDef} kcal`, lbl: 'from Exercise', color: '#F97316', bg: 'rgba(249,115,22,.15)', bd: 'rgba(249,115,22,.3)' },
            null,
            { pct: '=',   val: `${totalDef} kcal`, lbl: 'Total Deficit', color: '#A855F7', bg: 'rgba(168,85,247,.08)', bd: 'rgba(168,85,247,.25)' },
          ].map((item, i) => item === null
            ? `<div style="text-align:center;font-size:20px;color:#7A8C82;">${i === 1 ? '+' : '='}</div>`
            : `<div style="background:#1C1F1D;border-radius:12px;padding:11px;text-align:center;position:relative;">
                <span style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);padding:2px 8px;border-radius:99px;font-size:8px;font-weight:700;background:${item.bg};color:${item.color};border:1px solid ${item.bd};">${item.pct}</span>
                <span style="font-family:'DM Mono',monospace;font-size:18px;font-weight:500;line-height:1;display:block;margin-bottom:3px;color:${item.color};">${item.val}</span>
                <span style="font-size:9px;color:#7A8C82;text-transform:uppercase;letter-spacing:.05em;">${item.lbl}</span>
              </div>`
          ).join('')}
        </div>
        <div style="height:13px;border-radius:99px;overflow:hidden;display:flex;margin-bottom:5px;">
          <div style="width:80%;height:100%;background:linear-gradient(90deg,#166534,#22C55E);"></div>
          <div style="width:20%;height:100%;background:linear-gradient(90deg,#7C2D12,#F97316);"></div>
        </div>
        <div style="display:flex;gap:14px;">
          <div style="display:flex;align-items:center;gap:5px;font-size:9.5px;color:#7A8C82;">
            <div style="width:8px;height:8px;border-radius:2px;background:#22C55E;"></div>Diet contribution
          </div>
          <div style="display:flex;align-items:center;gap:5px;font-size:9.5px;color:#7A8C82;">
            <div style="width:8px;height:8px;border-radius:2px;background:#F97316;"></div>Exercise contribution
          </div>
          <div style="margin-left:auto;font-family:'DM Mono',monospace;font-size:10px;color:#F1F5F2;">${target_calories} <span style="color:#7A8C82;font-size:9.5px;">target calories/day</span></div>
        </div>
      </div>

      <!-- FOOD GUIDE INTRO -->
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;position:relative;overflow:hidden;flex-shrink:0;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#3B82F6,transparent);"></div>
        <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8C82;margin-bottom:10px;font-weight:600;">How to Choose — Pages 6 to 9 · Your Meal Food Libraries</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:9px;">
          ${mealGuide.map(m => `
          <div style="border-radius:10px;padding:10px;text-align:center;position:relative;border:1px solid ${m.bd};background:${m.bg};">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;border-radius:10px 10px 0 0;background:${m.color};"></div>
            <span style="font-size:20px;margin-bottom:5px;display:block;">${m.icon}</span>
            <div style="font-size:10.5px;font-weight:700;color:#F1F5F2;margin-bottom:2px;">${m.meal}</div>
            <span style="font-family:'DM Mono',monospace;font-size:13px;margin-bottom:3px;display:block;color:${m.color};">${Math.round(target_calories * m.pct)} kcal</span>
            <span style="font-size:8.5px;background:${m.bg};color:${m.color};border:1px solid ${m.bd};padding:3px 8px;border-radius:99px;display:inline-block;">Page ${m.page}</span>
          </div>`).join('')}
        </div>
        <div style="background:#1C1F1D;border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;flex-shrink:0;">📖</span>
          <div style="font-size:9.5px;color:#7A8C82;line-height:1.5;">
            <strong style="color:#F1F5F2;">Pages 6–9 give you curated food options for each meal slot</strong> — all calories verified against the Nutrition Tracker IFCT 2017 database. Pick any combination that hits your slot target. Mix and match daily to prevent boredom.
          </div>
        </div>
      </div>

    </div>
    ${footer('⚕ Calorie values sourced from IFCT 2017 · NIN India · Nutrition Tracker food database', 'Page 4 of 9')}
  </div>`
}

// ─── PAGES 5–8: Meal food library pages ─────────────────────────────────────

function mealLibraryPage(
  plan: MealPlan,
  dayIndex: number,
  pageNum: number,
  totalPages: number,
  mealKey: 'breakfast' | 'lunch' | 'dinner' | 'snacks',
  label: string,
  emoji: string,
  accent: string,
  accentLight: string,
  pageTag: string,
  tips: string[]
): string {
  // Collect all unique foods across all 7 days for this meal slot
  const seen = new Set<string>()
  const allFoods: MealFood[] = []
  for (const day of plan.days) {
    for (const food of day[mealKey]) {
      if (!seen.has(food.name)) {
        seen.add(food.name)
        allFoods.push(food)
      }
    }
  }
  const slotCals = plan.days[0][mealKey].reduce((s, f) => s + f.calories, 0)

  return `
  <div class="page">
    ${NOISE}
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 55% 35% at 85% 8%,${accent}22 0%,transparent 60%),radial-gradient(ellipse 35% 25% at 8% 85%,${accent}18 0%,transparent 55%);"></div>

    <!-- HEADER -->
    <div style="position:relative;z-index:1;flex-shrink:0;padding:12px 26px 10px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:7px;">
        <div style="width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,${accent},${accentLight});"></div>
        <span style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#fff;">Nutrition Tracker</span>
      </div>
      <div style="display:flex;align-items:center;gap:9px;">
        <span style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#7A8C82;padding:3px 10px;border:1px solid rgba(255,255,255,.08);border-radius:99px;">${emoji} ${pageTag}</span>
        <span style="font-family:'DM Mono',monospace;font-size:10px;color:#7A8C82;">${plan.generated_date}</span>
      </div>
    </div>

    <!-- HEADING -->
    <div style="position:relative;z-index:1;flex-shrink:0;padding:10px 26px 0;">
      <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:900;line-height:1.1;margin-bottom:3px;">
        Your <em style="font-style:italic;background:linear-gradient(90deg,${accent},${accentLight});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${label}</em> Food Library
      </h2>
      <p style="font-size:10px;color:#7A8C82;">Calorie-controlled options · Each food scaled to your daily target · Pick one item per day</p>
    </div>

    <!-- BUDGET STRIP -->
    <div style="position:relative;z-index:1;flex-shrink:0;padding:6px 26px;display:flex;gap:8px;align-items:center;">
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:99px;padding:5px 13px;display:flex;align-items:center;gap:7px;">
        <span style="font-size:8.5px;color:#7A8C82;text-transform:uppercase;letter-spacing:.06em;">Slot Budget</span>
        <span style="font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:${accent};">${slotCals} kcal</span>
      </div>
      <div style="background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:99px;padding:5px 13px;display:flex;align-items:center;gap:7px;">
        <span style="font-size:8.5px;color:#7A8C82;text-transform:uppercase;letter-spacing:.06em;">Plan Goal</span>
        <span style="font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:#22C55E;">${plan.goal_label}</span>
      </div>
      <div style="flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:5px 10px;font-size:9px;color:#7A8C82;line-height:1.35;">
        <strong style="color:#F1F5F2;">How to use:</strong> Pick any 1 food from your ${label.toLowerCase()} plan below. The serving size is already calculated for your calorie target.
      </div>
    </div>

    <!-- TABLE -->
    <div style="position:relative;z-index:1;flex:1;padding:0 26px 3px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#1C1F1D;">
            <th style="padding:5px 7px;font-size:8px;text-align:left;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Food Item</th>
            <th style="padding:5px 7px;font-size:8px;text-align:center;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Kcal</th>
            <th style="padding:5px 7px;font-size:8px;text-align:center;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Eat This Much</th>
            <th style="padding:5px 7px;font-size:8px;text-align:center;color:#22C55E;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Protein</th>
            <th style="padding:5px 7px;font-size:8px;text-align:center;color:#F97316;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Carbs</th>
            <th style="padding:5px 7px;font-size:8px;text-align:center;color:#A855F7;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Fat</th>
            <th style="padding:5px 7px;font-size:8px;text-align:center;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Fibre</th>
            <th style="padding:5px 7px;font-size:8px;text-align:center;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Macros</th>
          </tr>
        </thead>
        <tbody>
          ${allFoods.slice(0, 14).map((food, i) => {
            const total = food.protein_g * 4 + food.carbs_g * 4 + food.fat_g * 9 || 1
            const pPct = Math.round(food.protein_g * 4 / total * 100)
            const cPct = Math.round(food.carbs_g   * 4 / total * 100)
            const fPct = 100 - pPct - cPct
            return `
            <tr style="border-bottom:1px solid rgba(255,255,255,.032);">
              <td style="padding:5px 7px;font-size:9.5px;color:#F1F5F2;vertical-align:middle;">
                <span style="color:#7A8C82;font-size:8px;margin-right:3px;">${String(i + 1).padStart(2, '0')}</span>
                <span style="font-weight:600;">${food.name}</span>
              </td>
              <td style="padding:5px 7px;text-align:center;vertical-align:middle;">
                <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-family:'DM Mono',monospace;font-size:9px;font-weight:700;background:${accent}22;color:${accent};border:1px solid ${accent}44;">${food.calories}</span>
              </td>
              <td style="padding:5px 7px;text-align:center;vertical-align:middle;">
                <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-family:'DM Mono',monospace;font-size:10px;font-weight:600;background:${accent}15;color:${accentLight};border:1px solid ${accent}44;">
                  <span style="font-size:8px;opacity:.7;">→</span>${food.scaled_grams}${food.serving_unit}
                </span>
              </td>
              <td style="padding:5px 7px;font-size:9px;text-align:center;font-family:'DM Mono',monospace;color:#F1F5F2;vertical-align:middle;">${food.protein_g}g</td>
              <td style="padding:5px 7px;font-size:9px;text-align:center;font-family:'DM Mono',monospace;color:#F1F5F2;vertical-align:middle;">${food.carbs_g}g</td>
              <td style="padding:5px 7px;font-size:9px;text-align:center;font-family:'DM Mono',monospace;color:#F1F5F2;vertical-align:middle;">${food.fat_g}g</td>
              <td style="padding:5px 7px;font-size:9px;text-align:center;font-family:'DM Mono',monospace;color:#F1F5F2;vertical-align:middle;">${food.fibre_g}g</td>
              <td style="padding:5px 7px;text-align:center;vertical-align:middle;">
                <div style="display:flex;flex-direction:column;gap:2px;width:52px;">
                  <div style="display:flex;align-items:center;gap:3px;"><span style="font-size:7px;color:#7A8C82;width:10px;text-align:right;">P</span><div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;"><div style="width:${pPct}%;height:100%;background:#22C55E;border-radius:99px;"></div></div></div>
                  <div style="display:flex;align-items:center;gap:3px;"><span style="font-size:7px;color:#7A8C82;width:10px;text-align:right;">C</span><div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;"><div style="width:${cPct}%;height:100%;background:#F97316;border-radius:99px;"></div></div></div>
                  <div style="display:flex;align-items:center;gap:3px;"><span style="font-size:7px;color:#7A8C82;width:10px;text-align:right;">F</span><div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;"><div style="width:${fPct}%;height:100%;background:#A855F7;border-radius:99px;"></div></div></div>
                </div>
              </td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- TIPS -->
    <div style="position:relative;z-index:1;flex-shrink:0;margin:3px 26px 0;background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:7px 12px;display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;border-radius:11px 11px 0 0;background:linear-gradient(90deg,${accent},transparent);"></div>
      ${tips.map(tip => `
      <div style="display:flex;align-items:flex-start;gap:5px;">
        <span style="font-size:11px;flex-shrink:0;line-height:1.5;">${tip.split(' ')[0]}</span>
        <span style="font-size:8.5px;color:#7A8C82;line-height:1.4;">${tip.slice(tip.indexOf(' ') + 1)}</span>
      </div>`).join('')}
    </div>

    <div style="position:relative;z-index:1;flex-shrink:0;padding:7px 26px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:8.5px;color:#7A8C82;opacity:.65;">⚕ Calorie values from Nutrition Tracker IFCT 2017 database · Servings scaled to your personal target</span>
      <span style="font-family:'DM Mono',monospace;font-size:9px;color:#7A8C82;">Page ${pageNum} of ${totalPages}</span>
    </div>
  </div>`
}

// ─── PAGE 9 — 7-Day Meal Schedule ────────────────────────────────────────────

function page9(plan: MealPlan): string {
  return `
  <div class="page">
    ${NOISE}
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 55% 30% at 88% 5%,rgba(168,85,247,.06) 0%,transparent 60%),radial-gradient(ellipse 40% 25% at 5% 88%,rgba(34,197,94,.05) 0%,transparent 55%);"></div>
    ${header('Your 7-Day Schedule', plan.generated_date)}

    <div style="position:relative;z-index:1;flex-shrink:0;padding:12px 26px 0;">
      <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:900;line-height:1.1;margin-bottom:3px;">
        Your <em style="font-style:italic;background:linear-gradient(90deg,#A855F7,#C084FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Complete</em> 7-Day Meal Schedule
      </h2>
      <p style="font-size:10px;color:#7A8C82;">${plan.goal_label} · ${plan.target_calories} kcal/day · ${plan.diet_label} · ${plan.cuisine_labels.join(', ')}</p>
    </div>

    <div style="position:relative;z-index:1;flex:1;padding:8px 26px;display:flex;flex-direction:column;gap:0;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#1C1F1D;">
            <th style="padding:5px 8px;font-size:8px;text-align:left;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Day</th>
            <th style="padding:5px 8px;font-size:8px;text-align:left;color:#F97316;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">☀️ Breakfast</th>
            <th style="padding:5px 8px;font-size:8px;text-align:left;color:#22C55E;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">🍱 Lunch</th>
            <th style="padding:5px 8px;font-size:8px;text-align:left;color:#3B82F6;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">🍎 Snack</th>
            <th style="padding:5px 8px;font-size:8px;text-align:left;color:#A855F7;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">🌙 Dinner</th>
            <th style="padding:5px 8px;font-size:8px;text-align:right;color:#7A8C82;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);">Total</th>
          </tr>
        </thead>
        <tbody>
          ${plan.days.map((day, i) => `
          <tr style="border-bottom:1px solid rgba(255,255,255,.04);">
            <td style="padding:6px 8px;vertical-align:top;">
              <div style="font-family:'Playfair Display',serif;font-size:11px;font-weight:700;color:#F1F5F2;">${DAY_NAMES[i].slice(0, 3)}</div>
              <div style="font-size:8px;color:#7A8C82;">Day ${i + 1}</div>
            </td>
            <td style="padding:6px 8px;vertical-align:top;">
              ${day.breakfast.map(f => `<div style="font-size:8.5px;color:#F1F5F2;line-height:1.4;">${f.name}</div><div style="font-size:7.5px;color:#F97316;font-family:'DM Mono',monospace;">${f.scaled_grams}${f.serving_unit} · ${f.calories}kcal</div>`).join('')}
            </td>
            <td style="padding:6px 8px;vertical-align:top;">
              ${day.lunch.map(f => `<div style="font-size:8.5px;color:#F1F5F2;line-height:1.4;">${f.name}</div><div style="font-size:7.5px;color:#22C55E;font-family:'DM Mono',monospace;">${f.scaled_grams}${f.serving_unit} · ${f.calories}kcal</div>`).join('')}
            </td>
            <td style="padding:6px 8px;vertical-align:top;">
              ${day.snacks.map(f => `<div style="font-size:8.5px;color:#F1F5F2;line-height:1.4;">${f.name}</div><div style="font-size:7.5px;color:#3B82F6;font-family:'DM Mono',monospace;">${f.scaled_grams}${f.serving_unit} · ${f.calories}kcal</div>`).join('')}
            </td>
            <td style="padding:6px 8px;vertical-align:top;">
              ${day.dinner.map(f => `<div style="font-size:8.5px;color:#F1F5F2;line-height:1.4;">${f.name}</div><div style="font-size:7.5px;color:#A855F7;font-family:'DM Mono',monospace;">${f.scaled_grams}${f.serving_unit} · ${f.calories}kcal</div>`).join('')}
            </td>
            <td style="padding:6px 8px;text-align:right;vertical-align:top;">
              <div style="font-family:'DM Mono',monospace;font-size:11px;font-weight:700;color:#F1F5F2;">${day.total_calories}</div>
              <div style="font-size:7.5px;color:#7A8C82;">kcal</div>
              <div style="font-size:7.5px;color:#22C55E;margin-top:2px;">P: ${day.total_protein}g</div>
              <div style="font-size:7.5px;color:#F97316;">C: ${day.total_carbs}g</div>
              <div style="font-size:7.5px;color:#A855F7;">F: ${day.total_fat}g</div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <!-- FAREWELL -->
    <div style="position:relative;z-index:1;flex-shrink:0;margin:0 26px 6px;background:#131614;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:11px 14px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#F97316,#22C55E,#A855F7);"></div>
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="flex:1;">
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:900;line-height:1.2;margin-bottom:5px;">
            You already have <em style="font-style:italic;background:linear-gradient(90deg,#F97316,#22C55E);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">everything</em> you need to begin.
          </div>
          <div style="font-size:9px;color:#7A8C82;line-height:1.6;">
            This plan was built specifically for you — ${plan.user_name}, ${plan.goal_label}, ${plan.target_calories} kcal/day, ${plan.diet_label} · ${plan.cuisine_labels.join(' + ')} cuisine. Every serving size is already calculated. Every day is planned. Just follow the schedule above, weigh your portions once, and let the results follow.
          </div>
          <div style="font-family:'Playfair Display',serif;font-size:10px;font-style:italic;color:#7A8C82;margin-top:5px;">— Nutrition Tracker · Built for Indian bodies, Indian kitchens</div>
        </div>
        <div style="background:#1C1F1D;border-radius:12px;padding:11px 14px;text-align:center;border:1px solid rgba(255,255,255,.08);flex-shrink:0;">
          <span style="font-size:26px;display:block;margin-bottom:4px;">🎯</span>
          <div style="font-size:9px;font-weight:700;color:#fff;margin-bottom:3px;">Start Today</div>
          <div style="font-size:8px;color:#7A8C82;line-height:1.6;">
            Pick Day 1<br>Weigh portions<br>Hit ${plan.target_calories} kcal<br>Repeat 7 days
          </div>
        </div>
      </div>
    </div>

    ${footer('⚕ For informational purposes only · Consult a registered dietitian before making significant dietary changes', 'Page 9 of 9')}
  </div>`
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function renderTemplate(plan: MealPlan, intakeData?: any): string {
  // intakeData is passed from index.ts via plan enrichment — fall back to plan fields
  const intake = intakeData ?? {
    weight_kg:      75,
    height_cm:      170,
    age:            28,
    gender:         'male',
    activity_level: 'moderately_active',
    target_weight:  70,
    target_calories: plan.target_calories,
  }

  const bf  = plan.days[0].breakfast
  const bfColor = '#F97316'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Nutrition Tracker — Your Personalised Meal Plan</title>
<style>${BASE_STYLES}</style>
</head>
<body>

${page1(plan, intake)}
${page2(plan, intake)}
${page3(plan, intake)}
${page4(plan, intake)}

${mealLibraryPage(plan, 0, 5, 9, 'breakfast', 'Breakfast', '☀️', '#F97316', '#FB923C', 'Breakfast Foods', [
  '🥚 Pick ONE food — eat exactly the serving shown to hit your breakfast target.',
  '🔄 Swap freely daily — all options give the same calories, different macros.',
  '🌾 Fibre-rich picks keep you fuller longer — prefer on rest days.',
  '💪 Protein-heavy picks are best on workout mornings.',
  '⚖️ Weigh your serving — the gram amount gives you exactly the right calories.',
])}

${mealLibraryPage(plan, 0, 6, 9, 'lunch', 'Lunch', '🍱', '#22C55E', '#4ADE80', 'Lunch Foods', [
  '🍽️ Pick ONE item — eat exactly the serving shown to hit your lunch target.',
  '🔄 Rotate across the week — same calories, zero boredom.',
  '🥗 Add a side raita from the snacks list to bulk up volume.',
  '💡 Lighter dishes need larger serving sizes — still the same calories.',
  '⚖️ The gram amounts differ widely — weigh once, eat right.',
])}

${mealLibraryPage(plan, 0, 7, 9, 'snacks', 'Snacks', '🍎', '#3B82F6', '#60A5FA', 'Snacks Foods', [
  '✂️ One snack slot total. You can split: half serving mid-morning, half evening.',
  '🥣 Fruit and light options dominate this list — great for satiety.',
  '🔄 Rotate daily to keep variety and gut health strong.',
  '🚫 Avoid biscuits, chai-samosa — same or higher calories, zero nutrition.',
  '⚖️ Larger serving = lighter food. Smaller serving = denser food.',
])}

${mealLibraryPage(plan, 0, 8, 9, 'dinner', 'Dinner', '🌙', '#A855F7', '#C084FC', 'Dinner Foods', [
  '🕗 Eat by 8 PM — late meals convert more calories to fat overnight.',
  '🥦 Vegetable-heavy choices are very filling for fewer calories.',
  '🌾 If choosing roti/paratha at night, prefer high-fibre options.',
  '🔄 Rotate across the week — same calories, zero boredom.',
  '⚖️ Every item = the right calories at its listed serving. Weigh once, eat right.',
])}

${page9(plan)}

</body>
</html>`
}
