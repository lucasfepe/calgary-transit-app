# 🚦 Calgary Transit App - Frontend (React Native)

> **A high-performance, cross-platform mobile experience for real-time transit awareness in Calgary. Designed for speed, efficiency, and rider-focused usability.**

## 📖 Overview

This React Native app delivers real-time vehicle tracking and personalized proximity alerts for Calgary's public transit system. It’s built for performance, usability, and platform resilience — with an intelligent map engine, configurable user preferences, and seamless integration with a secure backend.

---

## 🧰 Tech Stack

| Layer               | Technology                                                                 |
|---------------------|----------------------------------------------------------------------------|
| Framework           | React Native (v0.73.4) + TypeScript for type safety and cross-platform UX |
| Platform Layer      | Expo SDK (v50.0.13) for streamlined dev/build pipeline                     |
| Auth & Backend      | Firebase Auth (token management), JWT-secured API integration             |
| Mapping             | React Native Maps + Google Maps integration                                |
| Geolocation         | Expo Location for GPS + custom clustering for point optimization          |
| Navigation & UI     | React Navigation (v7), Expo Vector Icons, styled-components               |
| Notifications       | Expo Notifications + Firebase Cloud Messaging                              |
| Event Handling      | DeviceEventEmitter for real-time in-app events                            |

---

## ✨ Feature Highlights

### 🚍 Smart Transit Tracking
- Live vehicle updates via backend GTFS polling
- Vehicle differentiation: buses vs. trains
- Trip-to-route mapping with cached metadata
- Route-specific filtering and quick map focus

### 🗺️ Advanced Map Visualization
- Custom marker clustering: optimized for dense vehicle displays
- Polylines for visualizing entire route shapes
- Zoom-based cluster resizing and interactivity
- Tap-to-focus and stop highlight interactions

### 🔔 Proximity Alert System
- Subscribe to a stop and get alerts when vehicles are near
- Configurable radius: 100m to 5000m
- Schedule-aware: alerts by day/time ranges
- Backend-assisted stop-passing detection logic

### ⚙️ User Preference Management
- Per-user frequency controls (debouncing)
- Custom sound, vibration, and alert styling
- Fine-tuned control of distance and scheduling

---

## ⚙️ Engineering Considerations

### 📊 Performance Optimization

#### Marker Clustering
- Custom clustering for hundreds of points with zero lag
- `React.memo` and stable references to prevent re-renders
- `trackViewChanges={false}` to stop map marker blinking

#### Data Caching
- Two-tiered caching: nearby routes + trip mappings
- Daily cache reset (3 AM) ensures data freshness
- Optimized location-aware lookups

#### Render Optimization
- Component-level memoization
- Avoid unnecessary map re-renders with stable refs

---

### 🔋 Battery & Data Efficiency

#### Location Polling Strategy
- Balanced accuracy with low battery drain
- Event listeners replace constant polling
- Manual fallback and failure resilience

#### Network Optimization
- Incremental data loading per map viewport
- Throttled retries after API failures
- Lightweight data separation for map vs. route details

---

## 🔐 Security Implementation

| Feature                  | Implementation Notes                                                       |
|--------------------------|----------------------------------------------------------------------------|
| Authentication           | Firebase Auth + secure token persistence                                  |
| API Security             | JWT in all outbound REST requests via headers                             |
| Storage                  | AsyncStorage with platform-specific encryption strategies                 |
| Role-Based Access        | Admin-specific screens and protected stack routes                         |
| Config Isolation         | `.env` environment config for secure API keys and tokens                  |

---

## 💡 UX & Accessibility

- **Error Handling**: Retry flows, graceful degradation, fallbacks for location/data
- **Accessibility**: High-contrast mode, readable fonts, responsive UI
- **Feedback**: Real-time loading indicators, modals, and toasts
- **Responsive Design**:
  - Platform-specific layout logic (`getTopPosition`)
  - Safe-area support for notched/curved screens

---

## 🧠 Novel Engineering Solutions

### Proximity Detection Algorithm
- Distance-based real-time stop prediction
- Handles non-linear paths (looping, missed turns)
- Alert triggers based on trend of decreasing distance

### Trip-to-Route Mapping
- Ultra-lightweight trip→route ID mapping system
- LRU cache + daily sync strategy
- Eviction policy: oldest first to maintain memory constraints

### Notification Debouncing
- Custom delay threshold between alerts per subscription
- Syncs with backend for shared alert state
- Prevents "alert fatigue" via suppression window

---

## 🧩 Architecture & Integration

- Integrates seamlessly with [RideAlerts Backend](https://github.com/lucasfepe/ridealerts-backend)
- Firebase Auth sessions sync across mobile and backend roles
- JWT-secured API flows for subscriptions, proximity, and user preferences

---

## 💎 Summary

This front-end brings the power of real-time public transit awareness to your pocket. It intelligently blends GPS, clustering, caching, and cloud messaging to deliver a fluid, battery-efficient experience — while offering users granular control over their alerts and preferences.

---