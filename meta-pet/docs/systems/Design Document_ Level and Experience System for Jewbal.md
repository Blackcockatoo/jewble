# Design Document: Level and Experience System for Jewbal

**Author:** Manus AI
**Date:** 2025-11-24
**Project:** Jewbal (MetaPet)

## 1. Goal

To introduce a **Level** and **Experience (XP)** system to the Jewbal pet, providing a more granular and continuous sense of progression. This system will be integrated with the existing **Evolution** mechanics, making leveling a prerequisite for major evolutionary milestones.

## 2. New State Variables

The following variables will be added to the `EvolutionData` interface in `jewble/packages/core/src/evolution/types.ts`:

| Variable | Type | Description | Initial Value |
| :--- | :--- | :--- | :--- |
| `level` | `number` | The current level of the pet. | `1` |
| `currentLevelXp` | `number` | The amount of XP earned towards the current level. | `0` |
| `totalXp` | `number` | The total cumulative XP earned by the pet. | `0` |

The existing `experience` field in `EvolutionData` will be renamed to `totalXp` for clarity and consistency, but for minimal disruption, we will use the new fields and ensure the existing `experience` field is still handled if necessary, or simply replace it. Given the code snippets, it seems the existing `experience` field is not directly used for evolution requirements, so we will replace it with the new, more descriptive fields.

## 3. Experience Curve

A simple, non-linear experience curve will be used to determine the XP required to reach the next level. This ensures that leveling up becomes progressively more challenging.

The required XP for a given level $L$ will be calculated using the following formula:

$$
\text{XP Required}(L) = \text{BaseXP} \times L^2
$$

Where:
*   **BaseXP** = 10 (A small base value to ensure early levels are quick)
*   **Level** $L$ is the *target* level (e.g., $L=2$ for the XP required to go from Level 1 to Level 2).

| Target Level ($L$) | XP Required | Cumulative XP |
| :--- | :--- | :--- |
| 2 | $10 \times 2^2 = 40$ | 40 |
| 3 | $10 \times 3^2 = 90$ | 130 |
| 4 | $10 \times 4^2 = 160$ | 290 |
| 5 | $10 \times 5^2 = 250$ | 540 |
| 10 | $10 \times 10^2 = 1000$ | 3850 |

A new helper function, `getXpRequiredForLevel(level: number): number`, will be implemented in `jewble/packages/core/src/evolution/index.ts` to handle this calculation.

## 4. Experience Gain

The existing `gainExperience` function will be updated to handle the new level and XP state.

| Action | XP Gained (Current) | XP Gained (New) |
| :--- | :--- | :--- |
| `feed` | 2 | 5 |
| `clean` | 2 | 5 |
| `play` | 3 | 10 |
| `sleep` | 1 | 3 |
| **Battle Win** | N/A | 15 |
| **Mini-Game** | N/A | 5-10 (based on score) |

The updated `gainExperience` function will:
1.  Add the gained XP to `currentLevelXp` and `totalXp`.
2.  Check if `currentLevelXp` meets or exceeds the required XP for the next level.
3.  If a level-up occurs, increment `level`, subtract the required XP from `currentLevelXp`, and repeat the check for multiple level-ups.

## 5. Integration with Evolution

The existing `EvolutionRequirement` interface will be updated to include a new field:

| Variable | Type | Description |
| :--- | :--- | :--- |
| `minLevel` | `number` | The minimum level the pet must reach before being eligible for this evolution stage. |

The `EVOLUTION_REQUIREMENTS` constant in `jewble/packages/core/src/evolution/types.ts` will be updated with `minLevel` requirements.

| Evolution State | Current `minInteractions` | New `minLevel` |
| :--- | :--- | :--- |
| `GENETICS` | 0 | 1 |
| `NEURO` | 12 | 5 |
| `QUANTUM` | 40 | 10 |
| `SPECIATION` | 80 | 15 |

The `checkEvolutionEligibility` function will be updated to include the `minLevel` check:

$$
\text{Eligible} = \text{Current Checks} \land (\text{Current Level} \ge \text{minLevel})
$$

This design ensures that the pet must actively engage in interactions to gain XP and level up, which then unlocks the possibility of the next major evolutionary stage, provided the other conditions (age, vitals) are also met. The existing `totalInteractions` field will be kept as a secondary metric, as it represents a different kind of progression (raw activity count). The new `totalXp` and `level` will be the primary growth metrics.
