/* @flow weak */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import uuid from 'uuid';
import VelocityTransitionGroup from "velocity-react/velocity-transition-group";

import Divider from 'material-ui/Divider';

import * as Api from '../../helpers/api.js';
import LinearSession from '../linear_session/linear_session.jsx';
import SessionFrame from '../linear_session/session_frame.jsx';
import IntroWithEmail from '../linear_session/intro_with_email.jsx';
import RecordThenClassifyQuestion from '../linear_session/record_then_classify_question.jsx';
import {DansonScenarios} from './danson_scenarios.js';
import type {QuestionT} from './danson_scenarios.js';
import type {ResponseT} from './danson_scenarios.js';
import PlainTextQuestion from '../renderers/plain_text_question.jsx';
import MinimalOpenResponse from '../renderers/minimal_open_response.jsx';
import MinimalTextResponse from '../renderers/minimal_text_response.jsx';
import MixedQuestion from '../renderers/mixed_question.jsx';
import OkResponse from '../responses/ok_response.jsx';
import * as Routes from '../../routes.js';
import ReadMore from '../renderers/read_more.jsx';

type NextQuestionT = {
  id:number,
  question:QuestionT,
  responses:[ResponseT]
};

// The top-level page, manages logistics around email, questions,
// and the display of instructions, questions, and summary.
export default class extends React.Component {
  static displayName = 'DansonExperiencePage';

  static propTypes = {
    query: PropTypes.shape({
      p: PropTypes.string
    }).isRequired
  };

  static contextTypes = {
    auth: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
    const contextEmail = context.auth.userProfile.email;
    const email = contextEmail === "unknown@mit.edu" ? '' : contextEmail;

    this.state = {
      email,
      questions: null,
      sessionId: uuid.v4()
    };
  }

  onStart = (email) => {
    const startQuestionIndex = this.props.query.p || 0; // for testing or demoing
    const allQuestions = DansonScenarios.questions();
    const questions = allQuestions.slice(startQuestionIndex);
    this.setState({
      email,
      questions
    });
  };

  onLogMessage = (type, response:ResponseT) => {
    const {email, sessionId} = this.state;
    Api.logEvidence(type, {
      ...response,
      sessionId,
      email,
      name: email,
      clientTimestampMs: new Date().getTime(),
    });
  };

  onGetNextQuestion = (questions:[QuestionT], responses:[ResponseT]) => {
    // This function removes questions that will not be shown to the user based on the user's prior choices.
    
    const allQuestions = questions.slice();

    if (responses.length >= allQuestions.length) {
      return null;
    }
    
    const question = allQuestions[responses.length];
    return {id: question.id, question:question, responses:responses};
  };

  render() {
    return (
      <SessionFrame>
        {this.renderContent()}
      </SessionFrame>
    );
  }

  renderContent = () => {
    const {questions} = this.state;
    if (!questions) return this.renderIntro();

    return <LinearSession
      questions={questions}
      questionEl={this.renderQuestionEl}
      getNextQuestion={this.onGetNextQuestion}
      summaryEl={this.renderSummaryEl}
      onLogMessage={this.onLogMessage}
    />;
  };

  renderIntro = () => {
    return (
      <IntroWithEmail defaultEmail={this.state.email} onDone={this.onStart}>
        <div>
          <p>Welcome!</p>
          <p>You will go through a couple of activities that are designed to make you better prepared for a potentially difficult parent-teacher conference you might experience as a new teacher.</p>
          <p>You need to use a computer/laptop that has a mic because you will need to do audio recordings.</p>
          <p>This simulation is based on work that has been done by Professor Benjamin Dotger at Syracuse University as documented in his book: "I Had No Idea" Clinical Simulations for Teacher Development.</p>
          <p>This activity would take about 30 minutes.</p>
        </div>
      </IntroWithEmail>
    );
  };

  renderQuestionEl = (nextQuestion:NextQuestionT, onLog, onResponseSubmitted) => {
    const {question, responses} = nextQuestion;

    if (question.stage === 'scenario') {
      if (question.choices.length > 0) {
        return <RecordThenClassifyQuestion
          key={question.id}
          question={question}
          choices={question.choices}
          onLogMessage={onLog}
          onResponseSubmitted={onResponseSubmitted}
          forceResponse={true}
        />;
      } else {
        return (
          <div>
            <PlainTextQuestion question={question} />
            <MinimalOpenResponse
              responsePrompt=""
              recordText="Respond"
              onLogMessage={onLog}
              forceResponse={true}
              onResponseSubmitted={onResponseSubmitted}
            /> 
          </div>
        ); 
      }
    }

    if (question.stage === 'prereflect') {
      return (
        <div key={JSON.stringify(question)}>
          <MixedQuestion question={question} />
          <MinimalTextResponse
            forceResponse={true}
            responsePrompt="Your Answer"
            recordText="NEXT"
            onLogMessage={onLog}
            onResponseSubmitted={onResponseSubmitted}
          />
        </div>
      );
    }

    if (question.stage === 'postreflect') {
      return (
        <div key={JSON.stringify(question)}>
          <MixedQuestion question={question} />
          <MinimalTextResponse
            forceResponse={true}
            responsePrompt="Your Answer"
            recordText="NEXT"
            onLogMessage={onLog}
            onResponseSubmitted={onResponseSubmitted}
          />
          {this.renderScenarioResponsesEl(this.state.questions, responses)}
        </div>
      );
    }

    // info
    return (
      <div key={JSON.stringify(question)}>
        <MixedQuestion question={question} />
        <OkResponse
          label="NEXT"
          onLogMessage={onLog}
          onResponseSubmitted={onResponseSubmitted}
        />
      </div>
    );

  };

  renderScenarioResponsesEl = (questions:[QuestionT], responses:[ResponseT]) => {
    const responsesEl = [];
    for(let i = 0; i < questions.length; i++) {
      if(questions[i].stage !== 'scenario') {
        continue;
      }
      responsesEl.push(
        <div key={"question-" + i} style ={_.merge(styles.instructions, styles.summaryQuestion)}>
          <ReadMore fulltext={questions[i].text}/>
          <audio key={'response-' + i} controls={true} src={responses[i].audioResponse.downloadUrl} style={{paddingTop: 10, paddingBottom: 20}}/>
          <Divider />
        </div>
      );
    }

    return (
      <div className="done">
        <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}} runOnMount={true}>
          <p style={styles.summaryTitle}>Simulation Summary</p>
          <Divider />
          {responsesEl}
          <div style={styles.container} />
        </VelocityTransitionGroup>
      </div> 
    );
  };

  renderSummaryEl = (questions:[QuestionT], responses:[ResponseT]) => {
    return (
      
      <div className="done">
        <b style={{
          display: 'block',
          padding: '15px 20px 15px',
          background: '#09407d',
          color: 'white'
        }}>Done</b>
        <div style={styles.doneTitle}>
          <p style={styles.paragraph}>You have now completed the simulation and personal reflections</p>
          <p style={styles.paragraph}><a href={Routes.Home}>Back to Home</a></p>
        </div>
      </div> 
    );
  };
}

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
  },
  summaryQuestion: {
    whiteSpace: 'pre-wrap',
    fontSize: 16,
    lineHeight: 1.2,
    paddingTop: 10,
    paddingBottom: 10
  }
};