/* @flow weak */
import PropTypes from 'prop-types';

import React from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';


// This response supports responding with text.
export default class extends React.Component {
  props: {
    onLogMessage: Function,
    onResponseSubmitted: Function,
    forceResponse?: boolean,
    responsePrompt?: string,
    recordText?: string,
    ignoreText?: string,
    autoFocus?: boolean,
    textHeight?: number,
  };

  static displayName = 'MinimalTextResponse';

  static propTypes = {
    onLogMessage: PropTypes.func.isRequired,
    onResponseSubmitted: PropTypes.func.isRequired,
    forceResponse: PropTypes.bool,
    responsePrompt: PropTypes.string,
    recordText: PropTypes.string,
    ignoreText: PropTypes.string,
    autoFocus: PropTypes.bool,
    textHeight: PropTypes.number
  };

  static defaultProps = {
    forceResponse: false,
    responsePrompt: 'Speak directly to the student.',
    recordText: 'Respond',
    ignoreText: 'Say nothing',
    autoFocus: true,
    textHeight: 48
  };

  state = {
    responseText: ''
  };

  onTextChanged = (e) => {
    const responseText = e.target.value;
    this.setState({responseText});
  };

  onRespondTapped = () => {
    const {responseText} = this.state;
    this.props.onLogMessage('message_popup_text_response', {responseText});
    this.props.onResponseSubmitted({responseText});
  };

  onIgnoreTapped = () => {
    this.props.onLogMessage('message_popup_text_ignore');
    this.props.onResponseSubmitted({ignore: true});
  };

  render() {
    const {
      responsePrompt,
      forceResponse,
      recordText,
      ignoreText,
      autoFocus,
      textHeight
    } = this.props;
    const {responseText} = this.state;
   
    return (
      <div className="MinimalTextResponse" style={styles.container}>
        <div>{responsePrompt}</div>
        <div>
          <TextField
            id="minimal-text-response-text-field"
            style={styles.textField}
            textareaStyle={{...styles.textareaInner, height: textHeight}}
            underlineShow={false}
            multiLine={true}
            rows={2}
            autoFocus={autoFocus}
            value={responseText}
            onChange={this.onTextChanged}
          />
        </div>
        <div style={styles.buttonRow}>
          <RaisedButton key="record" onTouchTap={this.onRespondTapped} label={recordText} secondary={true} />
          {!forceResponse && <RaisedButton key="ignore" onTouchTap={this.onIgnoreTapped} label={ignoreText} />}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    paddingBottom: 5,
    margin: 20
  },
  textField: {
    width: '100%'
  },
  // Fixing the height to two rows large, since TextField reflects on the
  // DOM to size its height, and when animating with Velocity it's still hidden
  // and doesn't have its full size yet.
  textareaInner: {
    border: '1px solid #ddd',
    marginBottom: 0
  },
  buttonRow: {
    // margin: 20,
    marginTop: 10
  }
};