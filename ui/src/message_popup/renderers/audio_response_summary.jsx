/* @flow weak */
import _ from 'lodash';
import React from 'react';
import VelocityTransitionGroup from "velocity-react/velocity-transition-group";
import Divider from 'material-ui/Divider';

import ReadMore from './read_more.jsx';

/*
Component that displays the summary of audio responses.
*/
export default React.createClass({
  displayName: 'AudioResponseSummary',

  propTypes: {
    audioResponses: React.PropTypes.array.isRequired,
  },

  render() {
    const audioResponses = [];
    const reviewedQuestions = {};  // Keeps track of reviewedQuestions to ensure we only show the last response if the user does multiple retries.
    this.props.audioResponses.map((arObj, i) => {
      var obj = {};
      obj.audioUrl = arObj.blobUrl;
      obj.questionText = arObj.question.text;
      var questionId = arObj.question.id;
      if(questionId in reviewedQuestions) {
        audioResponses[reviewedQuestions[questionId]] = obj;
      } else {
        reviewedQuestions[questionId] = audioResponses.length;
        audioResponses.push(obj);
      }
    });

    return (
      <div className="done">
        <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}} runOnMount={true}>
          <div style={styles.doneTitle}>
            <p style={styles.paragraph}>You've finished the simulation.</p>
            <p style={styles.paragraph}><strong>Do not close this page</strong>. You will need it for the reflection.</p>
            <p style={styles.paragraph}>Please return to the form for the post-simulation reflection.</p>
          </div>
          <p style={styles.summaryTitle}>Summary</p>
          <Divider />
          {audioResponses.map((obj, i) =>
            <div key={i} style ={_.merge(styles.instructions)}>
              <ReadMore fulltext={obj.questionText} />
              <audio controls={true} src={obj.audioUrl} />
              <Divider />
            </div>
          )}
          <div style={styles.container} />
        </VelocityTransitionGroup>
      </div> 
    );
  },
  
});

const styles = {
  done: {
    padding: 20,
  },
  container: {
    fontSize: 20,
    padding: 0,
    margin:0,
    paddingBottom: 45
  },
  button: {
    marginTop: 20
  },
  doneTitle: {
    padding: 20,
    paddingBottom: 0,
    margin:0,
  },
  instructions: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  paragraph: {
    marginTop: 20,
    marginBottom: 20
  },
  summaryTitle: {
    fontSize: 20,
    padding: 20,
    paddingBottom: 5,
    margin: 0,
    fontWeight: 'bold'
  }

};