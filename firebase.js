if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("PASTE_")) {
  console.warn("PingUs Firebase is not configured yet. Edit js/firebase-config.js.");
}
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;