# 🐛 Luffa AI Bridge Troubleshooting Guide

## Current Status 
✅ **Luffa API**: Working  
✅ **Anthropic API**: Working  
✅ **Bridge Script**: Working

The issue is **NOT** with API credentials or the bridge code. The problem is that **messages are being sent but the bridge is not receiving them.**

---

## Root Cause Analysis

When you run `npm run bot:luffa:v2`, the bridge:
1. ✅ Successfully connects to Luffa API
2. ✅ Successfully connects to Anthropic API
3. ❓ Polls for messages but receives an **empty queue**

---

## Common Causes & Solutions

### 1. **Bot Not Properly Registered on Luffa** 
The mobile app may be sending messages to a different bot ID.

**Check:**
- In Luffa mobile app settings, verify the bot secret matches `LUFFA_BOT_SECRET` in `.env`
- Confirm the bot is activated/enabled in the Luffa web dashboard

---

### 2. **Bot Secret Mismatch**
If you've regenerated the bot secret on Luffa's dashboard, your `.env` file may have the old secret.

**Solution:**
```bash
# Check your current secret
grep LUFFA_BOT_SECRET .env

# Update if needed (get new secret from Luffa dashboard)
# Edit .env with the new secret

# Test connection
npm run bot:test
```

---

### 3. **Bot Not Linked to Mobile App**
The Luffa mobile app may not be connected to this bot instance.

**Check in Luffa Dashboard:**
- ✓ Bot status is "Active" or "Online"
- ✓ Bot is linked to the correct workspace/account
- ✓ Permissions allow receiving messages

---

### 4. **Messages Routed to Wrong Endpoint**
Luffa may be sending messages to a different bot service.

**Fix:**
- Verify the Webhook/API endpoint in Luffa settings points to correct server
- Ensure your bot instance secret matches the one registered in Luffa

---

## Improved Bridge with Better Diagnostics

I've created **`scripts/luffa-anthropic-bridge-v2.mjs`** with enhanced logging:

```bash
npm run bot:luffa:v2
```

This will show:
- ✓ Each poll cycle
- ✓ Number of messages received
- ✓ Processing status of each message
- ✓ Errors with full details

---

## Testing Steps

### Step 1: Verify APIs are working
```bash
npm run bot:test
```
Expected output: All tests should pass ✅

### Step 2: Start the improved bridge
```bash
npm run bot:luffa:v2
```
Expected output: Bridge running, waiting for messages

### Step 3: Send a test message
In Luffa mobile app, send a message to this bot and watch the console output for:
- `[✓ reply] type=...` = Message processed and response sent
- `[✗ error]` = Error occurred (will show details)
- `[DEBUG] Processing message` = Message received and being processed

### Step 4: Check logs
If no `[DEBUG]` lines appear:
- **Issue**: Messages not reaching the bridge
- **Solution**: Check bot registration on Luffa dashboard

---

## Debugging Checklist

- [ ] Confirmed bot secret in `.env` matches Luffa dashboard
- [ ] Bot status is "Active" in Luffa dashboard
- [ ] Bot is linked to your account/workspace
- [ ] Ran `npm run bot:test` and all APIs passed
- [ ] Running `npm run bot:luffa:v2` and monitoring console
- [ ] Sent test message from Luffa mobile app
- [ ] Message appears in bridge console logs

---

## Next Steps

1. **Start the improved bridge:**
   ```bash
   npm run bot:luffa:v2
   ```

2. **Send a test message** from Luffa mobile app

3. **Watch the console** for:
   - `[DEBUG] Processing message:` = Message received ✓
   - `[✓ reply] type=...` = Message processed ✓
   - `[✗ error]` = Problem (read details)

4. **If no messages appear:**
   - Check Luffa dashboard bot settings
   - Verify bot secret is correct
   - Ensure bot is active and properly linked

---

## API Health Check

Both APIs are currently working (tested):

```
Luffa API: ✅ 
  - Endpoint: https://apibot.luffa.im/robot/receive
  - Auth: LUFFA_BOT_SECRET

Anthropic API: ✅
  - Endpoint: https://api.anthropic.com/v1/messages
  - Model: claude-sonnet-4-20250514
```

---

## Support

If the issue persists:
1. Run the test: `npm run bot:test`
2. Run the bridge: `npm run bot:luffa:v2`
3. Send a message and capture the full console output
4. Check Luffa dashboard logs for the same time period
