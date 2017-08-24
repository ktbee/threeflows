/* @flow weak */
import React from 'react';

import ResponsiveFrame from '../../components/responsive_frame.jsx';
import NavigationAppBar from '../../components/navigation_app_bar.jsx';


// The frame for an entire session, with responsiveness and menus.
export default React.createClass({
  displayName: 'SessionFrame',

  propTypes: {
    children: React.PropTypes.node
  },

  render() {
    const {children} = this.props;
    return (
      <div className="SessionFrame">
        <ResponsiveFrame>
          <div>
            <NavigationAppBar title="Teacher Moments" iconElementLeft={<div />} />
            {children}
          </div>
        </ResponsiveFrame>
      </div>
    );
  }
});
