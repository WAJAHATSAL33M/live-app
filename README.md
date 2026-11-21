# Live App

Expo React Native starter for Android, with a web export for reviewing screens in Vercel. The Android application ID is `com.wajahatsal33m.liveapp.preview`.

## Browser preview with Vercel

1. In Vercel, choose **Add New → Project** and import `WAJAHATSAL33M/live-app`. Grant the Vercel GitHub app access to this repository if prompted.
2. Use the repository root and the **Other** framework preset. The committed Vercel configuration uses `npm ci`, `npm run build:web`, and the `dist` output directory.
3. Deploy. The first deployment from `main` is the project's main URL. Open a pull request from a feature branch to get a separate preview URL, then use the deployment link on the pull request for review.

## Android preview with Expo

Open the [Expo Builds dashboard](https://expo.dev/accounts/tech-guys/projects/live-app/builds) and use **Build from GitHub** with Android, the desired Git ref, the `preview` build profile, and the Preview environment. Open the completed build on an Android device and choose **Install**. Review internal build access settings before sharing the build link.

Expo Workflows publishes compatible Android updates to the `preview` channel on pushes to `main`. Open the installed app online and restart it after the update downloads. If the native runtime fingerprint changes, build and install a new APK.

This repository is public. Review your Vercel deployment and Expo build access settings before sharing any preview that needs restricted access.
