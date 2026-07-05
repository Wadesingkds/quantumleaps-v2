# Test Full Flow Guide

## Setup Checklist

### 1. Database Migration (MANUAL STEP REQUIRED)

Karena kita tidak bisa mengakses Supabase Dashboard via API, Anda perlu menjalankan SQL migration secara manual:

**Steps:**
1. Buka https://supabase.com/dashboard/project/unybsvtbjeukzqazpzjn
2. Navigasi ke **SQL Editor**
3. Paste dan run script dari `sql/01_scans_table.sql`:

```sql
-- Scan history table
create table if not exists public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  swing_high numeric not null,
  swing_low numeric not null,
  timeframe text not null,
  levels jsonb not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.scans enable row level security;

-- Users can only read their own scans
create policy "Users can view own scans"
  on public.scans
  for select
  using (auth.uid() = user_id);

-- Users can insert their own scans
create policy "Users can insert own scans"
  on public.scans
  for insert
  with check (auth.uid() = user_id);

-- Index for faster queries
create index scans_user_id_created_at_idx on public.scans(user_id, created_at desc);
```

4. Verify table created: Check **Table Editor** → should see `scans` table

---

## Test Flow

### Step 1: Verify Dev Server Running

```bash
cd ~/quantumleaps-v2
npm run dev
```

Server should be at: http://localhost:3000

---

### Step 2: Test Unauthenticated Redirect

**Test URL:** http://localhost:3000/dashboard

**Expected:**
- ✅ Redirect to `/login?redirect=/dashboard`
- ✅ See centered login form
- ✅ See "Lanjutkan dengan Google" button
- ✅ See single "Belum punya akun?" CTA at bottom

**Test URL:** http://localhost:3000/dashboard/scanner

**Expected:**
- ✅ Redirect to `/login?redirect=/dashboard/scanner`

---

### Step 3: Test Google OAuth Login

**Action:** Click "Lanjutkan dengan Google" button

**Expected Flow:**
1. Redirects to Google OAuth consent screen
2. Select Google account
3. Grant permissions
4. Redirects back to `/auth/callback`
5. Callback processes session
6. Final redirect to original destination (`/dashboard` or `/dashboard/scanner`)

**Verify Session:**
Open DevTools → Application → Cookies → Check for:
- `sb-unybsvtbjeukzqazpzjn-auth-token`
- `sb-unybsvtbjeukzqazpzjn-auth-token.0`

---

### Step 4: Test Dashboard Overview

**URL:** http://localhost:3000/dashboard (after login)

**Expected to see:**
- ✅ Heading: "Dashboard"
- ✅ 3 stats cards:
  - Scans Today: 24 (+12%)
  - Win Rate: 68% (+5%)
  - Avg Score: 6.8 (-0.2)
- ✅ 2 quick action cards:
  - Scanner Confluence card with "Buka Scanner" button
  - Recent Activity card with 3 mock scans
- ✅ Mock data displays correctly

**Action:** Click "Buka Scanner" button

**Expected:** Navigate to `/dashboard/scanner`

---

### Step 5: Test Scanner Page

**URL:** http://localhost:3000/dashboard/scanner (after login)

**Expected UI:**
- ✅ Sidebar (desktop) with:
  - QuantumLeaps logo
  - Scanner (active)
  - Account
  - Sign Out button
- ✅ Top bar with "XAUUSD Live" badge
- ✅ Main content:
  - Heading: "Scanner"
  - Input form with 4 fields:
    - Swing High
    - Swing Low
    - Timeframe (tabs: 15M, 1H, 4H, D)
    - Mode (Auto toggle)
  - "Hitung Confluence" button
  - "Simpan Config" button
- ✅ Stats row (3 cards): Trend, TF, Candles
- ✅ Results table: "Level Confluence"
- ✅ Mock data displayed (4 levels)

---

### Step 6: Test API Integration

**Action:** Fill scanner form and submit

**Test Input:**
- Swing High: `4400`
- Swing Low: `4280`
- Timeframe: `15M` (default)
- Click "Hitung Confluence"

**Expected Behavior:**
1. Button shows "Mengambil data..." (loading state)
2. Makes API call: `GET /api/confluence?high=4400&low=4280&tf=15M`
3. Results update in table below
4. Button returns to "Hitung Confluence"

