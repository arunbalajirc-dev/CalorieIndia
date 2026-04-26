// Original 7-page PDF template — ported from supabase/functions/generate-pdf/template.ts
// Safe deficit fields (deficit_kcal, months_to_goal) wired in from planner.ts

export interface MealFood {
  name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; fibre_g: number
  serving_grams: number; serving_unit: string; scaled_grams: number; serving_display: string
}
export interface DayMeal {
  breakfast: MealFood[]; lunch: MealFood[]; dinner: MealFood[]; snacks: MealFood[]
  total_calories: number; total_protein: number; total_carbs: number; total_fat: number
}
export interface MealPlan {
  days: DayMeal[]; user_name: string; goal: string; goal_label: string
  target_calories: number; protein_target: number; carbs_target: number; fat_target: number
  tdee: number; bmi: number; bmi_category: string; cuisine_labels: string[]; diet_label: string; generated_date: string
  deficit_kcal:   number
  deficit_mode:   string
  safety_flag:    string | null
  weekly_loss_kg: number
  months_to_goal: number
}

const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function activityMultiplier(level: string): number {
  const map: Record<string,number> = {
    sedentary: 1.2, lightly_active: 1.375,
    moderately_active: 1.55, very_active: 1.725, extra_active: 1.9,
  }
  return map[level] ?? 1.375
}

function bmiInfo(bmi: number): { cat: string; color: string; pct: number } {
  if (bmi < 18.5) return { cat: 'Underweight', color: '#3B82F6', pct: 8 }
  if (bmi < 23)   return { cat: 'Healthy',     color: '#22C55E', pct: 30 }
  if (bmi < 25)   return { cat: 'Overweight',  color: '#EAB308', pct: 58 }
  if (bmi < 30)   return { cat: 'Obese I',     color: '#F97316', pct: 74 }
  return               { cat: 'Obese II',     color: '#EF4444', pct: 90 }
}

