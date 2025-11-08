# 🚀 Quick Start - Get the App Running NOW

## Option 1: Run the Script (Easiest)

```bash
cd /home/user/jewble/meta-pet-mobile
./start.sh
```

Then press `w` to open in web browser!

---

## Option 2: Manual Steps

```bash
cd /home/user/jewble/meta-pet-mobile

# If node_modules doesn't exist:
npm install --legacy-peer-deps

# Start the server:
npx expo start --offline
```

When it starts, you'll see:
```
Metro Bundler ready
› Press w │ open web

QR code will appear here
```

**Press 'w' to open in your web browser!**

---

## What to Do When It Opens

The app will load and you'll see:

1. **Home Screen (HUD)** - Vitals dashboard with hunger/hygiene/mood/energy bars
2. **Hepta Tab** - View your genome code and play audio chimes
3. **Settings Tab** - Toggle dark mode, audio, haptics

### Try These Actions:

- **Feed** - Tap feed button to reduce hunger
- **Clean** - Tap clean button to increase hygiene  
- **Play** - Tap play button to boost mood
- **Sleep** - Tap sleep to restore energy

The pet's vitals will automatically tick every 2 seconds!

---

## Troubleshooting

### "Cannot find module"
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

### "Port 8081 already in use"
```bash
lsof -ti:8081 | xargs kill -9
npx expo start
```

### "Metro bundler failed"
```bash
npx expo start --clear
```

---

## Success Checklist

- ✅ Server starts without errors
- ✅ "Waiting on http://localhost:8081" appears
- ✅ Press 'w' opens browser
- ✅ App loads and shows HUD with vitals
- ✅ Vitals bars are visible
- ✅ Can navigate between tabs

**You're ready to go!** 🎉
