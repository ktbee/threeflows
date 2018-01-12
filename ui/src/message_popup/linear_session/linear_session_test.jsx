/* @flow weak */
import React from 'react';

import {shallow} from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon';

import LinearSession from './linear_session.jsx';
import VelocityTransitionGroup from "velocity-react/velocity-transition-group";
import {InsubordinationScenarios} from '../playtest/insubordination_scenarios.js';

describe('<LinearSession />', ()=>{
  it('renders', ()=>{
    const props = {
      questions: InsubordinationScenarios.questionsFor(0),
      questionEl: sinon.spy(),
      summaryEl: sinon.spy(),
      onLogMessage: sinon.spy()
    };
    const wrapper = shallow(<LinearSession {...props} />);
    expect(wrapper.find(VelocityTransitionGroup)).to.have.length(1);
  });

  it('respects getNextQuestion prop and passes that through to questionEl', ()=>{
    const props = {
      questions: InsubordinationScenarios.questionsFor(0),
      questionEl: sinon.spy(),
      summaryEl: sinon.spy(),
      getNextQuestion: (questions, responses) => {
        return 'foo';
      },
      onLogMessage: sinon.spy()
    };
    const wrapper = shallow(<LinearSession {...props} />);
    expect(wrapper.find(VelocityTransitionGroup)).to.have.length(1);

    expect(props.questionEl.getCalls().length).to.equal(1);
    const renderCall = props.questionEl.getCall(0);
    expect(renderCall.args.length).to.equal(4);
    expect(renderCall.args[0]).to.equal('foo'); // passes question
    expect(renderCall.args[3]).to.deep.equal({ responses: [] }); // passes options:{responses}
  });

  it('provides default getNextQuestion', ()=>{
    const props = {
      questions: ['bar', 'baz'],
      questionEl: sinon.spy(),
      summaryEl: sinon.spy(),
      onLogMessage: sinon.spy()
    };
    const wrapper = shallow(<LinearSession {...props} />);
    expect(wrapper.find(VelocityTransitionGroup)).to.have.length(1);

    expect(props.questionEl.getCalls().length).to.equal(1);
    const renderCall = props.questionEl.getCall(0);
    expect(renderCall.args.length).to.equal(4);
    expect(renderCall.args[0]).to.equal('bar'); // passes question
    expect(renderCall.args[3]).to.deep.equal({ responses: [] }); // passes options:{responses}
  });

  it('takes responses, logs them with question merged, and updates state', ()=>{
    const props = {
      questions: InsubordinationScenarios.questionsFor(0),
      questionEl: sinon.spy(),
      summaryEl: sinon.spy(),
      onLogMessage: sinon.spy()
    };
    const wrapper = shallow(<LinearSession {...props} />);
    wrapper.instance().onResponseSubmitted({ q: 'bar' }, { foo: 'black_box_response' });
    expect(wrapper.instance().state.responses).to.deep.equal([{
      question: { q: 'bar' },
      foo: 'black_box_response'
    }]);
    expect(props.onLogMessage.callCount).to.equal(1);
  });
});