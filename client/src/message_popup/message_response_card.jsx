/* @flow weak */
import PropTypes from 'prop-types';

import React from 'react';

import * as Colors from 'material-ui/styles/colors';
import {Card, CardText} from 'material-ui/Card';


/*
Pure UI component showing a response to a question.
*/
export default class extends React.Component {
  props: {
    log: Object,
    extendStyle?: Object,
  };

  static displayName = 'MessageResponseCard';

  static propTypes = {
    log: PropTypes.object.isRequired,
    extendStyle: PropTypes.object
  };

  render() {
    const {log, extendStyle} = this.props;
    const style = {...styles.itemCard, ...extendStyle};

    return (
      <Card key="competency" style={style}>
        <CardText style={{fontSize: 16}}>
          <div>
            <div>{log.json.initialResponseText}</div>
            <div style={styles.responseLatency}>{`${Math.round(log.json.elapsedMs/1000)} seconds`}</div>
          </div>
        </CardText>
      </Card>
    );
  }
}

const styles = {
  itemCard: {
    borderBottom: '1px solid #eee',
    margin: 0
  },
  responseLatency: {
    marginTop: 10,
    color: Colors.grey500
  }
};