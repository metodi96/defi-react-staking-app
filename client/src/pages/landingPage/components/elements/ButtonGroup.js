import React from 'react';
import classNames from 'classnames';

import '../../assets/scss/landingPage.scoped.scss';

const ButtonGroup = ({
  className,
  ...props
}) => {

  const classes = classNames(
    'button-group',
    className
  );

  return (
    <div
      {...props}
      className={classes}
    />
  );
}

export default ButtonGroup;