function pageHeader(title: string, subtitle: string, subtitle2 = ''): string {
  return `
  <div style="flex-shrink:0;background:#FFD700;padding:22px 28px 0 28px;position:relative;">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% -10%,#fff8a0 0%,#FFD700 55%);pointer-events:none;"></div>
    <div style="position:relative;z-index:1;">
      <h1 style="font-family:'Montserrat',sans-serif;font-size:22px;font-weight:900;color:#111;letter-spacing:-.02em;line-height:1.1;margin:0 0 6px 0;text-transform:uppercase;">${title}</h1>
      <p style="font-family:'Montserrat',sans-serif;font-size:11.5px;font-weight:700;color:#1a5c1a;margin:0 0 ${subtitle2 ? '2px' : '0'} 0;line-height:1.4;">${subtitle}</p>
      ${subtitle2 ? `<p style="font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;color:#1a5c1a;margin:0;">${subtitle2}</p>` : ''}
    </div>
    <div style="margin-top:16px;position:relative;z-index:1;">
      <svg viewBox="0 0 794 52" preserveAspectRatio="none" style="display:block;width:calc(100% + 56px);margin-left:-28px;height:52px;">
        <path d="M0,20 C60,40 120,5 200,22 C280,39 340,8 420,25 C500,42 560,10 640,28 C720,46 760,15 794,30 L794,52 L0,52 Z" fill="#2d8a2d"/>
        <path d="M0,28 C50,48 110,12 190,30 C270,48 330,14 410,32 C490,50 550,16 630,34 C710,52 760,22 794,38 L794,52 L0,52 Z" fill="#1a5c1a"/>
      </svg>
    </div>
  </div>`
}

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:#000;color:#fff;}
  .page{
    width:210mm;min-height:297mm;background:#000;
    position:relative;overflow:hidden;
    display:flex;flex-direction:column;
    page-break-after:always;
  }
  @page{size:A4;margin:0;}
  @media print{body{background:#000;}.page{page-break-after:always;}}
  .card{background:#111;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;position:relative;overflow:hidden;}
  .card-accent-yellow::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#FFD700;}
  .card-accent-green::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#22C55E;}
  .card-accent-orange::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#F97316;}
  .card-accent-blue::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#3B82F6;}
  .card-accent-purple::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#A855F7;}
  .label{font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#888;font-weight:600;font-family:'Montserrat',sans-serif;margin-bottom:8px;}
  .mono{font-family:'DM Mono',monospace;}
`

// ─── PAGE 1 — COVER ──────────────────────────────────────────────────────────

function page1(plan: MealPlan, intakeData: any): string {
  const { weight_kg } = intakeData
  const dietDisplay = (intakeData.diet_type ?? 'veg') === 'veg' ? 'Vegetarian' : (intakeData.diet_type === 'non-veg' ? 'Non-Vegetarian' : 'Veg + Non-Veg')

  return `
  <div class="page" style="background:#000;min-height:297mm;">

    <!-- Cover photo bottom 50% — fades up into black -->
    <div style="position:absolute;left:0;right:0;bottom:0;height:52%;z-index:1;overflow:hidden;">
      <img src="https://nutritiontracker.in/images/image%20bg%201.PNG"
           style="width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;"
           crossOrigin="anonymous"
           onerror="this.parentElement.style.display='none'" alt=""/>
      <!-- Top fade: image blends up into black -->
      <div style="position:absolute;top:0;left:0;right:0;height:55%;background:linear-gradient(0deg,transparent 0%,#000 100%);"></div>
      <!-- Side darkening for readability -->
      <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.45) 0%,transparent 50%,rgba(0,0,0,.3) 100%);"></div>
    </div>

    <!-- Background gradient top half stays pure black -->
    <div style="position:absolute;top:0;left:0;right:0;height:52%;z-index:0;background:#000;"></div>

    <!-- Logo top-right -->
    <div style="position:absolute;top:22px;right:22px;z-index:3;">
      <img src="https://raw.githubusercontent.com/arunbalajirc-dev/CalorieIndia/main/health-calculator-site/images/Nt-logo.png" crossOrigin="anonymous" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" style="height:52px;width:auto;" alt="Nutrition Tracker"/><span style="display:none;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:#FFD700;line-height:1;">Nutrition Tracker</span>
    </div>

    <!-- Main text content -->
    <div style="position:relative;z-index:2;padding:40px 36px;flex:1;display:flex;flex-direction:column;justify-content:flex-start;max-width:75%;">

      <h1 style="font-family:'Montserrat',sans-serif;font-size:58px;font-weight:900;color:#FFD700;line-height:1.05;text-transform:uppercase;letter-spacing:-.02em;margin-bottom:16px;">
        Your Personalised<br>Meal Plan
      </h1>

      <p style="font-family:'Inter',sans-serif;font-size:17px;color:rgba(255,255,255,.75);line-height:1.65;margin-bottom:28px;max-width:400px;">
        Calorie-precise, macro-balanced meals built<br>for Indian bodies and Indian kitchens…
      </p>

      <div style="width:48px;height:3px;background:#FFD700;border-radius:2px;margin-bottom:24px;"></div>

      <!-- User name · weight · goal -->
      <div style="margin-bottom:10px;">
        <span style="font-family:'Montserrat',sans-serif;font-size:16px;font-weight:600;color:rgba(255,255,255,.55);letter-spacing:.05em;">
          ${plan.user_name} &nbsp;·&nbsp; ${weight_kg} kg &nbsp;·&nbsp; ${plan.goal_label}
        </span>
      </div>

      <!-- Macro row -->
      <div style="display:flex;gap:20px;margin-bottom:32px;">
        <div>
          <span style="font-family:'DM Mono',monospace;font-size:30px;font-weight:500;color:#22C55E;">${plan.protein_target}g</span>
          <div style="font-size:12px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;">Protein</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,.12);"></div>
        <div>
          <span style="font-family:'DM Mono',monospace;font-size:30px;font-weight:500;color:#F97316;">${plan.carbs_target}g</span>
          <div style="font-size:12px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;">Carbs</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,.12);"></div>
        <div>
          <span style="font-family:'DM Mono',monospace;font-size:30px;font-weight:500;color:#A855F7;">${plan.fat_target}g</span>
          <div style="font-size:12px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;">Fat</div>
        </div>
      </div>

      <!-- Diet badge -->
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.25);border-radius:99px;padding:6px 14px;width:fit-content;">
        <span style="font-size:13px;">🥗</span>
        <span style="font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;color:#FFD700;">${dietDisplay} · Indian Cuisine</span>
      </div>

    </div>

    <!-- Generated date bottom-right -->
    <div style="position:absolute;bottom:28px;right:28px;z-index:4;text-align:right;">
      <span style="font-family:'DM Mono',monospace;font-size:11px;color:rgba(255,255,255,.45);letter-spacing:.06em;">${plan.generated_date}</span>
    </div>

    <!-- Yellow corner bottom-right -->
    <div style="position:absolute;bottom:0;right:0;width:60px;height:60px;background:#FFD700;clip-path:polygon(100% 0,100% 100%,0 100%);z-index:5;"></div>

  </div>`
}

// ─── PAGE 2 — HEALTH SNAPSHOT ────────────────────────────────────────────────

function page2(plan: MealPlan, intakeData: any): string {
  const { weight_kg, height_cm, age, gender, activity_level } = intakeData
  const targetWeight = intakeData.target_weight ?? weight_kg
  const hm = height_cm / 100
  const bmi = +(weight_kg / (hm * hm)).toFixed(1)
  const B = bmiInfo(bmi)
  const bmr = gender === 'male'
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  const tdee = Math.round(bmr * activityMultiplier(activity_level))
  // Use safe deficit from planner, fall back to legacy value
  const deficit = plan.deficit_kcal ?? (plan.goal === 'lose' ? 500 : plan.goal === 'gain' ? -300 : 0)
  const toChange = +(weight_kg - targetWeight).toFixed(1)
  const losing = toChange > 0
  const months = plan.months_to_goal || Math.max(1, deficit !== 0 ? Math.round(Math.round((Math.abs(toChange) * 7700) / (Math.abs(deficit) * 7)) / 4.33) : 0)
  const weeksTotal = Math.round(months * 4.33)
  const weeklyLoss = ((Math.abs(deficit) * 7) / 7700).toFixed(2)
  const ph = Math.round(weeksTotal / 3)

  // Chart always shows 0.5 kg/week pace (aspirational target with diet + exercise)
  const chartWeeks  = toChange > 0 ? Math.ceil(toChange / 0.5) : weeksTotal
  const chartMonths = Math.max(1, Math.round(chartWeeks / 4.33 * 10) / 10)

  // Exercise burn target: how many kcal/day from exercise to reach 0.5 kg/week total
  const TARGET_DAILY = 500  // 0.5 kg/week = 500 kcal/day total deficit
  const exerciseBurnTarget = plan.goal === 'lose' ? Math.max(0, TARGET_DAILY - Math.abs(deficit)) : 0

  let bmiRiskNote = ''
  if (bmi < 18.5) bmiRiskNote = 'You are Underweight. Focus on calorie surplus and strength training to build lean mass.'
  else if (bmi < 23) bmiRiskNote = 'You are in the Healthy range for Asian standards. Focus on maintaining and improving body composition.'
  else if (bmi < 25) bmiRiskNote = 'You are Overweight. Even a 5% reduction in body weight significantly reduces cardiovascular and metabolic risk.'
  else if (bmi < 30) bmiRiskNote = 'You are in Obese Class I. This range is associated with elevated risk of Type 2 diabetes, hypertension, and joint stress. Losing 8–10% of body weight produces measurable clinical improvements.'
  else bmiRiskNote = 'You are in Obese Class II. Priority should be medical supervision alongside diet and movement changes.'

  const phaseNotes = [
    `Phase 1 (Wk 1–${ph}): Build consistency — hit your calorie target daily, weigh portions, track every meal`,
    `Phase 2 (Wk ${ph+1}–${ph*2}): Introduce 3× strength training per week. Protein becomes critical to prevent muscle loss.`,
    `Phase 3 (Wk ${ph*2+1}–${weeksTotal}): Fine-tune. If weight plateaus, reduce target by 100 kcal or add 1 extra exercise session.`,
  ]

  const TW = 520, TH = 110, PAD = { l: 38, r: 30, t: 14, b: 28 }
  const cw = TW - PAD.l - PAD.r, ch = TH - PAD.t - PAD.b
  const wMin = Math.min(targetWeight, weight_kg) - 3
  const wMax = Math.max(targetWeight, weight_kg) + 4
  // Use chartMonths (0.5 kg/week pace) for x-axis scale
  const xOf = (m: number) => PAD.l + (m / (chartMonths || 1)) * cw
  const yOf = (w: number) => PAD.t + ch - ((w - wMin) / (wMax - wMin || 1)) * ch
  let gridLines = ''
  for (let i = 0; i <= 4; i++) {
    const gw = wMin + ((wMax - wMin) / 4) * i, gy = yOf(gw)
    gridLines += `<line x1="${PAD.l}" y1="${gy.toFixed(1)}" x2="${TW - PAD.r}" y2="${gy.toFixed(1)}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`
    gridLines += `<text x="${PAD.l - 4}" y="${(gy + 3).toFixed(1)}" text-anchor="end" font-size="7" fill="rgba(255,255,255,.3)" font-family="DM Mono,monospace">${gw.toFixed(0)}</text>`
  }
  const mp = Math.min(7, Math.round(chartMonths))
  for (let m = 0; m <= mp; m++) {
    gridLines += `<text x="${xOf(chartMonths * m / (mp || 1)).toFixed(1)}" y="${TH - 4}" text-anchor="middle" font-size="7" fill="rgba(255,255,255,.3)" font-family="Inter,sans-serif">M${m}</text>`
  }
  const goalY = yOf(targetWeight)
  gridLines += `<line x1="${PAD.l}" y1="${goalY.toFixed(1)}" x2="${TW - PAD.r}" y2="${goalY.toFixed(1)}" stroke="#22C55E" stroke-width="1" stroke-dasharray="4,3" opacity=".4"/>`
  gridLines += `<text x="${TW - PAD.r + 2}" y="${(goalY + 3).toFixed(1)}" font-size="7" fill="#22C55E" font-family="DM Mono,monospace">${targetWeight}kg</text>`
  const pts = []
  for (let s = 0; s <= 60; s++) {
    const t = s / 60, sw = 1 / (1 + Math.exp(-8 * (t - 0.5)))
    pts.push({ x: xOf(chartMonths * t), y: yOf(weight_kg + (targetWeight - weight_kg) * sw) })
  }
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], mx = ((a.x + b.x) / 2).toFixed(1)
    d += ` C ${mx} ${a.y.toFixed(1)}, ${mx} ${b.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
  }
  const lp = pts[pts.length - 1]
  const area = d + ` L ${lp.x.toFixed(1)} ${(PAD.t + ch).toFixed(1)} L ${PAD.l} ${(PAD.t + ch).toFixed(1)} Z`
  const svgTimeline = `
    <defs>
      <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#22C55E"/></linearGradient>
      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFD700" stop-opacity=".15"/><stop offset="100%" stop-color="#FFD700" stop-opacity="0"/></linearGradient>
    </defs>
    ${gridLines}
    <path d="${area}" fill="url(#ag)"/>
    <path d="${d}" fill="none" stroke="url(#tg)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${PAD.l}" cy="${yOf(weight_kg).toFixed(1)}" r="4" fill="#FFD700" stroke="#000" stroke-width="2"/>
    <text x="${PAD.l}" y="${(yOf(weight_kg) - 7).toFixed(1)}" text-anchor="middle" font-size="8" fill="#FFD700" font-family="DM Mono,monospace" font-weight="600">${weight_kg}kg</text>
    <circle cx="${lp.x.toFixed(1)}" cy="${lp.y.toFixed(1)}" r="4" fill="#22C55E" stroke="#000" stroke-width="2"/>
    <text x="${lp.x.toFixed(1)}" y="${(lp.y - 7).toFixed(1)}" text-anchor="middle" font-size="8" fill="#22C55E" font-family="DM Mono,monospace" font-weight="600">${targetWeight}kg</text>`

  const phases = [
    { n: '01', icon: '🔥', name: 'Ignition',      wk: `Wk 1–${ph}`,              color: '#F97316', desc: 'Establish calorie deficit, learn portion sizes, build daily tracking habit' },
    { n: '02', icon: '⚙️',  name: 'Adaptation',    wk: `Wk ${ph+1}–${ph*2}`,     color: '#A855F7', desc: 'Introduce strength training, optimise protein intake, manage the plateau' },
    { n: '03', icon: '🏆', name: 'Consolidation', wk: `Wk ${ph*2+1}–${weeksTotal}`, color: '#22C55E', desc: 'Reach target weight, shift to maintenance calories, lock in new habits' },
  ]

  const calMax = tdee * 1.1
  const tCalPct = Math.min(100, plan.target_calories / calMax * 100)
  const tdePct  = Math.min(100, tdee / calMax * 100)
  const defPct  = Math.min(100, Math.abs(deficit) / tdee * 100 * 4)

  return `
  <div class="page">
    ${pageHeader('Your Health Snapshot', 'Personalized for Metabolic Standards')}

    <div style="flex:1;background:#000;padding:14px 20px 10px;display:flex;flex-direction:column;gap:8px;overflow:hidden;">

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;flex-shrink:0;">
        <div class="card card-accent-yellow">
          <div class="label">Your Profile</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
            ${[
              { v: `${weight_kg} kg`, l: 'Current Weight', hl: false },
              { v: `${height_cm} cm`, l: 'Height', hl: false },
              { v: `${age} yrs`, l: 'Age', hl: false },
              { v: `${targetWeight} kg`, l: 'Target Weight', hl: true },
            ].map(s => `
            <div style="background:${s.hl ? 'rgba(255,215,0,.1)' : '#1a1a1a'};border:1px solid ${s.hl ? 'rgba(255,215,0,.25)' : 'rgba(255,255,255,.06)'};border-radius:9px;padding:9px 10px;">
              <div style="font-family:'DM Mono',monospace;font-size:18px;font-weight:500;color:${s.hl ? '#FFD700' : '#fff'};line-height:1;">${s.v}</div>
              <div style="font-size:9px;color:#666;margin-top:3px;">${s.l}</div>
            </div>`).join('')}
            <div style="grid-column:1/-1;background:#1a1a1a;border:1px solid rgba(255,255,255,.06);border-radius:9px;padding:9px 10px;">
              <div style="font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:#fff;">${losing ? '−' : '+'} ${Math.abs(toChange)} kg to ${losing ? 'lose' : 'gain'}</div>
              <div style="font-size:9px;color:#666;margin-top:2px;">Weight Change Goal · ~${months} months${plan.deficit_mode ? ' · ' + plan.deficit_mode : ''}</div>
            </div>
          </div>
        </div>

        <div class="card card-accent-green">
          <div class="label">BMI Scale — Asian Standard</div>
          <div style="height:10px;border-radius:99px;position:relative;margin-bottom:7px;background:linear-gradient(90deg,#3B82F6 0%,#22C55E 20%,#22C55E 40%,#EAB308 55%,#F97316 70%,#EF4444 85%,#7C3AED 100%);">
            <div style="position:absolute;top:-4px;width:18px;height:18px;background:#fff;border-radius:50%;border:3px solid #000;box-shadow:0 0 0 2px ${B.color};transform:translateX(-50%);left:${B.pct}%;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span style="font-size:7.5px;color:#3B82F6;text-align:center;">Under<br>&lt;18.5</span>
            <span style="font-size:7.5px;color:#22C55E;text-align:center;">Normal<br>18.5–23</span>
            <span style="font-size:7.5px;color:#EAB308;text-align:center;">Over<br>23–24.9</span>
            <span style="font-size:7.5px;color:#F97316;text-align:center;">Obese I<br>25–29.9</span>
            <span style="font-size:7.5px;color:#EF4444;text-align:center;">Obese II<br>≥30</span>
          </div>
          <div style="background:#1a1a1a;border:1px solid rgba(255,215,0,.2);border-radius:9px;padding:8px 10px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-family:'DM Mono',monospace;font-size:22px;font-weight:500;color:${B.color};">${bmi}</div>
              <div style="font-size:9px;color:#666;">BMI Score</div>
            </div>
            <span style="font-size:10px;font-weight:700;padding:4px 10px;border-radius:99px;background:${B.color}22;color:${B.color};border:1px solid ${B.color}44;">${B.cat}</span>
          </div>
          ${[
            { label: 'TDEE', val: `${tdee} kcal`, pct: tdePct, color: '#F97316' },
            { label: 'Target / Day', val: `${plan.target_calories} kcal`, pct: tCalPct, color: '#22C55E' },
            { label: 'Diet Deficit', val: `${Math.abs(deficit)} kcal`, pct: defPct, color: '#A855F7' },
            ...(exerciseBurnTarget > 0 ? [{ label: '🔥 Exercise Burn Target', val: `${exerciseBurnTarget} kcal`, pct: Math.min(100, exerciseBurnTarget / tdee * 100 * 4), color: '#F97316' }] : []),
          ].map(row => `
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;">
            <span style="font-size:9.5px;color:#888;width:72px;flex-shrink:0;">${row.label}</span>
            <div style="flex:1;height:7px;background:#1a1a1a;border-radius:99px;overflow:hidden;">
              <div style="width:${row.pct}%;height:100%;background:${row.color};border-radius:99px;"></div>
            </div>
            <span style="font-family:'DM Mono',monospace;font-size:9.5px;color:#ddd;width:62px;text-align:right;">${row.val}</span>
          </div>`).join('')}
        </div>
      </div>

      <div class="card card-accent-yellow" style="flex:1;min-height:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
          <div class="label" style="margin-bottom:0;">Projected Weight Timeline</div>
          <span style="font-size:8px;color:#F97316;font-weight:600;letter-spacing:.04em;">@ 0.5 kg/week · ${chartWeeks} weeks · ${chartMonths} months</span>
        </div>
        <svg width="100%" viewBox="0 0 ${TW} ${TH}" preserveAspectRatio="none" style="display:block;height:130px;">${svgTimeline}</svg>
      </div>

      <div class="card card-accent-green" style="flex-shrink:0;">
        <div class="label">Your 3-Phase Fitness Roadmap</div>
        <div style="display:flex;position:relative;gap:0;">
          <div style="position:absolute;top:17px;left:18px;right:18px;height:2px;background:linear-gradient(90deg,#F97316,#A855F7,#22C55E);z-index:0;"></div>
          ${phases.map(p => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;z-index:1;">
            <div style="width:34px;height:34px;border-radius:50%;background:${p.color}22;border:2px solid ${p.color}55;display:flex;align-items:center;justify-content:center;font-size:14px;margin-bottom:5px;">${p.icon}</div>
            <div style="font-family:'DM Mono',monospace;font-size:7.5px;color:#666;margin-bottom:2px;">${p.n}</div>
            <div style="font-size:10px;font-weight:700;color:${p.color};margin-bottom:1px;">${p.name}</div>
            <div style="font-size:8px;color:#666;margin-bottom:3px;">${p.wk}</div>
            <div style="font-size:8px;color:#888;line-height:1.35;padding:0 4px;">${p.desc}</div>
          </div>`).join('')}
        </div>
      </div>

      <div class="card card-accent-green" style="flex:1;min-height:0;">
        <div class="label">Progress Insights &amp; Phase Guidance</div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          <div style="background:#0d1f0d;border:1px solid rgba(34,197,94,.25);border-radius:10px;padding:14px 16px;">
            ${exerciseBurnTarget > 0 ? `
            <div style="font-family:'Montserrat',sans-serif;font-size:17px;font-weight:800;color:#fff;line-height:1.45;letter-spacing:-.01em;">
              Your diet deficit is
              <span style="color:#22C55E;">${Math.abs(deficit)} kcal/day</span>${plan.deficit_mode ? `<span style="font-size:12px;font-weight:500;color:#666;"> (${plan.deficit_mode})</span>` : ''}.
              To reach
              <span style="color:#FFD700;">0.5 kg/week</span>,
              burn an additional
              <span style="color:#F97316;">${exerciseBurnTarget} kcal/day</span>
              through exercise —<br>your
              <span style="color:#F97316;text-decoration:underline;text-underline-offset:3px;">Exercise Burn Target</span>.
            </div>` : `
            <div style="font-family:'Montserrat',sans-serif;font-size:17px;font-weight:800;color:#fff;line-height:1.45;">
              At your current deficit of
              <span style="color:#22C55E;">${Math.abs(deficit)} kcal/day</span>,
              you will lose approximately
              <span style="color:#FFD700;">${weeklyLoss} kg per week</span> — safe, sustainable progress.
            </div>`}
          </div>
          <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:7px 10px;">
            <span style="font-size:9px;color:#888;line-height:1.5;">⚕ ${bmiRiskNote}</span>
          </div>
          <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:7px 10px;">
            ${phaseNotes.map((note, i) => `
            <div style="display:flex;gap:6px;${i < 2 ? 'margin-bottom:4px;' : ''}">
              <div style="width:6px;height:6px;border-radius:50%;background:${['#F97316','#A855F7','#22C55E'][i]};flex-shrink:0;margin-top:3px;"></div>
              <span style="font-size:8.5px;color:#888;line-height:1.4;">${note}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-shrink:0;padding:0 4px;">
        <div style="display:flex;gap:4px;">🥕🍎🥦🍇🥑</div>
        <span style="font-size:8px;color:#444;">⚕ For informational purposes only · Consult a registered dietitian</span>
        <span style="font-family:'DM Mono',monospace;font-size:8.5px;color:#555;">Page 2 of 7</span>
      </div>

    </div>
  </div>`
}

// ─── PAGE 3 — OUR APPROACH ───────────────────────────────────────────────────

function page3(plan: MealPlan, intakeData: any): string {
  const { weight_kg, height_cm, age, gender, activity_level } = intakeData
  const bmr = gender === 'male'
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  const tdee = Math.round(bmr * activityMultiplier(activity_level))
  const deficit3 = plan.deficit_kcal ?? (plan.goal === 'lose' ? 500 : plan.goal === 'gain' ? -300 : 0)
  const exerciseBurn3 = plan.goal === 'lose' ? Math.max(0, 500 - Math.abs(deficit3)) : 0
  const totalDailyDeficit = Math.abs(deficit3) + exerciseBurn3
  const protG = plan.protein_target, carbG = plan.carbs_target, fatG = plan.fat_target
  const tCal = plan.target_calories

  const macros = [
    { name: 'Protein',       g: protG, pct: Math.round(protG * 4 / tCal * 100), color: '#22C55E' },
    { name: 'Carbohydrates', g: carbG, pct: Math.round(carbG * 4 / tCal * 100), color: '#F97316' },
    { name: 'Fats',          g: fatG,  pct: Math.round(fatG * 9 / tCal * 100),  color: '#A855F7' },
  ]
  const R = 38, CX = 48, CY = 48, STR = 11, circ = 2 * Math.PI * R
  let off = 0
  let dpaths = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#222" stroke-width="${STR}"/>`
  macros.forEach(m => {
    const dash = (m.pct / 100) * circ, gap = circ - dash
    const rot = (off / 100) * 360 - 90
    dpaths += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${m.color}" stroke-width="${STR}" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" transform="rotate(${rot.toFixed(1)} ${CX} ${CY})"/>`
    off += m.pct
  })

  const isVeg = (intakeData.diet_type ?? 'veg') === 'veg'
  const hm = height_cm / 100
  const bmiV = weight_kg / (hm * hm)
  const nutrients = [
    { name: 'Protein Adequacy', score: Math.min(100, Math.round(protG / weight_kg * 62.5)), color: '#22C55E' },
    { name: 'Iron',             score: isVeg ? 48 : (bmiV > 25 ? 52 : 74),                  color: '#EF4444' },
    { name: 'Fibre',            score: bmiV > 27 ? 44 : 68,                                  color: '#F97316' },
    { name: 'Vitamin D',        score: 38,                                                    color: '#EAB308' },
    { name: 'Calcium',          score: 62,                                                    color: '#3B82F6' },
    { name: 'Vitamin B12',      score: isVeg ? 32 : 54,                                      color: '#A855F7' },
  ]

  const proteinScore = nutrients[0].score
  const ironScore    = nutrients[1].score
  const fibreScore   = nutrients[2].score
  const b12Score     = nutrients[5].score

  const nutrientNotes = [
    `Protein (${proteinScore}%): ${proteinScore >= 80 ? 'Good. Your protein intake supports muscle retention during weight loss.' : 'Low. Increase paneer, dal, soy, or Greek yogurt daily.'}`,
    `Iron (${ironScore}%): ${isVeg ? 'Vegetarians absorb less iron. Eat iron-rich foods (spinach, rajma) with Vitamin C (lemon juice) to improve absorption.' : 'Include chicken liver or red meat 2× per week to maintain iron levels.'}`,
    `Fibre (${fibreScore}%): ${fibreScore < 60 ? 'Low fibre slows metabolism and increases hunger. Add oats, vegetables, and whole grains daily.' : 'Good fibre intake. This helps control hunger and blood sugar.'}`,
    `Vitamin D (38%): Most Indians are deficient. 20 min of morning sunlight daily is essential. Consider supplementation.`,
    `Calcium (62%): Add 2 servings of dairy or fortified foods daily.`,
    `Vitamin B12 (${b12Score}%): ${isVeg ? 'B12 is only in animal products. Supplementation is strongly recommended for vegetarians.' : 'Maintain B12 through eggs, fish, and meat regularly.'}`,
  ]

  const n = nutrients.length, CX2 = 100, CY2 = 85, MR = 65
  let rh = ''
  ;[0.25, 0.5, 0.75, 1].forEach(r => {
    let pts = ''
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      pts += `${(CX2 + Math.cos(a) * MR * r).toFixed(1)},${(CY2 + Math.sin(a) * MR * r).toFixed(1)} `
    }
    rh += `<polygon points="${pts.trim()}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`
  })
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    rh += `<line x1="${CX2}" y1="${CY2}" x2="${(CX2 + Math.cos(a) * MR).toFixed(1)}" y2="${(CY2 + Math.sin(a) * MR).toFixed(1)}" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`
  }
  let dpts = ''
  nutrients.forEach((nu, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const r2 = MR * (nu.score / 100)
    dpts += `${(CX2 + Math.cos(a) * r2).toFixed(1)},${(CY2 + Math.sin(a) * r2).toFixed(1)} `
  })
  rh += `<polygon points="${dpts.trim()}" fill="rgba(168,85,247,.18)" stroke="#A855F7" stroke-width="1.5"/>`
  nutrients.forEach((nu, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const r2 = MR * (nu.score / 100)
    const lx = (CX2 + Math.cos(a) * (MR + 16)).toFixed(1)
    const ly = (CY2 + Math.sin(a) * (MR + 16)).toFixed(1)
    rh += `<circle cx="${(CX2 + Math.cos(a) * r2).toFixed(1)}" cy="${(CY2 + Math.sin(a) * r2).toFixed(1)}" r="3" fill="${nu.color}"/>`
    rh += `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.5)" font-family="Inter,sans-serif">${nu.name.split(' ')[0]}</text>`
  })

  return `
  <div class="page">
    ${pageHeader('Our Approach To Your Transformation', 'Macro targets, energy model &amp; 3-phase roadmap')}

    <div style="flex:1;background:#000;padding:14px 20px 10px;display:flex;flex-direction:column;gap:10px;overflow:hidden;">

      <div style="display:flex;flex-direction:column;gap:10px;flex-shrink:0;">
        <div class="card card-accent-purple">
          <div class="label">Daily Macro Targets</div>
          <div style="display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center;">
            <div style="position:relative;width:96px;height:96px;">
              <svg width="96" height="96" viewBox="0 0 96 96">${dpaths}</svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <span style="font-family:'DM Mono',monospace;font-size:18px;font-weight:500;color:#fff;line-height:1;">${tCal}</span>
                <span style="font-size:7.5px;color:#666;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;">kcal/day</span>
              </div>
            </div>
            <div>
              ${macros.map(m => `
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <div style="width:8px;height:8px;border-radius:2px;background:${m.color};flex-shrink:0;"></div>
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                    <span style="font-size:10.5px;color:#ddd;font-weight:500;">${m.name}</span>
                    <span style="font-family:'DM Mono',monospace;font-size:9.5px;color:#777;">${m.g}g · ${m.pct}%</span>
                  </div>
                  <div style="height:5px;background:#222;border-radius:99px;overflow:hidden;">
                    <div style="width:${m.pct}%;height:100%;background:${m.color};border-radius:99px;"></div>
                  </div>
                </div>
              </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="card card-accent-orange">
          <div class="label">Energy Foundation</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px;">
            <div style="background:#1a1a1a;border-radius:10px;padding:11px 12px;">
              <div style="font-family:'DM Mono',monospace;font-size:24px;font-weight:500;color:#F97316;line-height:1;">${tdee}</div>
              <div style="font-size:9px;color:#666;margin-top:3px;">TDEE kcal/day</div>
            </div>
            <div style="background:#1a1a1a;border-radius:10px;padding:11px 12px;">
              <div style="font-family:'DM Mono',monospace;font-size:24px;font-weight:500;color:#3B82F6;line-height:1;">${Math.round(bmr)}</div>
              <div style="font-size:9px;color:#666;margin-top:3px;">BMR kcal/day</div>
            </div>
          </div>
          <div style="background:#1a1a1a;border-radius:9px;padding:10px 12px;">
            <div style="font-size:9.5px;color:#aaa;line-height:1.6;">
              <strong style="color:#F97316;">TDEE</strong> is total calories burned daily including activity.<br>
              <strong style="color:#3B82F6;">BMR</strong> is the minimum energy your body needs at rest. Eating below BMR triggers muscle loss.
            </div>
          </div>
        </div>

        ${exerciseBurn3 > 0 ? `
        <div class="card card-accent-yellow">
          <div class="label">🔥 Exercise Burn Target — To Reach 0.5 kg/week</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
            <div style="background:#1a1a1a;border-radius:10px;padding:11px 12px;">
              <div style="font-family:'DM Mono',monospace;font-size:24px;font-weight:500;color:#A855F7;line-height:1;">${Math.abs(deficit3)}</div>
              <div style="font-size:9px;color:#666;margin-top:3px;">Diet Deficit kcal/day</div>
            </div>
            <div style="background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.3);border-radius:10px;padding:11px 12px;">
              <div style="font-family:'DM Mono',monospace;font-size:24px;font-weight:500;color:#F97316;line-height:1;">${exerciseBurn3}</div>
              <div style="font-size:9px;color:#F97316;margin-top:3px;font-weight:600;">Exercise Burn kcal/day</div>
            </div>
            <div style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);border-radius:10px;padding:11px 12px;">
              <div style="font-family:'DM Mono',monospace;font-size:24px;font-weight:500;color:#22C55E;line-height:1;">${totalDailyDeficit}</div>
              <div style="font-size:9px;color:#22C55E;margin-top:3px;font-weight:600;">Total Deficit kcal/day</div>
            </div>
          </div>
          <div style="background:#1a1a1a;border-radius:9px;padding:10px 12px;">
            <div style="font-size:9.5px;color:#aaa;line-height:1.6;">
              <strong style="color:#F97316;">Exercise Burn Target</strong> is the extra kcal you need to burn through movement to reach <strong style="color:#FFD700;">0.5 kg/week</strong> total loss.<br>
              Match this number using activities on Page 4 — e.g. a <strong style="color:#fff;">${Math.round(exerciseBurn3 / (4.3 * weight_kg / 60))} min brisk walk</strong> or <strong style="color:#fff;">${Math.round(exerciseBurn3 / (9.8 * weight_kg / 60))} min run</strong> achieves this daily.
            </div>
          </div>
        </div>` : ''}
      </div>

      <div class="card card-accent-blue" style="flex:1;min-height:0;">
        <div class="label">Micro-Nutrient Focus Areas — Adequacy Score</div>
        <div style="display:flex;flex-direction:column;gap:8px;height:calc(100% - 22px);">
          <div style="display:grid;grid-template-columns:1fr auto;gap:14px;align-items:start;">
            <div>
              ${nutrients.map(nu => `
              <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px;">
                <span style="font-size:9.5px;color:#ccc;width:130px;flex-shrink:0;">${nu.name}</span>
                <div style="flex:1;height:12px;background:#1a1a1a;border-radius:99px;overflow:hidden;">
                  <div style="width:${nu.score}%;height:100%;background:${nu.color};border-radius:99px;"></div>
                </div>
                <span style="font-family:'DM Mono',monospace;font-size:9.5px;color:${nu.color};width:32px;text-align:right;">${nu.score}%</span>
              </div>`).join('')}
            </div>
            <svg width="200" height="210" viewBox="0 0 200 200">${rh}</svg>
          </div>
          <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:8px 10px;flex:1;">
            <div style="font-size:9px;font-weight:600;color:#ccc;margin-bottom:5px;">What these scores mean for you:</div>
            ${nutrientNotes.map(note => `
            <div style="display:flex;gap:5px;margin-bottom:3px;">
              <div style="width:4px;height:4px;border-radius:50%;background:#22C55E;flex-shrink:0;margin-top:4px;"></div>
              <span style="font-size:8.5px;color:#888;line-height:1.4;">${note}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;padding:0 4px;">
        <span style="font-size:8px;color:#444;">Data sourced from IFCT 2017 · NIN India · CalorieIndia database</span>
        <span style="font-family:'DM Mono',monospace;font-size:8.5px;color:#555;">Page 3 of 7</span>
      </div>

    </div>
  </div>`
}

// ─── PAGE 4 — CALORIE BURN ENGINE ────────────────────────────────────────────

function page4(plan: MealPlan, intakeData: any): string {
  const { weight_kg, height_cm, age, gender, activity_level } = intakeData
  const W = weight_kg
  const burn = (met: number, mins: number) => Math.round(met * W * (mins / 60))
  const bmr = gender === 'male'
    ? 10 * W + 6.25 * height_cm - 5 * age + 5
    : 10 * W + 6.25 * height_cm - 5 * age - 161
  const tdee = Math.round(bmr * activityMultiplier(activity_level))

  // Exercise burn target: extra kcal/day needed to hit 0.5 kg/week total
  const deficit4 = plan.deficit_kcal ?? (plan.goal === 'lose' ? 500 : plan.goal === 'gain' ? -300 : 0)
  const exerciseBurn4 = plan.goal === 'lose' ? Math.max(0, 500 - Math.abs(deficit4)) : 0

  const exercises = [
    { name: 'Brisk Walk',      icon: '🚶', met: 4.3, color: '#22C55E', intensity: 'Moderate',   tip: 'Best starting point. 30 min daily builds the habit and burns significant calories.' },
    { name: 'Running',         icon: '🏃', met: 9.8, color: '#EF4444', intensity: 'High',        tip: 'Most efficient fat burner. Even 15 min of jogging makes a measurable difference.' },
    { name: 'Swimming',        icon: '🏊', met: 7.0, color: '#3B82F6', intensity: 'High',        tip: 'Full-body, joint-friendly. Ideal if overweight — less stress on knees.' },
    { name: 'Badminton',       icon: '🏸', met: 5.5, color: '#F97316', intensity: 'Moderate',   tip: 'Popular in India. Singles play burns significant calories at an active pace.' },
    { name: 'Cricket',         icon: '🏏', met: 4.8, color: '#A855F7', intensity: 'Moderate',   tip: 'Fielding + batting combined. Bowling adds short intensity bursts.' },
    { name: 'Weight Training', icon: '🏋', met: 5.0, color: '#EAB308', intensity: 'Moderate+',  tip: 'Builds muscle which raises BMR by 50–80 kcal/day permanently.' },
  ]
  const durations = [15, 30, 60]
  const timeColors = ['#3B82F6', '#F97316', '#22C55E']
  const strip = [
    { v: Math.round(bmr),              l: 'BMR (Rest)' },
    { v: tdee,                         l: 'TDEE (Daily)' },
    { v: burn(exercises[0].met, 30),   l: 'Walk 30 min' },
    { v: burn(exercises[1].met, 30),   l: 'Run 30 min' },
    { v: burn(exercises[3].met, 30),   l: 'Badminton 30 min' },
    { v: burn(exercises[5].met, 30),   l: 'Weights 30 min' },
  ]

  const VW = 680, VH = 240, PAD = { l: 34, r: 14, t: 12, b: 40 }
  const cw2 = VW - PAD.l - PAD.r, ch2 = VH - PAD.t - PAD.b
  const maxBurn = burn(exercises[1].met, 60) + 30
  const groupW = cw2 / exercises.length
  const barGap = 3
  const barW = (groupW - barGap * (durations.length + 1)) / durations.length
  const maxBurn60 = burn(exercises[1].met, 60)
  let s = ''
  for (let i = 0; i <= 5; i++) {
    const val = Math.round(maxBurn / 5 * i), y = PAD.t + ch2 - (val / maxBurn) * ch2
    s += `<line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${VW - PAD.r}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`
    s += `<text x="${PAD.l - 4}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="rgba(255,255,255,.25)" font-family="DM Mono,monospace">${val}</text>`
  }
  exercises.forEach((ex, gi) => {
    const gx = PAD.l + gi * groupW
    durations.forEach((dur, di) => {
      const cal = burn(ex.met, dur)
      const bh = (cal / maxBurn) * ch2
      const bx = gx + barGap + di * (barW + barGap)
      const by = PAD.t + ch2 - bh
      s += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${timeColors[di]}" opacity="0.85"/>`
      if (bh > 14) s += `<text x="${(bx + barW / 2).toFixed(1)}" y="${(by - 3).toFixed(1)}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.7)" font-family="DM Mono,monospace">${cal}</text>`
    })
    const lx = (gx + groupW / 2).toFixed(1)
    s += `<text x="${lx}" y="${VH - 26}" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.55)">${ex.icon}</text>`
    const words = ex.name.split(' ')
    if (words.length > 1) {
      s += `<text x="${lx}" y="${VH - 13}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.35)" font-family="Inter,sans-serif">${words[0]}</text>`
      s += `<text x="${lx}" y="${VH - 4}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.35)" font-family="Inter,sans-serif">${words.slice(1).join(' ')}</text>`
    } else {
      s += `<text x="${lx}" y="${VH - 8}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.35)" font-family="Inter,sans-serif">${ex.name}</text>`
    }
  })
  durations.forEach((d, i) => {
    s += `<rect x="${PAD.l + i * 64}" y="${VH - 1}" width="9" height="5" rx="2" fill="${timeColors[i]}" opacity=".85"/>`
    s += `<text x="${PAD.l + i * 64 + 12}" y="${VH + 4}" font-size="7.5" fill="rgba(255,255,255,.4)" font-family="Inter,sans-serif">${d} min</text>`
  })

  return `
  <div class="page">
    ${pageHeader('Your Calorie Burn Engine', 'Energy expenditure at current body weight', '· Walk · Run · Swim · Badminton · Cricket · Weight Training')}

    <div style="flex:1;background:#000;padding:12px 20px 10px;display:flex;flex-direction:column;gap:9px;overflow:hidden;">

      ${exerciseBurn4 > 0 ? `
      <div style="background:linear-gradient(90deg,rgba(249,115,22,.15),rgba(249,115,22,.05));border:1px solid rgba(249,115,22,.35);border-radius:10px;padding:9px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div>
          <div style="font-size:9px;color:#F97316;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;">🔥 Exercise Burn Target</div>
          <div style="font-size:9px;color:#aaa;line-height:1.4;">Burn <strong style="color:#F97316;">${exerciseBurn4} kcal/day</strong> through exercise to reach <strong style="color:#FFD700;">0.5 kg/week</strong> total loss (diet + exercise combined).</div>
        </div>
        <div style="text-align:center;flex-shrink:0;margin-left:12px;">
          <div style="font-family:'DM Mono',monospace;font-size:28px;font-weight:500;color:#F97316;line-height:1;">${exerciseBurn4}</div>
          <div style="font-size:8px;color:#888;">kcal/day</div>
        </div>
      </div>` : ''}

      <div style="display:flex;gap:7px;flex-shrink:0;">
        ${strip.map((st, i) => `
        <div style="flex:1;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px 9px;text-align:center;">
          <div style="font-family:'DM Mono',monospace;font-size:${i < 2 ? '22' : '20'}px;font-weight:500;color:${i < 2 ? '#FFD700' : '#fff'};line-height:1;">${st.v}</div>
          <div style="font-size:9px;color:#666;margin-top:3px;text-transform:uppercase;letter-spacing:.05em;">${st.l}</div>
        </div>`).join('')}
      </div>

      <div class="card" style="flex-shrink:0;padding:9px 13px;">
        <div class="label" style="margin-bottom:7px;">Calories Burned — All Activities Compared (15 / 30 / 60 min)</div>
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#F97316,#EAB308,#22C55E);"></div>
        <svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" style="width:100%;display:block;height:160px;">${s}</svg>
      </div>

      <div style="flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:6px;min-height:0;overflow:hidden;">
        ${exercises.map(ex => {
          const burnRows = durations.map(dur => {
            const cal = burn(ex.met, dur)
            const pct = (cal / maxBurn60 * 100).toFixed(1)
            return `
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-size:9px;color:#666;width:24px;flex-shrink:0;">${dur}m</span>
              <div style="flex:1;height:5px;background:#1a1a1a;border-radius:99px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:${ex.color};border-radius:99px;"></div>
              </div>
              <span style="font-family:'DM Mono',monospace;font-size:10px;color:${ex.color};width:46px;text-align:right;">${cal} kcal</span>
            </div>`
          }).join('')
          return `
          <div class="card" style="padding:9px 10px;position:relative;">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${ex.color};border-radius:12px 12px 0 0;"></div>
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">
              <span style="font-size:13px;">${ex.icon}</span>
              <div>
                <div style="font-size:11px;font-weight:700;color:#eee;">${ex.name}</div>
                <div style="font-size:9px;color:#666;">MET ${ex.met} · <span style="background:${ex.color}22;color:${ex.color};border:1px solid ${ex.color}44;padding:1px 4px;border-radius:99px;font-size:8px;">${ex.intensity}</span></div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;">${burnRows}</div>
          </div>`
        }).join('')}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;padding:0 4px;">
        <span style="font-size:8px;color:#444;">MET values from Compendium of Physical Activities · Calories = MET × weight(kg) × hours</span>
        <span style="font-family:'DM Mono',monospace;font-size:8.5px;color:#555;">Page 4 of 7</span>
      </div>

    </div>
  </div>`
}

// ─── PAGE 5 — THE 80/20 APPROACH ─────────────────────────────────────────────

function page5(plan: MealPlan, intakeData: any): string {
  const { weight_kg, height_cm, age, gender, activity_level } = intakeData
  const bmr = gender === 'male'
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  const tdee = Math.round(bmr * activityMultiplier(activity_level))
  // Use safe deficit
  const totalDef = plan.deficit_kcal ?? (plan.goal === 'lose' ? 500 : plan.goal === 'gain' ? -300 : 0)
  const dietDef  = Math.round(Math.abs(totalDef) * 0.8)
  const exerDef  = Math.round(Math.abs(totalDef) * 0.2)
  const tc = plan.target_calories

  const W = weight_kg
  const burnFn = (met: number, mins: number) => Math.round(met * W * (mins / 60))
  const walkBurnPer30 = burnFn(4.3, 30)
  const runBurnPer30  = burnFn(9.8, 30)
  const walkMinsFor100 = walkBurnPer30 > 0 ? Math.round(100 / walkBurnPer30 * 30) : 0
  const runMinsFor100  = runBurnPer30 > 0  ? Math.round(100 / runBurnPer30  * 30) : 0
  // Use actual deficit for diet, and exercise burn target (to reach 0.5 kg/week) for exercise
  const dietKcal = Math.abs(totalDef)
  const exerKcal = plan.goal === 'lose' ? Math.max(0, 500 - Math.abs(totalDef)) : Math.round(Math.abs(totalDef) * 0.2)
  const daysPerKg = totalDef !== 0 ? Math.round(7700 / Math.abs(totalDef)) : 0

  const mealSlots = [
    { meal: 'Breakfast', pct: 0.25, icon: '☀️', color: '#F97316', bg: 'rgba(249,115,22,.12)', bd: 'rgba(249,115,22,.3)' },
    { meal: 'Lunch',     pct: 0.35, icon: '🍱', color: '#22C55E', bg: 'rgba(34,197,94,.12)',  bd: 'rgba(34,197,94,.3)'  },
    { meal: 'Snacks',    pct: 0.20, icon: '🍎', color: '#3B82F6', bg: 'rgba(59,130,246,.12)', bd: 'rgba(59,130,246,.3)' },
    { meal: 'Dinner',    pct: 0.20, icon: '🌙', color: '#A855F7', bg: 'rgba(168,85,247,.12)', bd: 'rgba(168,85,247,.3)' },
  ]

  const swaps = [
    { bad: 'White rice (200g) — 260 kcal', good: 'Brown rice (200g) — 218 kcal', save: 'Save 42 kcal' },
    { bad: 'Full-fat milk (250ml) — 150 kcal', good: 'Toned milk (250ml) — 90 kcal', save: 'Save 60 kcal' },
    { bad: 'Maida roti (2) — 180 kcal', good: 'Wheat roti (2) — 140 kcal', save: 'Save 40 kcal' },
    { bad: 'Packaged biscuits (4) — 180 kcal', good: 'Roasted chana (30g) — 120 kcal', save: 'Save 60 kcal' },
    { bad: 'Fried samosa (2) — 260 kcal', good: 'Baked mathri (2) — 160 kcal', save: 'Save 100 kcal' },
    { bad: 'Packaged fruit juice (200ml) — 110 kcal', good: 'Whole fruit (1 medium) — 60 kcal', save: 'Save 50 kcal' },
  ]

  return `
  <div class="page">
    ${pageHeader('The 80 / 20 Calorie Approach', '80% through food choices · 20% through movement — sustainable,', 'no crash diets, no extreme workout')}

    <div style="flex:1;background:#000;padding:13px 20px 10px;display:flex;flex-direction:column;gap:10px;overflow:hidden;">

      <div class="card card-accent-green" style="flex-shrink:0;">
        <div class="label">The Core Philosophy</div>
        <div style="height:34px;border-radius:8px;overflow:hidden;display:flex;margin-bottom:10px;">
          <div style="width:80%;background:linear-gradient(90deg,#15532e,#22C55E);display:flex;align-items:center;justify-content:center;">
            <span style="font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:#fff;">80% &nbsp;<span style="font-size:10px;font-weight:400;color:rgba(255,255,255,.7);">Diet &amp; Food Choices</span></span>
          </div>
          <div style="width:20%;background:linear-gradient(90deg,#7c2d12,#F97316);display:flex;align-items:center;justify-content:center;">
            <span style="font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:#fff;">20%</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div style="background:#1a1a1a;border-radius:9px;padding:10px 12px;">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
              <div style="width:8px;height:8px;border-radius:50%;background:#22C55E;"></div>
              <span style="font-size:10px;font-weight:700;color:#22C55E;">80% — What You Eat</span>
            </div>
            <p style="font-size:11px;color:#888;line-height:1.5;">Your calorie deficit is driven primarily by food — what you pick, how much, and when. This is the controllable lever.</p>
          </div>
          <div style="background:#1a1a1a;border-radius:9px;padding:10px 12px;">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
              <div style="width:8px;height:8px;border-radius:50%;background:#F97316;"></div>
              <span style="font-size:10px;font-weight:700;color:#F97316;">20% — How You Move</span>
            </div>
            <p style="font-size:11px;color:#888;line-height:1.5;">Exercise accelerates results and builds muscle, but you cannot out-train a bad diet. Achievable with just 30 min daily.</p>
          </div>
        </div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,215,0,.12),rgba(255,215,0,.05));border:1px solid rgba(255,215,0,.3);border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div>
          <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:3px;">Your Daily Calorie Target</div>
          <div style="font-family:'DM Mono',monospace;font-size:34px;font-weight:500;color:#FFD700;line-height:1;">${tc} <span style="font-size:14px;color:#888;">kcal</span></div>
          ${plan.deficit_mode ? `<div style="font-size:9px;color:#888;margin-top:2px;">${plan.deficit_mode}</div>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 20px 1fr 20px 1fr;gap:0;align-items:center;">
          ${[
            { pct: '80%', val: `${dietDef}`, lbl: 'from Diet', color: '#22C55E' },
            null,
            { pct: '20%', val: `${exerDef}`, lbl: 'from Exercise', color: '#F97316' },
            null,
            { pct: '=', val: `${Math.abs(totalDef)}`, lbl: 'kcal deficit', color: '#A855F7' },
          ].map((item, i) => item === null
            ? `<div style="text-align:center;font-size:16px;color:#555;">${i === 1 ? '+' : '='}</div>`
            : `<div style="background:#111;border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:7px 10px;text-align:center;">
                <div style="font-size:8px;color:${item.color};font-weight:700;margin-bottom:2px;">${item.pct}</div>
                <div style="font-family:'DM Mono',monospace;font-size:15px;color:${item.color};line-height:1;">${item.val}</div>
                <div style="font-size:8px;color:#666;margin-top:2px;">${item.lbl}</div>
              </div>`
          ).join('')}
        </div>
      </div>

      <div class="card card-accent-yellow" style="flex-shrink:0;">
        <div class="label">How To Choose — Your Meal Slot Breakdown</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          ${mealSlots.map(m => `
          <div style="border-radius:10px;padding:11px;text-align:center;background:${m.bg};border:1px solid ${m.bd};position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${m.color};"></div>
            <div style="font-size:20px;margin-bottom:5px;">${m.icon}</div>
            <div style="font-size:10.5px;font-weight:700;color:#eee;margin-bottom:3px;">${m.meal}</div>
            <div style="font-family:'DM Mono',monospace;font-size:18px;color:${m.color};margin-bottom:4px;">${Math.round(tc * m.pct)} kcal</div>
            <div style="font-size:10px;color:#888;">${Math.round(m.pct * 100)}% of daily target</div>
          </div>`).join('')}
        </div>
        <div style="margin-top:8px;background:#1a1a1a;border-radius:9px;padding:8px 11px;display:flex;align-items:center;gap:9px;">
          <span style="font-size:17px;flex-shrink:0;">📖</span>
          <p style="font-size:9px;color:#888;line-height:1.5;"><strong style="color:#ccc;">Pages 6–7 give you curated food options for each meal slot</strong> — all calories verified against the Nutrition Tracker IFCT 2017 database. Pick any food that hits your slot target. Mix and match daily to prevent boredom.</p>
        </div>
      </div>

      <div class="card" style="flex-shrink:0;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#FFD700,transparent);"></div>
        <div class="label">Smart Food Swaps — Same Satisfaction, Fewer Calories</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
          ${swaps.map(sw => `
          <div style="background:#1a1a1a;border-radius:9px;padding:9px 11px;">
            <div style="font-size:11px;color:#EF4444;margin-bottom:3px;display:flex;align-items:center;gap:4px;"><span>❌</span>${sw.bad}</div>
            <div style="font-size:11px;color:#22C55E;margin-bottom:4px;display:flex;align-items:center;gap:4px;"><span>✅</span>${sw.good}</div>
            <span style="font-size:8px;background:rgba(34,197,94,.15);color:#22C55E;border:1px solid rgba(34,197,94,.3);padding:2px 8px;border-radius:99px;">${sw.save}</span>
          </div>`).join('')}
        </div>
      </div>

      <div style="background:#111;border-left:3px solid #FFD700;border:1px solid rgba(255,215,0,.2);border-left:3px solid #FFD700;border-radius:0 8px 8px 0;padding:8px 11px;flex:1;min-height:0;">
        <div style="font-size:9px;font-weight:600;color:#FFD700;margin-bottom:5px;">Understanding Your Calorie Gap</div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;gap:5px;">
            <div style="width:4px;height:4px;border-radius:50%;background:#22C55E;flex-shrink:0;margin-top:4px;"></div>
            <span style="font-size:11px;color:#888;line-height:1.5;">Your <strong style="color:#22C55E;">${dietKcal} kcal</strong> diet deficit means eating ${dietKcal} fewer calories than your TDEE of <strong style="color:#F97316;">${tdee} kcal/day</strong> — achieved by following your meal plan exactly.</span>
          </div>
          <div style="display:flex;gap:5px;">
            <div style="width:4px;height:4px;border-radius:50%;background:#F97316;flex-shrink:0;margin-top:4px;"></div>
            <span style="font-size:11px;color:#888;line-height:1.5;">Your <strong style="color:#F97316;">${exerKcal} kcal</strong> exercise burn target = approximately <strong style="color:#fff;">${walkBurnPer30 > 0 ? Math.round(exerKcal / walkBurnPer30 * 30) : 0} min brisk walk</strong> OR <strong style="color:#fff;">${runBurnPer30 > 0 ? Math.round(exerKcal / runBurnPer30 * 30) : 0} min jogging</strong> daily.</span>
          </div>
          <div style="display:flex;gap:5px;">
            <div style="width:4px;height:4px;border-radius:50%;background:#A855F7;flex-shrink:0;margin-top:4px;"></div>
            <span style="font-size:11px;color:#888;line-height:1.5;">On a typical day at <strong style="color:#fff;">${weight_kg}kg</strong>: you burn <strong style="color:#F97316;">${tdee} kcal</strong> just by living and moving. Your meal plan gives you <strong style="color:#22C55E;">${tc} kcal</strong>. The <strong style="color:#FFD700;">${Math.abs(totalDef)} kcal</strong> gap is your daily fat-burning engine.</span>
          </div>
          <div style="display:flex;gap:5px;">
            <div style="width:4px;height:4px;border-radius:50%;background:#FFD700;flex-shrink:0;margin-top:4px;"></div>
            <span style="font-size:11px;color:#888;line-height:1.5;">1 kg of body fat = <strong style="color:#fff;">7,700 kcal</strong>. At <strong style="color:#FFD700;">${Math.abs(totalDef)} kcal/day</strong> deficit, you will burn 1 kg of fat every <strong style="color:#22C55E;">${daysPerKg} days</strong>.</span>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;padding:0 4px;">
        <span style="font-size:8px;color:#444;">Calorie values from IFCT 2017 · NIN India</span>
        <span style="font-family:'DM Mono',monospace;font-size:8.5px;color:#555;">Page 5 of 7</span>
      </div>

    </div>
  </div>`
}

// ─── PAGE 6 — FOOD LIBRARY ───────────────────────────────────────────────────

function page6(plan: MealPlan, intakeData: any): string {
  const slotColors: Record<string, string> = { breakfast: '#F97316', lunch: '#22C55E', snacks: '#3B82F6', dinner: '#A855F7' }
  const slotIcons:  Record<string, string> = { breakfast: '☀️', lunch: '🍱', snacks: '🍎', dinner: '🌙' }
  const slotNames:  Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', snacks: 'Snacks', dinner: 'Dinner' }
  const dietDisplay = (intakeData.diet_type ?? 'veg') === 'veg' ? 'Veg' : (intakeData.diet_type === 'non-veg' ? 'Non-Veg' : 'Both')

  const slotKcal = {
    breakfast: plan.days[0].breakfast.reduce((s, f) => s + f.calories, 0),
    lunch:     plan.days[0].lunch.reduce((s, f) => s + f.calories, 0),
    snacks:    plan.days[0].snacks.reduce((s, f) => s + f.calories, 0),
    dinner:    plan.days[0].dinner.reduce((s, f) => s + f.calories, 0),
  }

  function getUniqueFoodsForSlot(slot: 'breakfast'|'lunch'|'snacks'|'dinner', max: number): MealFood[] {
    const seen = new Set<string>()
    const result: MealFood[] = []
    for (const day of plan.days) {
      for (const food of day[slot]) {
        if (!seen.has(food.name) && result.length < max) {
          seen.add(food.name)
          result.push(food)
        }
      }
    }
    return result
  }

  function renderSlotTable(slot: 'breakfast'|'lunch'|'snacks'|'dinner'): string {
    const color = slotColors[slot]
    const foods = getUniqueFoodsForSlot(slot, 10)
    const kcal  = slotKcal[slot as keyof typeof slotKcal]

    return `
    <div style="background:#111;border:1px solid rgba(255,255,255,.1);border-radius:12px;position:relative;overflow:hidden;display:flex;flex-direction:column;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${color};"></div>
      <div style="padding:8px 10px 5px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:5px;">
          <span style="font-size:13px;">${slotIcons[slot]}</span>
          <span style="font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;color:${color};">${slotNames[slot]}</span>
          <span style="font-family:'DM Mono',monospace;font-size:9px;color:#888;">${kcal} kcal</span>
        </div>
        <span style="font-size:7px;font-weight:600;padding:2px 6px;border-radius:99px;background:${color}20;color:${color};border:1px solid ${color}44;">${dietDisplay}</span>
      </div>
      <div style="flex:1;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#1a1a1a;">
              <th style="padding:4px 6px;font-size:7px;text-align:left;color:#555;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06);">#</th>
              <th style="padding:4px 6px;font-size:7px;text-align:left;color:#555;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06);">Meal Name</th>
              <th style="padding:4px 6px;font-size:7px;text-align:center;color:#FFD700;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06);">Kcal</th>
              <th style="padding:4px 6px;font-size:7px;text-align:center;color:${color};letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06);">Grams</th>
              <th style="padding:4px 6px;font-size:7px;text-align:center;color:#22C55E;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06);">Prot</th>
              <th style="padding:4px 6px;font-size:7px;text-align:center;color:#F97316;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06);">Carb</th>
              <th style="padding:4px 6px;font-size:7px;text-align:center;color:#A855F7;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06);">Fat</th>
              <th style="padding:4px 6px;font-size:7px;text-align:center;color:#555;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06);">Macros</th>
            </tr>
          </thead>
          <tbody>
            ${foods.map((food, idx) => {
              const total = food.protein_g * 4 + food.carbs_g * 4 + food.fat_g * 9 || 1
              const pP = Math.round(food.protein_g * 4 / total * 100)
              const pC = Math.round(food.carbs_g * 4 / total * 100)
              const pF = 100 - pP - pC
              return `
              <tr style="border-bottom:1px solid rgba(255,255,255,.04);">
                <td style="padding:4px 6px;font-size:8px;color:#555;">${String(idx + 1).padStart(2,'0')}</td>
                <td style="padding:4px 6px;font-size:8.5px;color:#ddd;font-weight:500;">${food.name}</td>
                <td style="padding:4px 6px;text-align:center;">
                  <span style="font-family:'DM Mono',monospace;font-size:8px;font-weight:700;color:#FFD700;">${food.calories}</span>
                </td>
                <td style="padding:4px 6px;text-align:center;">
                  <span style="font-family:'DM Mono',monospace;font-size:8px;font-weight:600;padding:1px 6px;border-radius:99px;background:${color}18;color:${color};border:1px solid ${color}44;">${food.serving_display}</span>
                </td>
                <td style="padding:4px 6px;font-size:8px;text-align:center;font-family:'DM Mono',monospace;color:#22C55E;">${food.protein_g}g</td>
                <td style="padding:4px 6px;font-size:8px;text-align:center;font-family:'DM Mono',monospace;color:#F97316;">${food.carbs_g}g</td>
                <td style="padding:4px 6px;font-size:8px;text-align:center;font-family:'DM Mono',monospace;color:#A855F7;">${food.fat_g}g</td>
                <td style="padding:4px 6px;text-align:center;">
                  <div style="display:flex;flex-direction:column;gap:1.5px;width:44px;">
                    <div style="display:flex;align-items:center;gap:2px;"><span style="font-size:6px;color:#555;width:7px;text-align:right;">P</span><div style="flex:1;height:3px;background:#1a1a1a;border-radius:99px;overflow:hidden;"><div style="width:${pP}%;height:100%;background:#22C55E;"></div></div></div>
                    <div style="display:flex;align-items:center;gap:2px;"><span style="font-size:6px;color:#555;width:7px;text-align:right;">C</span><div style="flex:1;height:3px;background:#1a1a1a;border-radius:99px;overflow:hidden;"><div style="width:${pC}%;height:100%;background:#F97316;"></div></div></div>
                    <div style="display:flex;align-items:center;gap:2px;"><span style="font-size:6px;color:#555;width:7px;text-align:right;">F</span><div style="flex:1;height:3px;background:#1a1a1a;border-radius:99px;overflow:hidden;"><div style="width:${pF}%;height:100%;background:#A855F7;"></div></div></div>
                  </div>
                </td>
              </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`
  }

  return `
  <div class="page">
    ${pageHeader('Your Food Library', 'Calorie-controlled options · Each food scaled to your daily target · Pick one item per day')}

    <div style="flex:1;background:#000;padding:13px 20px 10px;display:flex;flex-direction:column;gap:8px;overflow:hidden;">

      <div style="display:flex;gap:7px;flex-shrink:0;">
        ${(Object.entries(slotKcal) as [string,number][]).map(([slot, kcal]) => `
        <div style="flex:1;background:#111;border:1px solid ${slotColors[slot]}33;border-radius:10px;padding:8px 10px;text-align:center;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${slotColors[slot]};"></div>
          <div style="font-size:9px;color:#666;text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px;">${slotNames[slot]}</div>
          <div style="font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:${slotColors[slot]};">${kcal} kcal</div>
          <div style="font-size:7.5px;color:#555;margin-top:1px;">slot budget</div>
        </div>`).join('')}
        <div style="flex:1.5;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.25);border-radius:10px;padding:8px 10px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:20px;">🎯</span>
          <div>
            <div style="font-size:8.5px;color:#888;margin-bottom:1px;">Plan Goal</div>
            <div style="font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:#FFD700;">${plan.goal_label}</div>
            <div style="font-size:8px;color:#666;">${plan.target_calories} kcal/day</div>
          </div>
        </div>
      </div>

      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;min-height:0;">
        ${renderSlotTable('breakfast')}
        ${renderSlotTable('lunch')}
        ${renderSlotTable('snacks')}
        ${renderSlotTable('dinner')}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;padding:0 4px;">
        <span style="font-size:8px;color:#444;">Calorie values from Nutrition Tracker IFCT 2017 database · Servings scaled to your personal target</span>
        <span style="font-family:'DM Mono',monospace;font-size:8.5px;color:#555;">Page 6 of 7</span>
      </div>

    </div>
  </div>`
}

// ─── PAGE 7 — 7-DAY MEAL SCHEDULE ────────────────────────────────────────────

function page7(plan: MealPlan): string {
  const goalLabel = plan.goal === 'lose' ? 'Weight Loss' : plan.goal === 'gain' ? 'Muscle Gain' : 'Maintenance'
  const dietDisplay = plan.diet_label ?? 'Indian'

  return `
  <div class="page">
    ${pageHeader('Your Complete 7-Day Meal Schedule', `${goalLabel} · ${plan.target_calories} kcal/day · ${dietDisplay} · Indian`)}

    <div style="flex:1;background:#000;padding:12px 20px 10px;display:flex;flex-direction:column;gap:9px;overflow:hidden;">

      <div style="flex:1;overflow:hidden;border-radius:10px;border:1px solid rgba(255,255,255,.08);">
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <colgroup>
            <col style="width:60px"/>
            <col/><col/><col/><col/>
            <col style="width:70px"/>
          </colgroup>
          <thead>
            <tr style="background:#1a1a1a;">
              <th style="padding:7px 6px;font-size:7.5px;text-align:left;color:#666;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.1);">Day</th>
              <th style="padding:7px 6px;font-size:7.5px;text-align:left;color:#F97316;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.1);">☀️ Breakfast</th>
              <th style="padding:7px 6px;font-size:7.5px;text-align:left;color:#22C55E;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.1);">🍱 Lunch</th>
              <th style="padding:7px 6px;font-size:7.5px;text-align:left;color:#3B82F6;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.1);">🍎 Snack</th>
              <th style="padding:7px 6px;font-size:7.5px;text-align:left;color:#A855F7;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.1);">🌙 Dinner</th>
              <th style="padding:7px 6px;font-size:7.5px;text-align:right;color:#666;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.1);">Total</th>
            </tr>
          </thead>
          <tbody>
            ${plan.days.map((day, i) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,.04);">
              <td style="padding:8px 6px;vertical-align:top;">
                <div style="font-family:'Montserrat',sans-serif;font-size:12px;font-weight:800;color:#FFD700;">${DAY_NAMES[i].slice(0,3)}</div>
                <div style="font-size:7.5px;color:#555;">Day ${i+1}</div>
              </td>
              <td style="padding:8px 6px;vertical-align:top;">
                ${day.breakfast.map(f => `<div style="font-size:9px;color:#eee;line-height:1.35;">${f.name}</div><div style="font-size:8px;color:#F97316;font-family:'DM Mono',monospace;">${f.serving_display} · ${f.calories}kcal</div>`).join('')}
              </td>
              <td style="padding:8px 6px;vertical-align:top;">
                ${day.lunch.map(f => `<div style="font-size:9px;color:#eee;line-height:1.35;">${f.name}</div><div style="font-size:8px;color:#22C55E;font-family:'DM Mono',monospace;">${f.serving_display} · ${f.calories}kcal</div>`).join('')}
              </td>
              <td style="padding:8px 6px;vertical-align:top;">
                ${day.snacks.map(f => `<div style="font-size:9px;color:#eee;line-height:1.35;">${f.name}</div><div style="font-size:8px;color:#3B82F6;font-family:'DM Mono',monospace;">${f.serving_display} · ${f.calories}kcal</div>`).join('')}
              </td>
              <td style="padding:8px 6px;vertical-align:top;">
                ${day.dinner.map(f => `<div style="font-size:9px;color:#eee;line-height:1.35;">${f.name}</div><div style="font-size:8px;color:#A855F7;font-family:'DM Mono',monospace;">${f.serving_display} · ${f.calories}kcal</div>`).join('')}
              </td>
              <td style="padding:8px 6px;text-align:right;vertical-align:top;">
                <div style="font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:#FFD700;">${day.total_calories}</div>
                <div style="font-size:7px;color:#555;">kcal</div>
                <div style="font-size:7.5px;color:#22C55E;margin-top:2px;">P: ${day.total_protein}g</div>
                <div style="font-size:7.5px;color:#F97316;">C: ${day.total_carbs}g</div>
                <div style="font-size:7.5px;color:#A855F7;">F: ${day.total_fat}g</div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div style="background:#111;border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:11px 14px;position:relative;overflow:hidden;flex-shrink:0;margin-top:auto;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#FFD700,#22C55E,#F97316);"></div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="flex:1;">
            <div style="font-family:'Montserrat',sans-serif;font-size:13px;font-weight:800;color:#fff;margin-bottom:4px;">
              <strong style="color:#FFD700;">Notes:</strong>
            </div>
            <p style="font-size:9px;color:#888;line-height:1.6;">
              This plan was built specifically for you — <strong style="color:#ddd;">${plan.user_name}</strong>, ${goalLabel}, ${plan.target_calories} kcal/day, ${dietDisplay} · Indian cuisine. Every serving size is already calculated. Every day is planned. Just follow the schedule above, weigh your portions once, and let the results follow.
            </p>
            <p style="font-size:8.5px;color:#555;margin-top:5px;font-style:italic;">For informational purposes only · Consult a registered dietitian before making significant dietary changes</p>
          </div>
          <div style="background:#1a1a1a;border-radius:11px;padding:10px 13px;text-align:center;border:1px solid rgba(255,255,255,.07);flex-shrink:0;">
            <span style="font-size:24px;display:block;margin-bottom:3px;">🎯</span>
            <div style="font-size:9px;font-weight:700;color:#fff;margin-bottom:2px;">Start Today</div>
            <div style="font-size:8px;color:#666;line-height:1.6;">Pick Day 1<br>Weigh portions<br>Hit ${plan.target_calories} kcal<br>Repeat 7 days</div>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;padding:0 4px;">
        <span style="font-size:8px;color:#444;">⚕ For informational purposes only · Consult a registered dietitian before making significant dietary changes</span>
        <span style="font-family:'DM Mono',monospace;font-size:8.5px;color:#555;">Page 7 of 7</span>
      </div>

    </div>
  </div>`
}

// ─── SINGLE EXPORT ────────────────────────────────────────────────────────────

export function renderTemplate(plan: MealPlan, intakeData?: any): string {
  const intake = intakeData ?? {
    weight_kg:      75,
    height_cm:      170,
    age:            28,
    gender:         'male',
    activity_level: 'moderately_active',
    target_weight:  70,
    target_calories: plan.target_calories,
    diet_type:      'veg',
  }

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
${page5(plan, intake)}
${page6(plan, intake)}
${page7(plan)}
</body>
</html>`
}
