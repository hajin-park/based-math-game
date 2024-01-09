import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAxQbZeBGVcl0pNzglKUy3glwKKHlEfsUU",
    authDomain: "based-math-game.firebaseapp.com",
    databaseURL: "https://based-math-game-default-rtdb.firebaseio.com",
    projectId: "based-math-game",
    storageBucket: "based-math-game.appspot.com",
    messagingSenderId: "1072292261765",
    appId: "1:1072292261765:web:6e209c187e969caedddeec",
    measurementId: "G-RDXDD0HBPG",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
