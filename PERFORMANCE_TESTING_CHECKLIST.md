# Performance Testing Checklist

Quick checklist to verify all performance optimizations are working.

## Pre-Test Setup

- [ ] Frontend dependencies installed: `cd frontend && npm install`
- [ ] Backend server running: `cd backend && npm run dev`
- [ ] Frontend server running: `cd frontend && npm run dev`
- [ ] Browser: Chrome with DevTools open (F12)

---

## Test 1: Frontend Build Optimization

```bash
cd /home/user/career-hub-ai
npm run build:frontend
```

**✅ Success Criteria:**
- [ ] Build completes without errors
- [ ] Main bundle is ~250-300 KB (was 536 KB)
- [ ] Multiple chunks created (react-vendor, pdfjs, supabase, genai)
- [ ] No warnings about oversized chunks (>500KB except pdfjs)
- [ ] pdfjs chunk is separate (lazy loaded)

**Expected Output:**
```
dist/assets/js/index-[hash].js          ~280 KB
dist/assets/js/react-vendor-[hash].js   ~145 KB
dist/assets/js/pdfjs-[hash].js          ~1000 KB (lazy)
dist/assets/js/supabase-[hash].js       ~120 KB
dist/assets/js/genai-[hash].js          ~80 KB
```

---

## Test 2: Page Load Time

**In Chrome DevTools → Network tab:**
- [ ] Disable cache checkbox checked
- [ ] Throttling set to "Fast 3G"
- [ ] Reload page (Ctrl+R or Cmd+R)

**✅ Success Criteria:**
- [ ] DOMContentLoaded: <2 seconds
- [ ] Load: <3 seconds
- [ ] Total transferred: ~1 MB (was 4.5 MB)
- [ ] Content-Encoding: gzip or br (compression working)

**Take Note:**
- DOMContentLoaded: ______ seconds
- Load: ______ seconds
- Total transferred: ______ MB
- Compression: Yes / No

---

## Test 3: Compression Verification

**In Chrome DevTools → Network tab:**
- [ ] Reload page
- [ ] Click on any API request (e.g., `/api/jobs`)
- [ ] Check Response Headers

**✅ Success Criteria:**
- [ ] `content-encoding: gzip` or `content-encoding: br` header present
- [ ] Response size much smaller than uncompressed size

**Example:**
```
Request: GET /api/jobs
Response Headers:
  content-encoding: gzip
  content-length: 2145 (compressed)
  x-original-size: ~8000 (uncompressed)
Savings: ~73%
```

---

## Test 4: API Caching Verification

**Watch backend terminal for cache logs:**

1. Navigate to Jobs page (first time)
   - [ ] Backend logs: `[Cache MISS] /api/jobs`

2. Navigate away, then back to Jobs (second time)
   - [ ] Backend logs: `[Cache HIT] /api/jobs`

3. Repeat for Courses page
   - [ ] Backend logs: `[Cache MISS] /api/courses` then `[Cache HIT] /api/courses`

**✅ Success Criteria:**
- [ ] First request shows MISS
- [ ] Subsequent requests show HIT
- [ ] Response time much faster on HIT

**Take Note:**
- First request time: ______ ms
- Cached request time: ______ ms
- Speed improvement: ______x faster

---

## Test 5: Code Splitting Verification

**In Chrome DevTools → Network tab:**

1. Load dashboard page
   - [ ] pdfjs chunk NOT loaded
   - [ ] admin chunk NOT loaded

2. Navigate to Resume Builder
   - [ ] pdfjs chunk loads now (1MB+)
   - [ ] Only loads when needed

