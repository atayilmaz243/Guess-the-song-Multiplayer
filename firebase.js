// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection } = require('firebase/firestore');
require('dotenv').config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)


function generateRandomNumbers(range,sizeRandomNumbers)
{
  const tmp = [];
  for (let i = 1; i <= range; i++) {
    tmp.push(i);
  }

  const randomNumbers = [];
  for (let i = 1; i <= sizeRandomNumbers; i++) {
    const randomIndex = Math.floor(Math.random() * tmp.length);
    randomNumbers.push(tmp[randomIndex]);
    tmp.splice(randomIndex, 1);
  }

  return randomNumbers
}


async function fetchAudios(maxRound) {
  const totalAudios = 11;

  const randomNumbers = generateRandomNumbers(totalAudios,6)

  const audios = [];
  for (const indx of randomNumbers) {
    audios.push(getDoc(doc(db, 'musics', indx.toString())));
  }

  const audioDocs = await Promise.all(audios);
  return audioDocs.map(doc => doc.data());
}

module.exports = {fetchAudios,generateRandomNumbers}