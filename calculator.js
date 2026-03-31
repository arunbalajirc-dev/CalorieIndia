/* =========================================
   HealthCalc – calculator.js
   All calculator logic runs client-side.
   ========================================= */

// ── TAB SWITCHING ──────────────────────────
function showTab(id) {
  document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.currentTarget.classList.add('active');
}

// ── HELPERS ───────────────────────────────
function val(id) {
  return parseFloat(document.getElementById(id).value);
}

function showResult(boxId, html) {
  const box = document.getElementById(boxId);
  box.classList.remove('hidden');
  box.innerHTML = html;
}

function error(boxId, msg) {
  const box = document.getElementById(boxId);
  box.classList.remove('hidden');
  box.innerHTML = `<p class="error">⚠️ ${msg}</p>`;
}

// ── BMI ───────────────────────────────────
function toggleBmiUnits() {
  const unit = document.getElementById('bmi-unit').value;
  document.getElementById('bmi-metric').style.display   = unit === 'metric'   ? '' : 'none';
  document.getElementById('bmi-imperial').style.display = unit === 'imperial' ? '' : 'none';
}

function calculateBMI() {
  const unit = document.getElementById('bmi-unit').value;
  let heightM, weightKg;

  if (unit === 'metric') {
    const h = val('bmi-height-cm');
    const w = val('bmi-weight-kg');
    if (!h || !w || h <= 0 || w <= 0) return error('bmi-result', 'Please enter valid height and weight.');
    heightM  = h / 100;
    weightKg = w;
  } else {
    const ft  = val('bmi-height-ft') || 0;
    const ins = val('bmi-height-in') || 0;
    const lbs = val('bmi-weight-lbs');
    if (!lbs || (ft === 0 && ins === 0)) return error('bmi-result', 'Please enter valid height and weight.');
    heightM  = (ft * 12 + ins) * 0.0254;
    weightKg = lbs * 0.453592;
  }

  const bmi = weightKg / (heightM * heightM);
  const { label, advice } = bmiCategory(bmi);

  showResult('bmi-result', `
    <h3>Your BMI</h3>
    <div class="result-value">${bmi.toFixed(1)}</div>
    <span class="result-category">${label}</span>
    <p style="margin-top:.8rem;color:#475569;font-size:.9rem;">${advice}</p>
    <table style="margin-top:1rem;">
      <tr><td>Underweight</td><td>&lt; 18.5</td></tr>
      <tr><td>Normal weight</td><td>18.5 – 24.9</td></tr>
      <tr><td>Overweight</td><td>25 – 29.9</td></tr>
      <tr><td>Obese</td><td>≥ 30</td></tr>
    </table>
  `);
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', advice: 'Consider speaking with a healthcare provider about healthy weight gain strategies.' };
  if (bmi < 25)   return { label: 'Normal weight', advice: 'Great! Maintain your healthy weight with balanced nutrition and regular activity.' };
  if (bmi < 30)   return { label: 'Overweight', advice: 'Small lifestyle changes in diet and exercise can make a big difference.' };
  return           { label: 'Obese', advice: 'Consulting a healthcare professional is recommended for a personalized plan.' };
}

// ── BMR ───────────────────────────────────
function calculateBMR() {
  const gender   = document.getElementById('bmr-gender').value;
  const age      = val('bmr-age');
  const heightCm = val('bmr-height');
  const weightKg = val('bmr-weight');
  const activity = parseFloat(document.getElementById('bmr-activity').value);

  if (!age || !heightCm || !weightKg || age <= 0 || heightCm <= 0 || weightKg <= 0) {
    return error('bmr-result', 'Please fill in all fields with valid values.');
  }

  // Mifflin-St Jeor
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const tdee = bmr * activity;

  showResult('bmr-result', `
    <h3>Your BMR & Daily Calorie Needs</h3>
    <div class="result-value">${Math.round(bmr)} <span style="font-size:1rem;font-weight:500;">kcal/day</span></div>
    <span class="result-category">Basal Metabolic Rate</span>
    <p style="margin-top:.8rem;color:#475569;font-size:.9rem;">With your selected activity level, your estimated daily calorie need is:</p>
    <table style="margin-top:.6rem;">
      <tr><td>Maintenance (TDEE)</td><td>${Math.round(tdee)} kcal</td></tr>
      <tr><td>Weight loss (−500 kcal)</td><td>${Math.round(tdee - 500)} kcal</td></tr>
      <tr><td>Weight gain (+500 kcal)</td><td>${Math.round(tdee + 500)} kcal</td></tr>
    </table>
  `);
}