3. Navigate to Admin Panel (if you're admin)
   - [ ] admin chunk loads now
   - [ ] Only loads when needed

**✅ Success Criteria:**
- [ ] Heavy components only load when navigating to them
- [ ] Initial page load doesn't include all chunks
- [ ] Each lazy chunk loads successfully (200 status)

---

## Test 6: Load Testing with Artillery

```bash
# Make sure servers are running!
cd /home/user/career-hub-ai
npx artillery run tests/performance/load-test.yml
```

**✅ Success Criteria:**
- [ ] Test completes without crashing
- [ ] http.codes.200: High count (successful requests)
- [ ] http.response_time.p95: <2000ms
- [ ] http.response_time.p99: <3000ms
- [ ] http.response_time.max: <5000ms
- [ ] Error rate: <1%

**Take Note:**
- Total requests: ______
- Successful (200): ______
- Failed: ______
- p95 latency: ______ ms
- p99 latency: ______ ms
- Max latency: ______ ms
- Requests/second: ______

**Expected Output:**
```
Summary report:
  http.codes.200: ........................... 1500+
  http.request_rate: ........................ 40-60/sec
  http.response_time:
    p95: .................................... <2000ms ✅
    p99: .................................... <3000ms ✅
    max: .................................... <5000ms ✅
```

---

## Test 7: Concurrent Users Simulation

**Using Artillery results from Test 6:**

**✅ Success Criteria:**
- [ ] 100+ concurrent users handled successfully
- [ ] No significant error rate increase
- [ ] Response times remain acceptable
- [ ] Server doesn't crash or hang

**Peak Load Metrics:**
- Peak concurrent users: ______
- Error rate at peak: ______%
- Average response time at peak: ______ ms

---

## Test 8: Lighthouse Performance Audit

**In Chrome:**
- [ ] Open DevTools (F12) → Lighthouse tab
- [ ] Select "Performance" only
- [ ] Select "Desktop" mode
- [ ] Click "Analyze page load"

**✅ Success Criteria:**
- [ ] Performance score: >90
- [ ] First Contentful Paint: <1.5s
- [ ] Largest Contentful Paint: <2.5s
- [ ] Time to Interactive: <3s
- [ ] Total Blocking Time: <200ms

**Take Note:**
- Performance score: ______/100
- First Contentful Paint: ______ s
- Largest Contentful Paint: ______ s
- Time to Interactive: ______ s
- Speed Index: ______ s

---

## Results Summary

### Before vs After Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Page Load Time | 8.11s | ___s | ___% |
| Total Size | 4.5 MB | ___MB | ___% |
| Initial Bundle | 536 KB | ___KB | ___% |
| API Response (p95) | N/A | ___ms | ✅ |
| Concurrent Users | N/A | ___ | ✅ |
| Lighthouse Score | N/A | ___/100 | ✅ |

### Overall Status

- [ ] ✅ All tests passed
- [ ] ⚠️ Some tests need attention
- [ ] ❌ Optimizations need review

### Next Steps

If all tests passed:
- [ ] Deploy to production
- [ ] Monitor performance in production
- [ ] Set up performance monitoring (optional)

If some tests failed:
- [ ] Review troubleshooting guide in PERFORMANCE_OPTIMIZATIONS.md
- [ ] Check server logs for errors
- [ ] Verify all dependencies installed
- [ ] Ask for help with specific failing tests

---

## Quick Performance Commands

```bash
# Build frontend
npm run build:frontend

# Run load tests
npx artillery run tests/performance/load-test.yml

# Start servers
npm run dev  # Both servers
# OR
npm run dev:backend  # Backend only
npm run dev:frontend  # Frontend only

# Check bundle sizes
cd frontend && npm run build && ls -lh dist/assets/js/
```

---

## Performance Optimization Status

✅ **Completed:**
- [x] Compression middleware (60-80% size reduction)
- [x] API caching (5-10min TTL)
- [x] Code splitting (lazy loading)
- [x] Vite build optimization
- [x] Load testing infrastructure

⏳ **Pending Verification:**
- [ ] Run all tests above
- [ ] Measure actual performance gains
- [ ] Verify targets met (<3s load time)

🎯 **Target Achieved:**
- [ ] Page load <3s
- [ ] Bundle size <300KB initial
- [ ] p95 latency <2s
- [ ] 100+ concurrent users
- [ ] <1% error rate

---

**Date Tested:** ___________
**Tested By:** ___________
**Environment:** Development / Production
**Notes:** _______________________________________
