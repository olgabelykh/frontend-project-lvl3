export default {
  translation: {
    header: 'RSS Reader',
    lead: 'Start reading RSS today! It is easy, it is nicely.',
    details: 'Training project',
    errors: {
      cantGetChannel: `Can't add channel.`,
      invalidUrl: 'Rss link must be a valid url.',
      emptyUrl: 'Rss link is required',
      alreadyAdded: 'Channel is already added.',
      unknownLoadingStatus: 'Unknown Loading Status',
      unknownFormStatus: 'Unknown Form Status',
    },
    loadingProcess: {
      status: {
        success: 'Channel successfully added.',
        pending: 'Loading...',
      },
    },
    channelForm: {
      url: {
        placeholder: 'RSS link',
      },
      example: 'Example: https://ru.hexlet.io/lessons.rss',
      submit: {
        value: 'Add',
      },
    },
  },
};
