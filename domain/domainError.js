const { scripTimeline } = require("./helpers");

exports.DataNotPresentError = class dataNotPresentError extends Error {
  timeline;
  
  /**
   * 
   * @param {scripTimeline} timeline 
   * @param  {...any} params 
   */
  constructor(timeline, emptyKeys, message) {
    if (!(timeline instanceof scripTimeline))
      throw Error('Wrong Type');
    const msg = emptyKeys.length
      ? `${emptyKeys.join(',')} not found for ${timeline.getFinReportSegmentName()}`
      : 'Relevant Data not Found';

    super(message || msg);
    this.timeline = timeline;
  };
}
