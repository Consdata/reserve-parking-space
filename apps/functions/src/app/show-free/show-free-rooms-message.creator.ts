import {parkingSpaces} from './parking-spaces-definitions';
import * as admin from 'firebase-admin';
import {generateDateTitles, getMonday, getSunday} from './date-utils';
import {DateTitle} from './date-name';

function createMessage(reservedParkingSpacesInDays: Map<string, any[]>,
                       dateTitles: DateTitle[],
                       userName: string,
                       date: string,
                       triggerId: string,
                       viewId: string) {
  const deskReservedBy = (date: string, parkingSpace: string): string => {
    if (reservedParkingSpacesInDays.get(date) != undefined) {
      const reservation = reservedParkingSpacesInDays.get(date).filter((value) => value.parkingSpace === parkingSpace).pop();
      return reservation != undefined ? reservation.user : undefined;
    }
    return undefined;
  };

  let blocks = [];
  blocks.push({
    type: 'section',
    text: {
      type: 'plain_text',
      text: 'Please select parking spaces:'
    }
  });
  blocks = blocks.concat(...(dateTitles.map((def) => {
    const datesBlocks = [];
    datesBlocks.push({
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*' + def.date + ', ' + def.dayOfWeek + '*'
        }
      });
    parkingSpaces.forEach(parkingSpace => {
      const reservedBy = deskReservedBy(def.date, parkingSpace);
      datesBlocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*' + parkingSpace + '*' + (reservedBy != undefined ? ' :no_entry: reserved by @' + reservedBy : '')
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: false,
              text: reservedBy === userName ? 'Cancel' : 'Reserve'
            },
            value: date + '_' + parkingSpace,
            style: reservedBy != undefined ? 'danger' : 'primary',
            action_id: 'reserve'
          }
        }
      )
    });
    return datesBlocks;
  })));
  return {
    trigger_id: triggerId,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Reserve parking space'
      },
      close: {
        type: 'plain_text',
        text: 'Done'
      },
      blocks: blocks
    },
    view_id: viewId
  }
}

export const createShowFreeParkingSpacesMessage = async (firestore: admin.firestore.Firestore,
                                                         userName: string,
                                                         date: string,
                                                         triggerId: string,
                                                         viewId?: string) => {
  const reservationsRef = firestore.collection('parkingSpace');
  const monday = getMonday(date);
  const sunday = getSunday(date);
  const reserved = await reservationsRef
    .where('date', '>=', monday)
    .where('date', '<=', sunday)
    .orderBy('date')
    .orderBy('parkingSpace')
    .get();
  const reservedParkingSpacesInDays = new Map<string, any[]>();
  reserved.forEach(r => {
    if (reservedParkingSpacesInDays.get(r.data().date) == undefined) {
      reservedParkingSpacesInDays.set(r.data().date, []);
    }
    reservedParkingSpacesInDays.get(r.data().date).push(
      {
        parkingSpace: r.data().parkingSpace,
        user: r.data().userName
      });
  });
  return createMessage(reservedParkingSpacesInDays, generateDateTitles(date), userName, date, triggerId, viewId);
};
