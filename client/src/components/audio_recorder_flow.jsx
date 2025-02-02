/* @flow weak */
import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import AudioCapture from './audio_capture.jsx';

type State = {
  isRecording: bool,
  haveRecorded: bool,
  downloadUrl: ?string,
  uploadState: 'idle' | 'pending' | 'done',
  blob: ?Blob,
  uploadedUrl: ?string
};

/*
This is a state-machine UI for asking a user to:

 - record audio
 - listen to what they recorded and review with a prompt
 - allow them to re-record or submit

The presentation can be configured with the props below,
corresponding to each state.

*/
export default createReactClass({
  displayName: 'AudioRecorderFlow',

  propTypes: {
    url: PropTypes.string.isRequired,
    start: PropTypes.func.isRequired,
    reviewing: PropTypes.func.isRequired,
    recording: PropTypes.func.isRequired,
    processing: PropTypes.func,
    saving: PropTypes.func,
    done: PropTypes.func,
    onDone: PropTypes.func.isRequired,
    onLogMessage: PropTypes.func.isRequired
  },

  getInitialState():State {
    return {
      isRecording: false,
      haveRecorded: false,
      downloadUrl: null,
      uploadState: 'idle',
      blob: null,
      uploadedUrl: null
    };
  },


  uploadBlob(blob:Blob) {
    const {url} = this.props;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.onload = this.onDoneUploading;
    xhr.onerror = this.onErrorUploading;
    xhr.send(blob);
  },

  // Determine which step we're at in the flow through
  // these states.
  whichStep(state:State) {
    const {
      isRecording,
      haveRecorded,
      blob,
      uploadState,
      uploadedUrl
    } = state;

    if (!isRecording && !haveRecorded) return 'idle';
    if (isRecording) return 'recording';
    if (haveRecorded && !blob) return 'processing';
    if (haveRecorded && blob && uploadState === 'idle') return 'reviewing';
    if (blob && uploadState === 'pending') return 'saving';
    if (blob && uploadedUrl) return 'done';
  },

  onRecordClicked() {
    this.props.onLogMessage('message_popup_audio_record_clicked');
    this.setState({
      ...this.getInitialState(),
      isRecording: true
    });
  },

  onDoneRecordingClicked() {
    this.props.onLogMessage('message_popup_audio_done_recording_clicked');
    this.setState({
      isRecording: false,
      haveRecorded: true
    });
  },

  onDoneCapture(blob:Blob) {
    var downloadUrl = URL.createObjectURL(blob);
    this.props.onLogMessage('message_popup_audio_on_done_capture', {'blobUrl': downloadUrl});
    this.setState({blob, downloadUrl});
  },

  onSubmit() {
    this.props.onLogMessage('message_popup_audio_on_submit');
    this.setState({ uploadState: 'pending' });
    const {blob} = this.state;
    if (blob) this.uploadBlob(blob);
  },

  onRetry() {
    this.props.onLogMessage('message_popup_audio_on_retry');
    this.setState({
      ...this.getInitialState(),
      isRecording: true
    });
  },

  onDoneUploading(event) {
    this.props.onLogMessage('message_popup_audio_done_uploading');
    const uploadedUrl = JSON.parse(event.target.response).url;
    const {downloadUrl} = this.state;
    this.setState({
      uploadedUrl,
      uploadState: 'done',
    });
    this.props.onDone({uploadedUrl, downloadUrl});
  },

  // Log error (user flow will halt)
  onErrorUploading(event) {
    this.props.onLogMessage('message_popup_audio_error_uploading');
    console.error('AudioRecorderFlow.onErrorUploading', event); // eslint-disable-line no-console
  },

  render() {
    const step = this.whichStep(this.state);
    const {isRecording} = this.state;
    
    return (
      <div>
        <AudioCapture
          isRecording={isRecording}
          onDoneCapture={this.onDoneCapture} />
        {step === 'idle' && this.renderStart()}
        {step === 'recording' && this.renderRecording()}
        {step === 'processing' && (this.props.processing || <div>Processing...</div>)}
        {step === 'reviewing' && this.renderReview()}
        {step === 'saving' && (this.props.saving || <div>Saving...</div>)}
        {step === 'done' && this.renderDone()}
      </div>
    );
  },

  renderStart() {
    return this.props.start({
      onRecord: this.onRecordClicked
    });
  },

  renderRecording() {
    return this.props.recording({
      onDone: this.onDoneRecordingClicked
    });
  },

  renderReview() {
    const {blob, downloadUrl} = this.state;
    return this.props.reviewing({
      blob,
      downloadUrl,
      onSubmit: this.onSubmit,
      onRetry: this.onRetry
    });
  },

  renderDone() {
    const {uploadedUrl} = this.state;
    if (!this.props.done) return null;
    return this.props.done({uploadedUrl});
  }
});