// TODO(kr) flow typing disabled because of error in refreshTimer typing
import PropTypes from 'prop-types';

import React from 'react';
import _ from 'lodash';

import * as Api from '../../helpers/api.js';
import Paper from 'material-ui/Paper';
import {Card, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';


// For reviewing responses as a group.
export default class extends React.Component {
  static displayName = 'GroupReview';

  static propTypes = {
    prompt: PropTypes.string.isRequired,
    applesKey: PropTypes.string.isRequired,
    onDone: PropTypes.func.isRequired
  };

  state = {
    hasLoaded: false,
    applesResponses: null
  };

  // This is where we could add a timer using setInterval to repeatedly call the
  // method that refreshes the responses (and then add a componentWillUnmount to cleanup).
  componentDidMount() {
    this.refreshResponses();
    this.refreshTimer = setInterval(this.refreshResponses,5000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
  }

  refreshTimer: ?number = null;

  refreshResponses = () => {
    const {applesKey} = this.props;
    Api.getApples(applesKey).end(this.onResponsesReceived);
  };

  onButtonTapped = () => {
    this.props.onDone();
  };

  onResponsesReceived = (err, response) => {
    if (err){
      this.setState({ hasLoaded: true });
      return;
    }
    const applesResponses = JSON.parse(response.text);
    this.setState({ hasLoaded: true, applesResponses });
  };

  render() {
    const {prompt} = this.props;
    const {hasLoaded, applesResponses} = this.state;
    if (!hasLoaded) return <div>Loading...</div>;

    // Use scene number for ordering, but then just number then naturally
    const sceneToResponses = _.groupBy(applesResponses, 'scene_number');
    return (
      <div>
        <div style={styles.instructions}>{prompt}</div>
        <div>{_.sortBy(Object.keys(sceneToResponses)).map((sceneNumber, index) => {
          if (sceneNumber === 'null') return null;
          return (
            <div key={sceneNumber}>
              <Card>
                <CardTitle
                  title={`Scene #${index + 1}`}
                  subtitle={sceneToResponses[sceneNumber][0]['scene_text']}
                />
                <CardText>
                  <div style={styles.cardContainer}>
                    {_.uniq(_.map(sceneToResponses[sceneNumber], 'anonymized_text')).map((anonymizedText, index) => {
                      const responseLetter = String.fromCharCode('A'.charCodeAt() + index);

                      return (
                        <Paper
                          key={anonymizedText}
                          style={styles.responseCard}
                          zDepth={3}>
                          <div>{`Response ${responseLetter}:`}</div>
                          <div style={{padding: 10}}>{anonymizedText}</div>
                        </Paper>
                      );
                    })}
                  </div>
                </CardText>
              </Card>
            </div>
          );
        })}</div>
        <div style={{margin: 20}}>
          <RaisedButton
            label="Start Part #3"
            secondary={true}
            onTouchTap={this.onButtonTapped} />
        </div>
      </div>
    );
  }
}

const styles = {
  instructions: {
    fontSize: 18,
    marginLeft: 15,
    marginTop: 30,
    marginBottom: 30
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  responseCard: {
    minHeight: 200,
    flex: 1,
    textAlign: 'left',
    marginBottom: 15,
    marginTop: 15,
    padding: 15,
    display: 'inline-block'
  }
};