import {sendModalSlackMessage} from '../slack/send-slack-message';

function createMainMessage(triggerId: string) {
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
        text: 'Cancel',
        emoji: true
      },
      blocks: [
        {
          type: 'actions',
          elements: [{
            type: 'datepicker',
            placeholder: {
              type: 'plain_text',
              text: 'Select day',
            },
            action_id: 'date'
          }],
          block_id: 'date'
        }
      ]
    }
  }
}

export const showMainMenu = async (slackHttpHeaders, triggerId: string) => {
  await sendModalSlackMessage(slackHttpHeaders, JSON.stringify(createMainMessage(triggerId)));
};
