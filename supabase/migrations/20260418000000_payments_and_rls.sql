-- payments table for Razorpay order tracking
CREATE TABLE IF NOT EXISTS payments (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  user_plan_id         UUID REFERENCES user_plans(id),
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  amount               INTEGER DEFAULT 249,
  status               TEXT DEFAULT 'created'
);

-- Add any missing columns if table pre-existed
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_plan_id         UUID REFERENCES user_plans(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id    TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id  TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_signature   TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount               INTEGER DEFAULT 249;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status               TEXT DEFAULT 'created';

-- user_plans: columns needed by generate-pdf
ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS pdf_url    TEXT;
ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS pdf_status TEXT DEFAULT 'pending';

-- Index for fast order_id lookups in handle-payment
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(razorpay_order_id);

-- RLS: payments — only service role can read/write
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON payments;
CREATE POLICY "service_role_all" ON payments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS: user_plans — only service role can read/write
-- Replaces the temporary USING(true) workaround
DROP POLICY IF EXISTS "service_role_all" ON user_plans;
CREATE POLICY "service_role_all" ON user_plans
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
