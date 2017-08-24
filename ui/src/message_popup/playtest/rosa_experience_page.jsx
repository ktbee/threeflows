/* @flow weak */
import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import * as Api from '../../helpers/api.js';
import hash from '../../helpers/hash.js';
import LinearSession from '../linear_session/linear_session.jsx';
import SessionFrame from '../linear_session/session_frame.jsx';
import IntroWithEmail from '../linear_session/intro_with_email.jsx';

import QuestionInterpreter from '../renderers/question_interpreter.jsx';
import type {QuestionT} from './pairs_scenario.jsx';
import RosaScenario from './rosa_scenario.jsx';
import ResponseSummary from '../renderers/response_summary.jsx';

type ResponseT = {
  choice:string,
  question:QuestionT
};



// This is a scenario around bubble sort and classroom management.
export default React.createClass({
  displayName: 'RosaExperiencePage',

  propTypes: {
    query: React.PropTypes.shape({
      cohort: React.PropTypes.string,
      p: React.PropTypes.string,
      text: React.PropTypes.string
    }).isRequired
  },

  contextTypes: {
    auth: React.PropTypes.object.isRequired
  },

  // Cohort comes from URL
  getInitialState() {
    const contextEmail = this.context.auth.userProfile.email;
    const email = contextEmail === "unknown@mit.edu" ? '' : contextEmail;
    const cohortKey = this.props.query.cohort || 'default';

    return {
      email,
      cohortKey,
      questions: null,
      sessionId: uuid.v4()
    };
  },

  // Making questions from the cohort
  onStart(email) {
    const {cohortKey} = this.state;
    const allQuestions = RosaScenario.questionsFor(cohortKey);

    const startQuestionIndex = this.props.query.p || 0; // for testing or demoing
    const questions = allQuestions.slice(startQuestionIndex);
    const questionsHash = hash(JSON.stringify(questions));
    this.setState({
      email,
      questions,
      questionsHash
    });
  },

  onLogMessage(type, response:ResponseT) {
    const {email, cohortKey, sessionId, questionsHash} = this.state;
    
    Api.logEvidence(type, {
      ...response,
      sessionId,
      email,
      cohortKey,
      questionsHash,
      name: email
    });
  },

  render() {
    return (
      <SessionFrame>
        {this.renderContent()}
      </SessionFrame>
    );
  },

  renderContent() {
    const {questions} = this.state;
    if (!questions) return this.renderIntro();

    return <LinearSession
      questions={questions}
      questionEl={this.renderQuestionEl}
      summaryEl={this.renderClosingEl}
      onLogMessage={this.onLogMessage}
    />;
  },


  renderIntro() {
    return (
      <IntroWithEmail defaultEmail={this.state.email} onDone={this.onStart}>
        <div>
          <p>Welcome!</p>
          <p>This is an interactive case study simulating a conversation with a high school computer science student.</p>
          <p>You'll review the context on the scenario, share what you anticipate will happen, and then try it out!  Afterward you'll reflect on your experience with the simulation.</p>
          <p>Please use <a href="https://www.google.com/chrome/">Chrome</a> on a laptop or desktop computer.</p>
        </div>
      </IntroWithEmail>
    );
  },

  renderQuestionEl(question:QuestionT, onLog, onResponseSubmitted) {
    const forceText = _.has(this.props.query, 'text');
    return <QuestionInterpreter
      question={question}
      onLog={onLog}
      forceText={forceText}
      onResponseSubmitted={onResponseSubmitted} />;
  },

  renderClosingEl(questions:[QuestionT], responses:[ResponseT]) {
    return (
      <ResponseSummary responses={responses}>
        You've finished the simulation. Congrats! Below, you'll find your responses to the anticipate questions, the scenes with Rosa, and the reflection questions.
      </ResponseSummary>
    );
  }
});