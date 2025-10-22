# Verification Checklist

Use this checklist to verify all fixes and improvements have been correctly implemented.

## 1. Open App - Default Behavior
- [ ] App loads without errors
- [ ] Default currencies are KWD → PKR (as configured)
- [ ] Conversion displays: `1 KWD = X PKR` (where X is the current rate)
- [ ] Status bar shows currency count (170+)
- [ ] "Live" indicator is green and not pulsing after initial load
- [ ] Last updated timestamp shows recent time

## 2. Dropdown Scrolling - Mouse Wheel
- [ ] Click "From" currency dropdown to open
- [ ] Use mouse wheel to scroll - dropdown scrolls smoothly
- [ ] Click "To" currency dropdown to open
- [ ] Use mouse wheel to scroll - dropdown scrolls smoothly
- [ ] Scrolling feels native (not jumpy or laggy)
- [ ] Can scroll to bottom of list (170+ items)
- [ ] Can scroll back to top

## 3. Dropdown Scrolling - Touchpad
- [ ] Open currency dropdown
- [ ] Use two-finger swipe on touchpad
- [ ] Dropdown scrolls smoothly
- [ ] Momentum scrolling works (if supported by OS)
- [ ] No touch-action blocking issues

## 4. Dropdown Scrolling - Keyboard
- [ ] Open currency dropdown
- [ ] Press ↓ (Down Arrow) - selection moves down, list auto-scrolls
- [ ] Press ↑ (Up Arrow) - selection moves up, list auto-scrolls
- [ ] Press PageDown - jumps multiple items down
- [ ] Press PageUp - jumps multiple items up
- [ ] Press Home - jumps to first item
- [ ] Press End - jumps to last item
- [ ] Press Enter - selects highlighted currency and closes dropdown
- [ ] Press Escape - closes dropdown without selecting

## 5. Search Functionality - Multiple Aliases
Search for USD using different terms:
- [ ] Type "us dollar" - USD appears in results
- [ ] Clear search, type "united states dollar" - USD appears
- [ ] Clear search, type "american dollar" - USD appears
- [ ] Clear search, type "usd" - USD appears
- [ ] Clear search, type "dollar" - USD and other dollar currencies appear
- [ ] Clear search, type "united states" - USD appears
- [ ] Clear search, type "america" - USD appears

## 6. Lite Mode - Auto-Detection (Low-End Device)
If you don't have a low-end device, simulate with Chrome DevTools:
- [ ] Open Chrome DevTools (F12)
- [ ] Click three dots ⋮ → More tools → Performance
- [ ] Set CPU throttling to "6x slowdown"
- [ ] Refresh the page
- [ ] "Lite Mode" toggle should be ON automatically
- [ ] Green "Optimized" indicator visible
- [ ] Message "Auto-enabled for your device" appears
- [ ] Dropdown opens quickly (no lag)
- [ ] Search responds without lag

## 7. Lite Mode - Manual Toggle
- [ ] Click "Lite Mode" button to toggle OFF
- [ ] Button changes to "Full Mode"
- [ ] Dropdown still works smoothly
- [ ] Click "Lite Mode" button to toggle ON
- [ ] Button changes to show "Lite Mode"
- [ ] Green "Optimized" indicator appears
- [ ] Preference is saved (refresh page and verify mode persists)

## 8. Network Failure Simulation
Simulate API failure to test fallback behavior:

### Method 1: Chrome DevTools
- [ ] Open Chrome DevTools (F12)
- [ ] Go to Network tab
- [ ] Click "Online" dropdown → Select "Offline"
- [ ] Wait for next auto-refresh (60 seconds) OR click Refresh button manually
- [ ] Subtle banner appears: "Showing last known/fallback rates"
- [ ] Rates still display (from cache)
- [ ] Status indicator turns orange (fallback mode)
- [ ] "Retry" button is visible in banner
- [ ] Click "Retry" button
- [ ] Banner disappears or shows "Network still offline"

### Method 2: Return Online
- [ ] Set Network back to "Online"
- [ ] Click "Retry" button or wait for auto-refresh
- [ ] Banner disappears
- [ ] Status indicator turns green (live mode)
- [ ] Rates update successfully

## 9. API Endpoint Testing

### Test /api/symbols endpoint
Open browser console and run:
```javascript
fetch('https://lxdjkzggzbtnazwkbvkh.supabase.co/functions/v1/symbols')
  .then(r => r.json())
  .then(console.log)
```
Verify response:
- [ ] HTTP status 200
- [ ] Response contains `symbols` array
- [ ] Array has 170+ items
- [ ] Each item has: `code`, `name`, `countryCode`, `aliases`
- [ ] Response contains `fetchedAt` timestamp
- [ ] Response contains `cached` boolean

