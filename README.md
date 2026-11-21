# Live App

Expo React Native starter for Android, with a web export for reviewing screens in Vercel. The Android application ID is `com.wajahatsal33m.liveapp.preview`.

## Browser preview with Vercel

1. In Vercel, choose **Add New → Project** and import `WAJAHATSAL33M/live-app`. Grant the Vercel GitHub app access to this repository if prompted.
2. Use the repository root and the **Other** framework preset. The committed Vercel configuration uses `npm ci`, `npm run build:web`, and the `dist` output directory.
3. Deploy. The first deployment from `main` is the project's main URL. Open a pull request from a feature branch to get a separate preview URL, then use the deployment link on the pull request for review.

## Android preview with Expo

1. Open the repository on GitHub and choose **Code → Codespaces → Create codespace on main**. Use its browser terminal. Sign in to Expo and link the repository to an Expo project you own.

   ```sh
   npm ci
   npx eas-cli@latest login
   npx eas-cli@latest init
   npx eas-cli@latest update:configure
   ```

2. In `app.json`, confirm that Expo added `extra.eas.projectId` and `updates.url`. Set `runtimeVersion` to `{ "policy": "fingerprint" }` so updates target a matching native runtime. Commit the generated configuration to GitHub before running the workflow. If Expo adds a dependency or updates the lockfile, commit those changes together.
3. From the configured checkout, run the first cloud build. If you are prompted about Android signing for this new package, let EAS generate the keystore.

   ```sh
   npx eas-cli@latest build --platform android --profile preview
   ```

4. Open the Expo build page on your Android phone, choose **Install**, and open the installed Live App. Android may ask you to allow installs from your browser. Review the Expo project's internal build access settings before sharing the link.
5. To automate updates, create an Expo access token in **Expo account settings → Access Tokens**. In GitHub, go to **Settings → Secrets and variables → Actions → New repository secret**, and save it as `EXPO_TOKEN`. Keep the token out of files and commits.
6. In GitHub, open **Actions → Android preview → Run workflow**, select `main`, and run it. For automatic publishing, create a branch named `preview` from configured `main`. Push only the changes you want testers to receive to that branch. All published updates target the same Android `preview` channel.
7. To check a published update, open the installed app with an internet connection, give it time to download the update, then close and reopen it. If you change native dependencies or native configuration and the fingerprint changes, build and install a new APK.

This repository is public. Review your Vercel deployment and Expo build access settings before sharing any preview that needs restricted access.
