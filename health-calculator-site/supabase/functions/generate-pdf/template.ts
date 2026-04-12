import { MealPlan, DayMeal, MealFood } from './planner.ts'

const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function macroBar(protein: number, carbs: number, fat: number): string {
  const total = protein * 4 + carbs * 4 + fat * 9
  if (total === 0) return ''
  const pPct = Math.round(protein * 4 / total * 100)
  const cPct = Math.round(carbs  * 4 / total * 100)
  const fPct = 100 - pPct - cPct
  return `
    <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin:4px 0;">
      <div style="width:${pPct}%;background:#0f6e56;"></div>
      <div style="width:${cPct}%;background:#f59e0b;"></div>
      <div style="width:${fPct}%;background:#ef4444;"></div>
    </div>
    <div style="display:flex;gap:12px;font-size:9px;color:#666;">
      <span>&#x1F7E2; Protein ${pPct}%</span>
      <span>&#x1F7E1; Carbs ${cPct}%</span>
      <span>&#x1F534; Fat ${fPct}%</span>
    </div>`
}

function foodRow(food: MealFood): string {
  return `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:5px 8px;font-size:11px;">${food.name}</td>
      <td style="padding:5px 8px;font-size:11px;text-align:right;color:#666;">${food.scaled_grams}${food.serving_unit}</td>
      <td style="padding:5px 8px;font-size:11px;text-align:right;font-weight:600;">${food.calories}</td>
      <td style="padding:5px 8px;font-size:11px;text-align:right;color:#0f6e56;">${food.protein_g}g</td>
      <td style="padding:5px 8px;font-size:11px;text-align:right;color:#f59e0b;">${food.carbs_g}g</td>
      <td style="padding:5px 8px;font-size:11px;text-align:right;color:#ef4444;">${food.fat_g}g</td>
    </tr>`
}

function mealSection(label: string, emoji: string, foods: MealFood[]): string {
  if (!foods.length) return ''
  const totalCals = foods.reduce((s, f) => s + f.calories, 0)
  return `
    <div style="margin-bottom:14px;">
      <div style="font-size:12px;font-weight:700;color:#0f6e56;margin-bottom:6px;padding:4px 8px;background:#f0faf6;border-radius:4px;">
        ${emoji} ${label} &middot; ${totalCals} kcal
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="padding:4px 8px;font-size:10px;text-align:left;color:#888;">Food</th>
            <th style="padding:4px 8px;font-size:10px;text-align:right;color:#888;">Amount</th>
            <th style="padding:4px 8px;font-size:10px;text-align:right;color:#888;">kcal</th>
            <th style="padding:4px 8px;font-size:10px;text-align:right;color:#0f6e56;">Protein</th>
            <th style="padding:4px 8px;font-size:10px;text-align:right;color:#f59e0b;">Carbs</th>
            <th style="padding:4px 8px;font-size:10px;text-align:right;color:#ef4444;">Fat</th>
          </tr>
        </thead>
        <tbody>
          ${foods.map(foodRow).join('')}
        </tbody>
      </table>
    </div>`
}

function dayPage(day: DayMeal, index: number): string {
  return `
    <div style="page-break-before:always;padding:10px 0;">
      <div style="display:flex;justify-content:space-between;align-items:center;
                  border-bottom:2px solid #0f6e56;padding-bottom:8px;margin-bottom:16px;">
        <h2 style="margin:0;font-size:18px;color:#0f6e56;">
          Day ${index + 1} &mdash; ${DAY_NAMES[index]}
        </h2>
        <div style="text-align:right;">
          <div style="font-size:13px;font-weight:700;">${day.total_calories} kcal</div>
          <div style="font-size:10px;color:#666;">P: ${day.total_protein}g &middot; C: ${day.total_carbs}g &middot; F: ${day.total_fat}g</div>
        </div>
      </div>
      ${macroBar(day.total_protein, day.total_carbs, day.total_fat)}
      <div style="height:12px;"></div>
      ${mealSection('Breakfast', '&#x1F305;', day.breakfast)}
      ${mealSection('Lunch',     '&#x2600;&#xFE0F;', day.lunch)}
      ${mealSection('Dinner',    '&#x1F319;', day.dinner)}
      ${mealSection('Snacks',    '&#x1F34E;', day.snacks)}
    </div>`
}

