import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

// SERVER ONLY — holds the Firebase service account — never import in browser code
export function getFirebaseAdminAuth(): Auth {
  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // .env files store the key on one line with literal \n sequences
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
  return getAuth(app)
}
