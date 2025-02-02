function requestTranscript(token,audioID) {
  console.log("top of transcribe.js");
  return fetch('/server/research/transcribe/'+audioID+'.wav', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-teachermoments-token': token,
    },
    method: 'POST'
  })
    .then(result => {
      return result.json();
    })
    .catch(err => {
      console.log('Failed to request transcript');
    });
}

module.exports = {
  requestTranscript
};