export function renderTemplate(plan: MealPlan): string {
  const tipsMap: Record<string, string[]> = {
    lose: [
      'Drink 2-3 litres of water daily - thirst is often mistaken for hunger.',
      'Eat slowly and stop at 80% full (the Japanese "Hara Hachi Bu" principle).',
      'Prioritise protein at every meal - it keeps you fuller for longer.',
      'Avoid liquid calories: juices, chai with sugar, and soft drinks add up quickly.',
      'Take a 10-minute walk after each meal to improve insulin sensitivity.'
    ],
    gain: [
      'Eat within 30 minutes of your workout - your muscles need fuel to grow.',
      'Add healthy calorie-dense foods: nuts, ghee, banana, and full-fat dairy.',
      'Aim for 7-9 hours of sleep - growth hormone peaks during deep sleep.',
      'Track your lifts in the gym - progressive overload drives muscle growth.',
      'Spread protein intake across all meals rather than one large serving.'
    ],
    maintain: [
      'Consistency matters more than perfection - one off day won\'t derail progress.',
      'Eat whole foods 80% of the time; enjoy treats mindfully the other 20%.',
      'Regular strength training preserves muscle mass as you age.',
      'Monitor your weight weekly, not daily - natural fluctuations are normal.',
      'Seasonal Indian produce is nutritionally superior and budget-friendly.'
    ]
  }
  const tips = tipsMap[plan.goal] ?? tipsMap['maintain']

  const proteinPct  = Math.round(plan.protein_target * 4 / plan.target_calories * 100)
  const carbsPct    = Math.round(plan.carbs_target   * 4 / plan.target_calories * 100)
  const fatPct      = Math.round(plan.fat_target     * 9 / plan.target_calories * 100)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 15mm 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 28px; }
  h2 { font-size: 18px; }
  h3 { font-size: 14px; }
  table { border-collapse: collapse; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;
            align-items:center;text-align:center;padding:40px;">
  <div style="font-size:32px;font-weight:800;color:#0f6e56;letter-spacing:-1px;margin-bottom:4px;">
    CalorieIndia
  </div>
  <div style="font-size:13px;color:#888;margin-bottom:48px;">Your personalised nutrition companion</div>

  <h1 style="color:#1a1a1a;margin-bottom:8px;">7-Day Meal Plan</h1>
  <div style="font-size:20px;color:#0f6e56;font-weight:600;margin-bottom:32px;">
    ${plan.goal_label} &middot; ${plan.target_calories} kcal/day
  </div>

  <div style="background:#f0faf6;border:1px solid #0f6e56;border-radius:12px;
              padding:24px 40px;margin-bottom:40px;min-width:300px;">
    <div style="font-size:22px;font-weight:700;margin-bottom:4px;">
      ${plan.user_name}
    </div>
    <div style="font-size:13px;color:#666;">
      ${plan.diet_label} &middot; ${plan.cuisine_labels.join(', ')}
    </div>
  </div>

  <div style="display:flex;gap:24px;margin-bottom:48px;">
    <div style="text-align:center;">
      <div style="font-size:22px;font-weight:700;color:#0f6e56;">${plan.target_calories}</div>
      <div style="font-size:11px;color:#888;">kcal/day</div>
    </div>
    <div style="width:1px;background:#ddd;"></div>
    <div style="text-align:center;">
      <div style="font-size:22px;font-weight:700;color:#0f6e56;">${plan.protein_target}g</div>
      <div style="font-size:11px;color:#888;">protein/day</div>
    </div>
    <div style="width:1px;background:#ddd;"></div>
    <div style="text-align:center;">
      <div style="font-size:22px;font-weight:700;color:#0f6e56;">${plan.bmi}</div>
      <div style="font-size:11px;color:#888;">BMI &middot; ${plan.bmi_category}</div>
    </div>
  </div>

  <div style="font-size:11px;color:#aaa;">Generated on ${plan.generated_date}</div>
</div>

<!-- NUTRITION SUMMARY PAGE -->
<div style="page-break-before:always;padding:10px 0;">
  <h2 style="color:#0f6e56;border-bottom:2px solid #0f6e56;padding-bottom:8px;margin-bottom:20px;">
    Your Nutrition Profile
  </h2>

  <div style="display:flex;gap:20px;margin-bottom:24px;">
    <div style="flex:1;background:#f8f8f8;border-radius:8px;padding:16px;">
      <h3 style="color:#0f6e56;margin-bottom:12px;">Daily Targets</h3>
      <table style="width:100%;">
        <tr><td style="padding:4px 0;font-size:12px;color:#666;">TDEE (maintenance)</td>
            <td style="padding:4px 0;font-size:12px;font-weight:600;text-align:right;">${plan.tdee} kcal</td></tr>
        <tr><td style="padding:4px 0;font-size:12px;color:#666;">Target calories</td>
            <td style="padding:4px 0;font-size:13px;font-weight:700;color:#0f6e56;text-align:right;">${plan.target_calories} kcal</td></tr>
        <tr><td style="padding:4px 0;font-size:12px;color:#666;">Protein</td>
            <td style="padding:4px 0;font-size:12px;font-weight:600;text-align:right;">${plan.protein_target}g</td></tr>
        <tr><td style="padding:4px 0;font-size:12px;color:#666;">Carbohydrates</td>
            <td style="padding:4px 0;font-size:12px;font-weight:600;text-align:right;">${plan.carbs_target}g</td></tr>
        <tr><td style="padding:4px 0;font-size:12px;color:#666;">Fat</td>
            <td style="padding:4px 0;font-size:12px;font-weight:600;text-align:right;">${plan.fat_target}g</td></tr>
      </table>
    </div>
    <div style="flex:1;background:#f8f8f8;border-radius:8px;padding:16px;">
      <h3 style="color:#0f6e56;margin-bottom:12px;">Macro Split</h3>
      ${macroBar(plan.protein_target, plan.carbs_target, plan.fat_target)}
      <div style="height:16px;"></div>
      <div style="font-size:11px;color:#666;line-height:1.8;">
        <div>Protein: ${proteinPct}% of calories</div>
        <div>Carbs: ${carbsPct}% of calories</div>
        <div>Fat: ${fatPct}% of calories</div>
      </div>
    </div>
  </div>

  <div style="background:#fff8f0;border:1px solid #f59e0b;border-radius:8px;padding:16px;">
    <h3 style="color:#b45309;margin-bottom:12px;">Tips for ${plan.goal_label}</h3>
    <ol style="padding-left:16px;">
      ${tips.map(t => `<li style="font-size:11px;color:#666;margin-bottom:6px;">${t}</li>`).join('')}
    </ol>
  </div>
</div>

<!-- 7 DAY PAGES -->
${plan.days.map((day, i) => dayPage(day, i)).join('')}

<!-- FOOTER PAGE -->
<div style="page-break-before:always;padding:40px 0;text-align:center;">
  <div style="font-size:24px;font-weight:800;color:#0f6e56;margin-bottom:8px;">CalorieIndia</div>
  <div style="font-size:12px;color:#888;margin-bottom:24px;">calorieindia.in</div>
  <div style="font-size:11px;color:#aaa;max-width:400px;margin:0 auto;line-height:1.8;">
    This meal plan is generated based on your personal inputs using the Mifflin-St Jeor equation
    and standard nutritional guidelines. It is for informational purposes only and does not
    constitute medical or dietetic advice. Consult a registered dietitian before making
    significant dietary changes.
  </div>
</div>

</body>
</html>`
}
