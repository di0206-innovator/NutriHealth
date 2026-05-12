import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-9817976701-89717",
  appId: "1:483878889475:web:b50a216f665b3f6fa8c636",
  storageBucket: "studio-9817976701-89717.firebasestorage.app",
  apiKey: "AIzaSyAUiHNGILWkGT0uC5CkJ3Edo8y_GDo_bdQ",
  authDomain: "studio-9817976701-89717.firebaseapp.com",
  messagingSenderId: "483878889475"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
