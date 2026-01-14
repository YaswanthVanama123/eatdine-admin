# Environment Configuration Guide - Admin Mobile App

## Quick Setup

### 1. Find Your Computer's IP Address

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example output: inet 192.168.1.100
```

**On Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your WiFi/Ethernet adapter
# Example: 192.168.1.101
```

### 2. Update .env File

Open `.env` and replace the IP address:

```env
API_BASE_URL=http://YOUR_IP_HERE:5000
SOCKET_URL=http://YOUR_IP_HERE:5000
```

**Example:**
```env
API_BASE_URL=http://192.168.1.100:5000
SOCKET_URL=http://192.168.1.100:5000
```

### 3. Special Cases

#### Android Emulator
The emulator can't access `localhost` or your LAN IP. Use this special address:
```env
API_BASE_URL=http://10.0.2.2:5000
SOCKET_URL=http://10.0.2.2:5000
```

#### iOS Simulator on Mac
iOS Simulator can use localhost:
```env
API_BASE_URL=http://localhost:5000
SOCKET_URL=http://localhost:5000
```

#### Physical Android/iOS Device
**MUST use your computer's IP address:**
```env
API_BASE_URL=http://192.168.1.100:5000
SOCKET_URL=http://192.168.1.100:5000
```

**Important:** Phone and computer must be on the **same WiFi network**!

### 4. Production

For production builds:
```env
API_BASE_URL=https://api.yourrestaurant.com
SOCKET_URL=https://api.yourrestaurant.com
```

## After Changing .env

**iOS:**
```bash
cd ios && pod install && cd ..
npm start --reset-cache
npm run ios
```

**Android:**
```bash
npm start --reset-cache
# In another terminal:
npm run android
```

## Troubleshooting

### Can't connect to API

1. **Check IP address is correct:**
   - Run `ifconfig` (Mac) or `ipconfig` (Windows)
   - Update `.env` with current IP

2. **Check network:**
   - Phone and computer on same WiFi
   - No VPN blocking connection

3. **Check backend is running:**
   - Backend should be on port 5000
   - Test: `curl http://YOUR_IP:5000/api/health`

4. **Check firewall:**
   - Mac: System Preferences > Security > Firewall > Allow Node.js
   - Windows: Allow Node.js through Windows Firewall

### Android Emulator Issues

Use the special emulator address:
```env
API_BASE_URL=http://10.0.2.2:5000
```

NOT `localhost` or your LAN IP!

## Current Configuration

The app uses `react-native-config` to load environment variables.

**File:** `src/utils/constants.ts`
```typescript
import Config from 'react-native-config';

export const API_BASE_URL = Config.API_BASE_URL || 'http://192.168.1.100:5000';
export const SOCKET_URL = Config.SOCKET_URL || 'http://192.168.1.100:5000';
```

The fallback values are used if `.env` is not found.
