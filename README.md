# PingUs — Real-time Firebase Version

This version keeps the UI close to the supplied PingUs design and adds real Firebase authentication + Firestore.

## What works

- Email/password Sign up and Log in
- Logout
- Real shared Firestore hangout data
- Public feed: anyone can read hangouts
- Signed-in users can create hangouts
- Signed-in users can join/leave hangouts
- Only the hangout creator can edit the event details
- Only the hangout creator can delete the event
- Other signed-in users can only change their own join/leave membership
- Realtime updates: changes appear in other open browsers without refreshing
- Search, categories and sorting
- User profile stats
- Dark mode
- Responsive layout

## One-time Firebase setup

1. Go to https://console.firebase.google.com/
2. Create a Firebase project.
3. Add a Web App.
4. Copy the Firebase configuration into `js/firebase-config.js`.
5. In Firebase Console, open Authentication → Sign-in method.
6. Enable **Email/Password**.
7. Open Firestore Database → Create database.
8. Start in production mode, then publish the included `firestore.rules`.
9. Run the website through a local server, not by double-clicking the HTML file.

### Easy local server

If you use VS Code:
- Install the **Live Server** extension.
- Right-click `index.html`.
- Choose **Open with Live Server**.

Or, if Python is installed:
`python -m http.server 5500`
Then open `http://localhost:5500`.

## Deploying

You can deploy the same folder to Firebase Hosting, Netlify, Vercel static hosting, GitHub Pages (with Firebase config in the frontend), or another static host.

## Security model

This version uses safer Firestore rules:

- Anyone can publicly read hangouts.
- Only authenticated users can create hangouts.
- A hangout creator can edit or delete their own hangout.
- Other authenticated users can only add/remove their own membership.
- A user cannot change another user's membership.
- The creator ID cannot be changed.

Attendees are stored as maps keyed by Firebase user IDs so Firestore rules can restrict membership changes to the current user.

## Firebase config

The Firebase web config is not a password/secret. Still, the Firestore Security Rules are what protect your database. Never put a server Admin SDK private key in frontend JavaScript.
