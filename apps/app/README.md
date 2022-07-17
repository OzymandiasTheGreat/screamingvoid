# Void App

This the official/reference client for the Void network. It's built on React
Native and uses async event based interface to communicate with the core.

It's developed alongside the core and aims to implement every feature available
in the core. It runs on most modern platforms, however I can only test Linux
(Ubuntu LTS) and Android (10). It should run on Windows and Mac as is, but iOS
will probably require minor adjustments to the source to behave correctly.

Some things like theming are haphazardly thrown together and will change as the
code matures.

Network changes are not currently handled. This works mostly ok on desktop,
but on mobile switching from Wi-Fi to mobile data (or the reverse) is likely
to result in hard crash. Even if the app doesn't crash, the rebinding of
network interface DOES NOT happen automatically yet, so you'll need to log out
and log back in for the client to continue to function.

Another thing that is icky on mobile is the battery optimization handling.
I'm looking for a way to opt out of it, but as it is the app might randomly
be killed by the OS without warning. Always check for the "Connected to Void
network" notification.

## Building

### Dev

You need 2 terminals to run the dev client.

In first terminal run `yarn web` for the desktop version or `npx react-native start`
for the mobile version.

In the second terminal run `yarn tauri dev` for the desktop version or
`npx react-native (run-android|run-ios)` for the mobile version.

### Production

To build the production version run `yarn sidecar && yarn tauri build` for
the desktop version or `cd android && ./gradlew assembleRelease` for the
mobile version.

I don't actually know how to build the iOS version as I have no Apple compatible
dev environment.
