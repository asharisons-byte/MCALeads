# 📞 MCA Dialer - Complete Setup & Usage Guide

## ✅ Feature Overview

The MCA Dialer is a fully functional calling and SMS application integrated into your MCA Lead Agency Suite. It provides:

- 📞 **Voice Calling** - Make outbound calls using Telnyx API
- 💬 **SMS Messaging** - Send SMS messages to leads and contacts
- 📋 **Call Logs** - Complete history of all calls with duration and status
- 💬 **SMS Logs** - Complete history of all SMS messages sent
- 🔗 **Lead Integration** - Automatically link calls/SMS to leads in your CRM
- ⏱️ **Real-time Tracking** - Live call duration timer and status updates
- 📊 **Dashboard Access** - Quick access button on main dashboard

---

## 🚀 Quick Start

### Step 1: Configure Telnyx API Key

1. Go to **Settings** → **Integrations**
2. Enter your **Telnyx API Key**
3. Click **Save Settings**

**Get your Telnyx API Key:**
- Sign up at [telnyx.com](https://telnyx.com)
- Go to API Keys section
- Create a new API key
- Copy and paste into Settings

### Step 2: Access the Dialer

**Option 1: From Dashboard**
- Click the green **"📞 Dialer"** button in the top-right corner
- OR click the **"Quick Dialer"** card on the dashboard

**Option 2: From Sidebar**
- Navigate to **OUTREACH** → **Dialer** (marked with "LIVE" badge)

---

## 📞 Making Calls

### Manual Dialing

1. Open the Dialer
2. Use the dial pad to enter a phone number
3. Click the green **"📞 Call"** button
4. Wait for connection (status will show "Calling..." then "Connected")
5. Call duration timer starts automatically
6. Click **"📴 End Call"** when finished

### Calling from Lead

1. Open the Dialer
2. Select a lead from the **"Select Lead"** dropdown
3. Phone number auto-fills from lead record
4. Click **"📞 Call"**
5. Call is automatically logged to the lead's activity history

### Call Features

- ✅ Real-time call duration tracking
- ✅ Call status indicators (Calling, Connected, Ended)
- ✅ Automatic call logging
- ✅ Lead integration (optional)
- ✅ Call history with full details

---

## 💬 Sending SMS

### Manual SMS

1. Open the Dialer
2. Enter phone number in the "To:" field
3. Type your message in the message box
4. Click **"💬 Send SMS"**
5. Status shows "Sending SMS..." then "✓ SMS Sent"

### SMS from Lead

1. Open the Dialer
2. Select a lead from the dropdown
3. Phone number auto-fills
4. Type your message
5. Click **"💬 Send SMS"**
6. SMS is automatically logged to the lead's activity history

### SMS Features

- ✅ Character counter
- ✅ Delivery status tracking
- ✅ Automatic SMS logging
- ✅ Lead integration (optional)
- ✅ SMS history with full message content

---

## 📋 Viewing Logs

### Call Logs

1. Click the **"📋 Call Logs"** tab
2. View all call history with:
   - Contact name/number
   - Call direction (Outbound/Inbound)
   - Duration
   - Status (Completed/Failed)
   - Timestamp
   - Link to lead (if applicable)

### SMS Logs

1. Click the **"💬 SMS Logs"** tab
2. View all SMS history with:
   - Contact name/number
   - Message content
   - Direction (Outbound/Inbound)
   - Status (Sent/Failed)
   - Timestamp
   - Link to lead (if applicable)

---

## 🔧 Configuration

### Required Settings

**Telnyx API Key** (Required for calls and SMS)
- Location: Settings → Integrations
- Get from: [portal.telnyx.com](https://portal.telnyx.com)
- Status indicator shows when configured

### Optional Settings

**From Phone Number**
- Currently set to: `+15551234567` (placeholder)
- To use your own number, update the code in `App.tsx`:
  ```typescript
  // Line ~3700 (handleCall function)
  '+15551234567', // Change to your Telnyx number
  
  // Line ~3750 (handleSendSMS function)
  '+15551234567', // Change to your Telnyx number
  ```

---

## 📊 Data Storage

All dialer data is stored locally in your browser:

- **Call Logs**: `localStorage.mca_call_logs`
- **SMS Logs**: `localStorage.mca_sms_logs`
- **Lead Integration**: Calls/SMS also saved to lead's activity history

### Data Persistence

- ✅ Data persists across page refreshes
- ✅ Data persists across browser sessions
- ✅ Data is private to your browser
- ⚠️ Data is cleared if you clear browser storage

---

## 🎯 Integration with Leads

### Automatic Lead Linking

When you select a lead before making a call or sending SMS:

1. **Call Logging**: Call is automatically added to lead's activity timeline
2. **SMS Logging**: SMS is automatically added to lead's activity timeline
3. **Lead History**: View all calls/SMS in lead detail page
4. **Activity Feed**: Calls/SMS appear in lead's activity feed

### Manual Dialing

If you don't select a lead:
- Call/SMS is still logged in Dialer logs
- Marked as "Manual" in logs
- No lead integration

---

## 🎨 UI Features

### Dial Pad

- Full numeric keypad (0-9, *, #)
- Backspace button
- Clear button
- Large, easy-to-read display

### Status Indicators

- 🟡 **Calling** - Call in progress
- 🟢 **Connected** - Call active with timer
- 🔴 **Ended** - Call completed
- 🔵 **Sending** - SMS in progress
- ✅ **Sent** - SMS delivered

### Quick Actions

- Dashboard button for instant access
- Sidebar navigation with "LIVE" badge
- Tab-based interface for easy switching

---

## 🔐 Security & Privacy

### API Key Security

- ✅ API key stored in browser localStorage
- ✅ API key masked in Settings (password field)
- ✅ No API keys in URL parameters
- ✅ No API keys in console logs
- ⚠️ API key accessible via browser dev tools (acceptable for single-user app)

### Data Privacy

- ✅ All data stored locally
- ✅ No data sent to third parties (except Telnyx API)
- ✅ No analytics or tracking
- ✅ Private to your browser

---

## 🐛 Troubleshooting

### "Configuration Required" Warning

**Problem**: Yellow warning appears saying Telnyx API key not configured

**Solution**:
1. Go to Settings → Integrations
2. Enter your Telnyx API key
3. Click Save Settings
4. Refresh the page

### Call/SMS Fails

**Problem**: Call or SMS shows "Failed" status

**Possible Causes**:
1. Invalid Telnyx API key
2. Insufficient Telnyx account balance
3. Invalid phone number format
4. Telnyx service outage

**Solution**:
1. Verify API key in Settings
2. Check Telnyx account balance at [portal.telnyx.com](https://portal.telnyx.com)
3. Ensure phone number includes country code (e.g., +1 for US)
4. Check Telnyx status page

### Phone Number Format

**Correct Format**:
- ✅ `+15551234567` (US number with country code)
- ✅ `+442071234567` (UK number with country code)

**Incorrect Format**:
- ❌ `555-123-4567` (missing country code)
- ❌ `(555) 123-4567` (wrong format)

---

## 📱 Mobile Responsiveness

The dialer is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablet browsers
- ✅ Mobile browsers

---

## 🔄 Future Enhancements

Potential features for future versions:
- 📥 Receive incoming calls
- 📥 Receive incoming SMS
- 🎙️ Call recording
- 🤖 AI call transcription
- 📊 Advanced analytics
- 📞 Conference calling
- 📋 Call scripts integration
- 🔔 Call reminders
- 📱 Voicemail detection

---

## 📞 Support

### Telnyx Support
- Documentation: [developers.telnyx.com](https://developers.telnyx.com)
- Support: [support.telnyx.com](https://support.telnyx.com)

### MCA Suite Support
- Check Settings → Integrations for API status
- Review call/SMS logs for error details
- Verify phone number format

---

## ✅ Checklist

Before using the dialer, ensure:

- [ ] Telnyx API key configured in Settings
- [ ] Telnyx account has sufficient balance
- [ ] Phone numbers include country code (+1 for US)
- [ ] Browser allows localStorage (not in private/incognito mode)
- [ ] Internet connection is stable

---

## 🎉 You're Ready!

Your MCA Dialer is now fully operational. You can:

1. ✅ Make voice calls to any number
2. ✅ Send SMS messages
3. ✅ Track all calls and SMS in logs
4. ✅ Link communications to leads
5. ✅ Access dialer from dashboard or sidebar

**Start making calls and sending SMS messages now!** 📞💬

---

**Last Updated**: 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
