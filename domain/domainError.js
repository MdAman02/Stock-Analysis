exports.DataNotPresentError = class dataNotPresentError extends Error {
  constructor(...params) {
    super();
    if (params)
      this.message(`${params.join(',')} not found`);
  };
}