// ── BODY FAT ──────────────────────────────
function toggleBFFields() {
  const gender = document.getElementById('bf-gender').value;
  document.getElementById('bf-hip-group').style.display = gender === 'female' ? '' : 'none';
}

function calculateBodyFat() {
  const gender    = document.getElementById('bf-gender').value;
  const height    = val('bf-height');
  const neck      = val('bf-neck');
  const waist     = val('bf-waist');

  if (!height || !neck || !waist) return error('bf-result', 'Please enter height, neck, and waist measurements.');
  if (waist <= neck) return error('bf-result', 'Waist must be greater than neck circumference.');

  let bf;
  if (gender === 'male') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    const hip = val('bf-hip');
    if (!hip) return error('bf-result', 'Please enter hip measurement for females.');
    if (waist + hip <= neck) return error('bf-result', 'Please check your measurements.');
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }

  if (bf < 2 || bf > 70) return error('bf-result', 'Result out of range — please double-check your measurements.');

  const category = bfCategory(bf, gender);

  showResult('bf-result', `
    <h3>Estimated Body Fat</h3>
    <div class="result-value">${bf.toFixed(1)}%</div>
    <span class="result-category">${category}</span>
    <table style="margin-top:1rem;">
      ${gender === 'male'
        ? `<tr><td>Essential Fat</td><td>2–5%</td></tr>
           <tr><td>Athletic</td><td>6–13%</td></tr>
           <tr><td>Fitness</td><td>14–17%</td></tr>
           <tr><td>Average</td><td>18–24%</td></tr>
           <tr><td>Obese</td><td>≥25%</td></tr>`
        : `<tr><td>Essential Fat</td><td>10–13%</td></tr>
           <tr><td>Athletic</td><td>14–20%</td></tr>
           <tr><td>Fitness</td><td>21–24%</td></tr>
           <tr><td>Average</td><td>25–31%</td></tr>
           <tr><td>Obese</td><td>≥32%</td></tr>`
      }
    </table>
  `);
}

function bfCategory(bf, gender) {
  if (gender === 'male') {
    if (bf < 6)  return 'Essential Fat';
    if (bf < 14) return 'Athletic';
    if (bf < 18) return 'Fitness';
    if (bf < 25) return 'Average';
    return 'Obese';
  } else {
    if (bf < 14) return 'Essential Fat';
    if (bf < 21) return 'Athletic';
    if (bf < 25) return 'Fitness';
    if (bf < 32) return 'Average';
    return 'Obese';
  }
}

// ── IDEAL WEIGHT ──────────────────────────
function calculateIdealWeight() {
  const gender   = document.getElementById('iw-gender').value;
  const heightCm = val('iw-height');

  if (!heightCm || heightCm < 100) return error('iw-result', 'Please enter a valid height (≥ 100 cm).');

  const inchesOver5ft = (heightCm / 2.54) - 60; // inches above 5 ft

  // Devine formula
  const devine = gender === 'male'
    ? 50   + 2.3 * inchesOver5ft
    : 45.5 + 2.3 * inchesOver5ft;

  // Robinson formula
  const robinson = gender === 'male'
    ? 52   + 1.9 * inchesOver5ft
    : 49   + 1.7 * inchesOver5ft;

  // Miller formula
  const miller = gender === 'male'
    ? 56.2 + 1.41 * inchesOver5ft
    : 53.1 + 1.36 * inchesOver5ft;

  const avg = (devine + robinson + miller) / 3;
  const low = Math.min(devine, robinson, miller);
  const high = Math.max(devine, robinson, miller);

  showResult('iw-result', `
    <h3>Ideal Weight Range</h3>
    <div class="result-value">${low.toFixed(1)} – ${high.toFixed(1)} <span style="font-size:1rem;font-weight:500;">kg</span></div>
    <span class="result-category">Healthy Range</span>
    <table style="margin-top:1rem;">
      <tr><td>Devine formula</td><td>${devine.toFixed(1)} kg</td></tr>
      <tr><td>Robinson formula</td><td>${robinson.toFixed(1)} kg</td></tr>
      <tr><td>Miller formula</td><td>${miller.toFixed(1)} kg</td></tr>
      <tr><td>Average</td><td>${avg.toFixed(1)} kg</td></tr>
    </table>
  `);
}