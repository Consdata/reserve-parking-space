import {updateModalSlackMessage} from '../slack/send-slack-message';
import {ReserveParkingSpace} from '../reserve-parking-space';
import * as admin from 'firebase-admin';
import {createShowFreeParkingSpacesMessage} from '../show-free/show-free-rooms-message.creator';

function extractReserveParkingSpaceData(actionValue: string): ReserveParkingSpace {
  return {
    date: actionValue.substr(0, 10),
    parkingSpace: actionValue.substr(actionValue.lastIndexOf('_') + 1)
  }
}

export const reserveParkingSpace = async (slackHttpHeaders,
                                          firestore: admin.firestore.Firestore,
                                          userName: string,
                                          actionValue: string,
                                          triggerId: string,
                                          viewId: string) => {
  const refreshView = async (date: string) => {
    const parkingSpacesViewMessage = await createShowFreeParkingSpacesMessage(
      firestore,
      userName,
      date,
      triggerId,
      viewId);
    await updateModalSlackMessage(slackHttpHeaders, JSON.stringify(parkingSpacesViewMessage));
  };

  const reserveParkingSpaceData = extractReserveParkingSpaceData(actionValue);

  const docId = reserveParkingSpaceData.date.concat(reserveParkingSpaceData.parkingSpace);
  const reservationRef = firestore.collection('parkingSpace').doc(docId);
  const reserved = await reservationRef.get();
  if (!reserved.exists) {
    const result = await firestore.runTransaction(async t => {
      const reservation = await t.get(reservationRef);
      if (!reservation.exists) {
        await t.set(reservationRef, {
          date: reserveParkingSpaceData.date,
          parkingSpace: reserveParkingSpaceData.parkingSpace,
          userName: userName,
        });
        return true;
      } else {
        return false;
      }
    });
    if (result) {
      await refreshView(reserveParkingSpaceData.date);
    }
  } else if (reserved.get('userName') === userName) {
    await reservationRef.delete();
    await refreshView(reserveParkingSpaceData.date);
  }
};