**Verify in DevTools:**
- Network tab → Filter XHR
- Should see request to `/api/confluence`
- Status: `200 OK`
- Response JSON:
  ```json
  {
    "success": true,
    "data": {
      "swing_high": 4400,
      "swing_low": 4280,
      "timeframe": "15M",
      "levels": [
        {
          "type": "sell",
          "price": "4354.16",
          "score": 8,
          "signals": ["FVG", "OB", "BOS"]
        },
        ...
      ],
      "timestamp": "2026-07-05T..."
    }
  }
  ```

---

### Step 7: Verify Database Insert

**Go to Supabase Dashboard:**
1. Table Editor → `scans` table
2. Should see new row with:
   - `user_id`: Your Google user UUID
   - `swing_high`: 4400
   - `swing_low`: 4280
   - `timeframe`: "15M"
   - `levels`: JSON array
   - `created_at`: Recent timestamp

**Verify RLS:**
- Try viewing table as different user → should see empty (RLS working)

---

### Step 8: Test Error Handling

**Test 1: Missing Parameters**
```bash
curl 'http://localhost:3000/api/confluence?high=4400'
```
**Expected:** `{"error":"Missing required parameters: high, low"}`

**Test 2: Invalid Values**
```bash
curl 'http://localhost:3000/api/confluence?high=abc&low=xyz'
```
**Expected:** `{"error":"Invalid swing high/low values"}`

**Test 3: High < Low**
```bash
curl 'http://localhost:3000/api/confluence?high=4000&low=4500'
```
**Expected:** `{"error":"Invalid swing high/low values"}`

---

### Step 9: Test Auth Protection

**Action:** Sign out via sidebar

**Then try:**
1. Direct URL: http://localhost:3000/dashboard
   - ✅ Redirects to `/login?redirect=/dashboard`

2. Direct URL: http://localhost:3000/dashboard/scanner
   - ✅ Redirects to `/login?redirect=/dashboard/scanner`

3. Direct API call (without cookies):
   ```bash
   curl 'http://localhost:3000/api/confluence?high=4400&low=4280'
   ```
   - ✅ Returns `{"error":"Unauthorized"}`

---

### Step 10: Mobile Responsive Test

**Action:** Open DevTools → Toggle device toolbar (Cmd+Shift+M)

**Test Pages:**
- `/login` — Form should be centered and readable
- `/dashboard` — Stats cards stack vertically
- `/dashboard/scanner` — Sidebar becomes mobile drawer
  - Hamburger menu appears (top-left)
  - Bottom tab bar appears
  - Form inputs stack vertically
  - Table switches to mobile layout

---

## Success Criteria

### All Green ✅:
- [ ] Login page centered and clean
- [ ] Unauthenticated users redirected to login
- [ ] Google OAuth login works
- [ ] Dashboard overview displays correctly
- [ ] Scanner page loads with full UI
- [ ] Scanner form submission works
- [ ] API returns valid confluence levels
- [ ] Database insert succeeds
- [ ] RLS policies enforced
- [ ] Error handling works
- [ ] Sign out redirects to login
- [ ] Mobile responsive on all pages

---

## Known Issues / TODO

### Current Limitations:
1. **Mock Calculation** — API uses Fibonacci levels, not real Gann Square of 9
2. **No History Page** — Can't view past scans yet
3. **No Real-time Data** — Not pulling live XAUUSD prices
4. **No Rate Limiting** — API can be spammed

### Next Phase:
- [ ] Implement real Gann Square of 9 algorithm
- [ ] Build `/dashboard/history` page
- [ ] Integrate TradingView or other market data API
- [ ] Add rate limiting to API route
- [ ] Add scan export (CSV/JSON)
- [ ] Add WebSocket for real-time updates

---

## Troubleshooting

### Issue: "Unauthorized" on API call after login
**Solution:** Check cookies in DevTools. If missing, clear browser cache and login again.

### Issue: Table not found in Supabase
**Solution:** Run SQL migration manually in Supabase SQL Editor.

### Issue: Redirect loop on login
**Solution:** Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Issue: Google OAuth error
**Solution:** Verify Google OAuth credentials in Supabase Dashboard → Authentication → Providers → Google.

---

## Production Deployment Checklist

Before deploying to production:
- [ ] Run SQL migration on production Supabase
- [ ] Update Google OAuth redirect URLs
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Enable rate limiting
- [ ] Add analytics tracking
- [ ] Test on multiple devices
- [ ] Run Lighthouse audit
- [ ] Check SEO metadata

---

**Status:** Development server running at http://localhost:3000
**Database:** Supabase (unybsvtbjeukzqazpzjn)
**Auth:** Google OAuth via Supabase Auth
