# Building Focus Launcher APK with EAS Build

This guide walks you through generating a production APK you can sideload onto your Redmi Pad (or any Android device) and set as the default launcher.

---

## Prerequisites

- Node.js 18+ installed on your computer
- An Expo account (free) at https://expo.dev
- The project source code downloaded locally

---

## Step 1 — Install EAS CLI on your computer

```bash
npm install -g eas-cli
eas login
```

---

## Step 2 — Clone / download this project

Download the workspace from Replit (use the three-dot menu → Download as zip), then:

```bash
cd path/to/workspace
npm install -g pnpm
pnpm install
```

---

## Step 3 — Configure EAS in the launcher-native package

```bash
cd artifacts/launcher-native
eas init --id <your-expo-project-id>
```

This creates an `eas.json`. Make sure it includes an `apk` profile:

```json
{
  "build": {
    "apk": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

---

## Step 4 — Build the APK

```bash
cd artifacts/launcher-native
eas build --platform android --profile apk
```

EAS will build in the cloud. When done (~10–15 minutes) it outputs a download URL.

---

## Step 5 — Install on your Redmi Pad

1. Download the `.apk` from the EAS URL
2. Transfer to your Redmi Pad (USB or cloud storage)
3. On your Redmi Pad:
   - Enable **Install from unknown sources** (Settings → Privacy → Install unknown apps)
   - Open the APK file and install
4. Press the **Home** button — Android will ask which launcher to use
5. Select **Focus Launcher** → **Always**

---

## Step 6 — Set as default (alternative method)

Inside the app, swipe right to the App Drawer, then tap **"Set as Default Launcher"** at the bottom.
This opens Android's Default Apps settings directly.

---

## Launcher Intent Filters

The `plugins/withLauncherIntent.js` config plugin automatically adds the correct `HOME` intent filters to `AndroidManifest.xml` during the EAS build:

```xml
<intent-filter>
  <action android:name="android.intent.action.MAIN" />
  <category android:name="android.intent.category.HOME" />
  <category android:name="android.intent.category.DEFAULT" />
</intent-filter>
```

You do not need to edit this manually.

---

## Removing Focus Launcher as Default

Settings → Apps → Default Apps → Home App → choose another launcher.

---

## Notes

- `react-native-launcher-kit` only works in the EAS-built APK, not in Expo Go
- The app preview in Replit (via Expo Go web) shows the full UI correctly but app-launching is disabled on web/Expo-Go preview
- Do not run `eas build` from within Replit — it must be run locally or in CI
