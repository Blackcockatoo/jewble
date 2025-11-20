# 🎮 New Features Quick Start Guide

## What's New in Version 7

### 🗺️ Vimana Exploration
Navigate a 4×4 sacred field grid to discover anomalies and collect samples.

**How to Play:**
1. Click the **Explore** tab in Features Dashboard
2. Select a cell on the grid
3. Click "Explore Cell" to discover its properties
4. Resolve anomalies for energy/mood rewards
5. Collect samples to unlock cosmetics

**Field Types:**
- **Calm** (Teal): +8 mood, +5 energy
- **Neuro** (Purple): +6 mood, +8 energy  
- **Quantum** (Amber): +10 mood, +10 energy
- **Earth** (Emerald): +7 mood, +6 energy

### ⚔️ Consciousness Arena
Non-violent duels where victory depends on your pet's vitals and energy shield.

**How to Battle:**
1. Click the **Battle** tab
2. Maintain high vitals (energy, mood, hygiene)
3. Build your energy shield through consistent care
4. Click "Enter Battle" to face opponents
5. Win to increase your streak and unlock rewards

**Tips:**
- Energy + Mood = higher win chance
- Shield regenerates when vitals > 70%
- 10-win streak = Unstoppable achievement

### 🎮 Mini-Games
Four games to boost vitals and earn achievements.

#### Pattern Recognition
- Watch the pattern, repeat from memory
- Difficulty: 3-8 length sequences
- Reward: Mood boost

#### Memory Game
- Quick pattern recall
- Score based on vitals
- Reward: Up to +10 mood

#### Rhythm Sync
- Time your beats
- Energy-based scoring
- Reward: Up to +12 energy

#### Vimana Tetris
- Clear lines for combos
- Focus-based gameplay
- Reward: Mood + Energy

### ✨ Cosmetics
Customize your pet with unlockable items.

**Categories:**
- **Accessories**: Crowns, halos, horns
- **Auras**: Rainbow, void, flame effects
- **Patterns**: Starfield, sacred geometry
- **Effects**: Sparkles, quantum shimmer

**How to Unlock:**
- Reach evolution milestones
- Win battles
- Explore all Vimana cells
- Breed offspring
- Play mini-games

**Rarities:**
- Common (gray) → Rare (blue) → Epic (purple) → Legendary (gold)

### 🏆 Achievements
Track your progress and earn rewards.

**17 Achievements Across 5 Categories:**

**Care:** Maintain vitals, perfect care streaks
**Battle:** Win battles, build streaks
**Exploration:** Scan cells, resolve anomalies
**Evolution:** Reach new stages
**Social:** Breed offspring, build lineage

**Tiers:**
- Bronze: 10 points
- Silver: 25 points  
- Gold: 50 points
- Platinum: 100 points

**Rewards:**
- Cosmetic items
- Vitals boosts
- Special badges

## 📱 Navigating the Features Dashboard

The new dashboard has 5 tabs:

| Tab | Icon | Features |
|-----|------|----------|
| **Explore** | 🗺️ | Vimana grid, field scanning, anomalies |
| **Battle** | ⚔️ | Arena, opponents, streak tracker |
| **Games** | 🎮 | 4 mini-games, scores, rewards |
| **Style** | ✨ | Cosmetics catalog, equipment |
| **Rewards** | 🏆 | Achievements, progress, points |

## 🎯 Quick Tips

### Maximize Rewards
1. Keep vitals high (70+) for better battle odds
2. Play mini-games daily for bonus multipliers
3. Explore all cells before evolving (fresh cells on evolution)
4. Battle when energy shield is full (100)
5. Check achievements for unlock conditions

### Unlock Everything
- **Crystal Horns**: Collect 100 samples
- **Sacred Halo**: Win 50 battles
- **Quantum Shimmer**: Reach QUANTUM stage
- **Golden Crown**: Achieve SPECIATION
- **Void Aura**: Explore all 16 Vimana cells

### Achievement Hunting
**Easy Wins:**
- First Victory (win 1 battle)
- First Scan (explore 1 cell)
- First Evolution (reach NEURO)

**Challenge Runs:**
- Unstoppable (10-win streak)
- Perfect Day (100% vitals for 1 hour)
- Master Caretaker (80+ vitals for 24 hours)

## 🔧 Technical Notes

### Privacy & Offline
- All features work offline
- No DNA ever leaves device
- Cosmetics stored locally
- Achievements tracked in IndexedDB

### Performance
- Grid generation: O(n²) where n=4
- Battle simulation: O(1)
- Achievement checks: O(n) where n=17
- All computations client-side

### Data Persistence
Auto-saved every 60 seconds:
- Battle stats (wins/losses/streak)
- Mini-game high scores
- Vimana exploration progress
- Unlocked cosmetics
- Achievement progress

## 🚀 Getting Started

```bash
# Start dev server
cd meta-pet
npm run dev

# Visit
http://localhost:3000

# Steps:
1. Generate or load a pet
2. Keep vitals healthy
3. Click "Features Dashboard" tabs
4. Explore, battle, play games
5. Unlock cosmetics and achievements
```

## 🎉 Have Fun!

All features are designed to work together:
- **Care** feeds **Battle** performance
- **Exploration** unlocks **Cosmetics**
- **Mini-games** boost **Vitals**
- **Evolution** opens new **Areas**
- **Achievements** track **Progress**

Enjoy your enhanced Meta-Pet experience! 🧬✨
