# API Contracts

## Project Type: Frontend-Only SPA

This project is a **Vite + React + TypeScript SPA** with no custom backend API. All data processing happens client-side via domain engines.

## Implicit Contracts

TypeScript interfaces in the relevant service files serve as the project's implicit API contracts:

| Domain | Contract Location | Description |
|--------|------------------|-------------|
| Tử Vi (Eastern Astrology) | `src/services/tuvi/types.ts` | Palace, star, and chart interfaces via `iztro` |
| Chiêm Tinh (Western Astrology) | `src/services/chiemtinh/types.ts` | Natal chart interfaces via `circular-natal-horoscope-js` |
| Mai Hoa (Plum Blossom) | `src/services/maiHoa/types.ts` | Hexagram and trigram interfaces |
| Lunar Calendar | `src/utils/` | Date calculation utilities via `@dqcai/vn-lunar` |

## External Dependencies

| Library | Purpose | Contract Source |
|---------|---------|----------------|
| `iztro` | Tử Vi chart engine | Library's exported TypeScript types |
| `circular-natal-horoscope-js` | Western astrology calculations | Library's exported types |
| `@dqcai/vn-lunar` | Vietnamese lunar calendar | Library's exported types |

## Convention

When agents reference `API_CONTRACTS.md`, check the **TypeScript interfaces in the relevant service files** instead of expecting REST API endpoint definitions. This project has no REST API.
