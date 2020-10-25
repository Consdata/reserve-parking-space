import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';
import {FunctionBuilder} from 'firebase-functions';
import {reserveParkingSpaceFactory} from './app/reserve-desk.handler';
import {reserveParkingSpaceInteractionFactory} from './app/reserve-interaction.handler';

firebase.initializeApp();

const region = functions.region('europe-west3');
const functionBuilder: () => FunctionBuilder = () => region
  .runWith({
    maxInstances: 5,
    memory: '256MB'
  });

const firestore = firebase.firestore();

export const reserveParkingSpace = reserveParkingSpaceFactory(functionBuilder(), functions.config());
export const reserveParkingSpaceInteraction = reserveParkingSpaceInteractionFactory(functionBuilder(), functions.config(), firestore);
