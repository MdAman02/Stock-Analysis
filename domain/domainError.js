exports.DataNotPresentError = class dataNotPresentError extends Error {
  constructor(...params) {
    super();
    this.message = params
     ? `${params.join(',')} not found`
     : 'Relevant Data not Found';
  };
}