### Test /api/rates endpoint
Open browser console and run:
```javascript
fetch('https://lxdjkzggzbtnazwkbvkh.supabase.co/functions/v1/rates?base=KWD&symbols=PKR,USD,EUR')
  .then(r => r.json())
  .then(console.log)
```
Verify response:
- [ ] HTTP status 200
- [ ] Response contains `base: "KWD"`
- [ ] Response contains `rates` object with PKR, USD, EUR
- [ ] Each rate is a number (e.g., `PKR: 924.60`)
- [ ] Response contains `fetchedAt` timestamp (ISO format)
- [ ] Response contains `provider` string ("cdn", "pages", or "exchange-host")
- [ ] Response contains `cached` boolean
- [ ] Response contains `fallback` boolean

## 10. Auto-Refresh Behavior
- [ ] Note the "Last updated" timestamp
- [ ] Wait 60 seconds
- [ ] Timestamp updates automatically
- [ ] Status indicator briefly turns yellow (loading)
- [ ] Status indicator returns to green (live)
- [ ] No page refresh required
- [ ] Conversion amount updates if rates changed

## 11. Manual Refresh
- [ ] Click "Refresh" button in status bar
- [ ] Refresh icon spins while loading
- [ ] "Last updated" timestamp updates immediately
- [ ] Status indicator shows loading (yellow)
- [ ] Toast notification appears: "Refreshing rates..."
- [ ] Rates update (may or may not change based on actual rate changes)

## 12. Currency Swap
- [ ] Select KWD → PKR conversion
- [ ] Click swap button (⇅) in the middle
- [ ] Button rotates 180° with animation
- [ ] Currencies swap: PKR → KWD
- [ ] Amount resets to 1
- [ ] New rate fetches immediately
- [ ] No lag or freezing

## 13. Flag Display
- [ ] Open currency dropdown
- [ ] Verify flags display for major currencies (USD, EUR, GBP, etc.)
- [ ] Flags are clear and recognizable
- [ ] Scroll to different currencies - flags lazy-load
- [ ] No broken image icons
- [ ] Generic fallback shown for currencies without country code

## 14. Search Performance (Low-End Device Test)
With CPU throttling enabled (6x slowdown):
- [ ] Open dropdown
- [ ] Type quickly: "united states dollar"
- [ ] Search responds within 200-400ms (debounced)
- [ ] No UI freezing
- [ ] Results appear smoothly
- [ ] Can continue typing without lag

## 15. Visual Polish
- [ ] Status bar has subtle background color
- [ ] Status indicator dot pulses when loading
- [ ] Dropdown has smooth open/close animation
- [ ] Hover effects on dropdown items
- [ ] Selected currency highlighted clearly
- [ ] Recent currencies labeled with badge
- [ ] Refresh button has hover state
- [ ] All text is readable (good contrast)

## 16. Mobile Testing (if applicable)
If testing on mobile device or mobile viewport:
- [ ] Dropdowns open correctly
- [ ] Touch scrolling works in dropdown
- [ ] Search keyboard appears when typing
- [ ] Swap button is easily tappable
- [ ] Status bar is readable
- [ ] No horizontal scrolling issues
- [ ] Lite mode auto-enables (if device qualifies)

## 17. Browser Console Checks
Open browser console (F12) and check:
- [ ] No red errors in Console tab
- [ ] No warnings about deprecated APIs
- [ ] Network tab shows successful API calls
- [ ] No 404 or 500 errors
- [ ] Edge function calls return 200 status

## 18. Conversion Accuracy (unchanged)
Verify conversion logic wasn't affected:
- [ ] Enter 100 in "From" amount
- [ ] Verify "To" amount = 100 × rate (check manually)
- [ ] Enter 50.5 (decimal)
- [ ] Verify decimal conversion works
- [ ] Enter 0
- [ ] Verify 0 converts to 0.00
- [ ] Rounding is consistent (2 decimal places)

## Additional Notes

### Known Limitations
- Edge functions may take 2-3 seconds on first call (cold start)
- Currency symbols load once at app start (24-hour cache)
- Some currencies may not have flag icons (generic fallback shown)

### Performance Targets
- Initial load: < 2 seconds
- Dropdown open: < 100ms
- Search response: < 300ms
- API call: < 500ms (excluding cold start)

### If Issues Found
1. Check browser console for errors
2. Verify Supabase edge functions are deployed
3. Test with Chrome DevTools Network tab
4. Try disabling browser extensions
5. Clear browser cache and reload

---

## Summary
- ✅ All 18 verification items should pass
- ✅ No critical errors in console
- ✅ Smooth user experience on all devices
- ✅ Conversion logic unchanged and accurate
