/* @flow weak */
import _ from 'lodash';
import React from 'react';

import Divider from 'material-ui/Divider';

import * as Api from '../../helpers/api.js';
import hash from '../../helpers/hash.js';
import LinearSession from '../essence/linear_session.jsx';
import SessionFrame from '../essence/session_frame.jsx';
import IntroWithEmail from '../essence/intro_with_email.jsx';
import PlainTextQuestion from '../renderers/plain_text_question.jsx';
import ChoiceForBehaviorResponse from '../renderers/choice_for_behavior_response.jsx';
import MinimalAudioResponse from '../renderers/minimal_audio_response.jsx';

type QuestionT = {
  id:number,
  condition:string,
  choices:[string],
  text:string
};
type ResponseT = {
  choice:string,
  question:QuestionT
};


// Make questions for an email, describe choices.
const ScenarioMaker = {
  choices() {
    return [
      'ignore the behavior',
      'make eye contact',
      'make a facial expression or gesture',
      'make a joke',
      'encourage the student',
      'redirect the student to the task',
      'remind the student of the class rules',
      'ask the student to stay after class',
      'send the student to the principal',
      'call an administrator to class'
    ];
  },

  // Given an email, return a cohortKey.
  cohortKey(email) {
    const {conditions} = this.data();
    return hash(email) % conditions.length;
  },

  data() {
    // Read scenario
    const conditions = [{child: 'Jake' }, {child: 'Greg'}, {child: 'Darnell'}, {child: 'DeShawn'}];
    const questionTemplates = [
      'Students are working independently on a proportions problem set.  You circulate around the room.',
      '${child} is sleeping in class.',
      'He picks his head up. He chooses to rest it on his hand and continue to sleep.',
      '${child} refuses to do work.',
      'He refuses.'
    ];

    return {conditions, questionTemplates};
  },

  // Return questions for cohortKey.
  // This involves taking description from yaml and making it concrete.
  questions(cohortKey) {
    const {conditions, questionTemplates} = this.data();
    const condition = conditions[cohortKey];
    const questions = questionTemplates.map((template, index) => {
      const text = _.template(template)(condition);
      const question:QuestionT = {
        id: hash(text),
        condition: condition,
        choices: (index === 0) ? ['OK'] : this.choices(),
        text: text
      };
      return question;
    }, this);

    return questions;
  }
};




// The top-level page, manages logistics around email, cohorts and questions,
// and the display of instructions, questions, and summary.
//
// Want a new scenario?
//   define the questions
//   add interactions for showing questions and responding
//   add any cohorting to creating questions
//
// TODO(kr) factor out email handling
export default React.createClass({
  displayName: 'EssencePage',

  contextTypes: {
    auth: React.PropTypes.object.isRequired
  },

  getInitialState() {
    const contextEmail = this.context.auth.userProfile.email;
    const email = contextEmail === "unknown@mit.edu" ? '' : contextEmail;
    const cohortKey = ScenarioMaker.cohortKey(email);

    return {
      email,
      cohortKey,
      questions: null
    };
  },

  // Making the cohort and questions is the key bit here.
  onStart(email) {
    const cohortKey = ScenarioMaker.cohortKey(email);
    const questions = ScenarioMaker.questions(cohortKey);
    this.setState({
      email,
      questions,
      cohortKey
    });
  },

  onResetSession() {
    this.setState({ questions: null });
  },

  onLogMessage(type, response:ResponseT) {
    const {email, cohortKey} = this.state;
    Api.logEvidence(type, {
      ...response,
      cohortKey,
      email,
      name: email
    });
  },

  render() {
    return (
      <SessionFrame onResetSession={this.onResetSession}>
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
      summaryEl={this.renderSummaryEl}
      onLogMessage={this.onLogMessage}
    />;
  },

  renderIntro() {
    return (
      <IntroWithEmail defaultEmail={this.state.email} onDone={this.onStart}>
        <div>
          <p>Welcome!</p>
          <p>Imagine you're a middle school math teacher in an urban public school.</p>
          <p>You will go through a set of scenarios that simulate a conversation between you and a student.</p>
          <p>Provide an audio response to each prompt. Please respond like you would in a real conversation.</p>
        </div>
      </IntroWithEmail>
    );
  },

  renderQuestionEl(question:QuestionT, onLog, onResponseSubmitted) {
    return (
      <div>
        <PlainTextQuestion question={question} />
        <MinimalAudioResponse
          onResponseSubmitted={this.onDoneAudio}
          onLogMessage={onLog}
        />
        <ChoiceForBehaviorResponse
          choices={question.choices}
          onLogMessage={onLog}
          onResponseSubmitted={onResponseSubmitted}
        />
      </div>
    );
  },

  renderSummaryEl(questions:[QuestionT], responses:[ResponseT]) {
    return (
      <div style={{padding: 20}}>
        <div style={{paddingBottom: 20, fontWeight: 'bold'}}>Thanks!  Here are your responses:</div>
        {responses.map((response, i) =>
          <div key={i} style={{paddingTop: 10}}>
            <div>{response.question.text}</div>
            <div>> {response.choice}</div>
            <Divider style={{marginTop: 15}} />
          </div>
        )}
      </div>
    );
  }
});