/* @flow weak */
import _ from 'lodash';
import React from 'react';
import VelocityTransitionGroup from "velocity-react/velocity-transition-group";
import 'velocity-animate/velocity.ui';

import {TwisonT, TwinePassageT, TwineLinkT} from './twison_types.js';


/*
Viewer to show a specific passage in a Twison story, with
callbacks for when choices are made in that passage.
*/
export default class TwineViewer extends React.Component {
  displayName: 'TwineViewer'

  props: {
    twison: TwisonT,
    pid:number,
    onChoice:(passage:TwinePassageT, link:TwineLinkT) => void,
    onDone:() => void,
    allowUnsafeHtml:bool
  }

  render() {
    const {twison, pid} = this.props;
    const passage = _.find(twison.passages, { pid });

    return (
      <div className="choice" style={styles.container}>        
        <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}} runOnMount={true}>
          <div key={pid} style={styles.passageText}>{this.renderPassage(passage)}</div>
          {_.isUndefined(passage.links)
            ? <div onTouchTap={this.props.onDone} style={styles.twineChoice}>Done</div>
            : <div style={{paddingTop: 10}}>
              {passage.links.map((link) => {
                return (
                  <div
                    key={link.pid}
                    style={styles.twineChoice}
                    onTouchTap={() => this.props.onChoice(passage, link)}>
                    {link.name}
                  </div>
                );
              })}
            </div>
          }
        </VelocityTransitionGroup>
      </div>
    );
  }

  renderPassage(passage) {
    const {allowUnsafeHtml} = this.props;

    // Remove choices from text.  They're saved inline like [[text->tag]]
    // and also as data in `links`, so we'll just use `links`.
    const strippedRaw = passage.text.replace(/\[\[[^\]]*\]\]/g, '');

    // Since Twine supports embedding HTML tags,
    // allow using its contents as untrusted HTML.
    return (allowUnsafeHtml)
      ? <div dangerouslySetInnerHTML={{__html: strippedRaw}} /> // eslint-disable-line react/no-danger
      : strippedRaw; 
  }
}

const styles = {
  container: {
    fontSize: 20,
    padding: 0,
    margin:0,
    paddingBottom: 0
  },
  passageText: {
    padding: 10,
    lineHeight: 1.2
  },
  twineChoice: {
    paddingLeft: 20,
    paddingTop: 5,
    cursor: 'pointer',
    color: 'blue'
  }
};