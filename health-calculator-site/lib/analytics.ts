const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function supabaseInsert(table: string, data: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) console.warn('Supabase insert failed', await res.text());
  } catch (e) {
    console.warn('Supabase error', e);
  }
}

export async function trackCalc(
  type: string,
  inputs: Record<string, unknown>,
  resultValue: string | number,
  resultDetails?: Record<string, unknown>,
) {
  await supabaseInsert('calculator_leads', {
    calculator_type: type,
    age: inputs.age ?? null,
    gender: inputs.gender ?? null,
    weight_kg: inputs.weight ?? null,
    height_cm: inputs.height ?? null,
    activity_level: inputs.activity ?? null,
    result_value: String(resultValue),
    result_details: resultDetails ?? {},
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  });
}
