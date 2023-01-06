import { useEffect } from "react";

const Emoji = (props) => {
  const {
    classname,
    label,
    symbol,
  } = props;

  return (
    <span className={classname} role='img' aria-label={label}>
      {String.fromCodePoint(symbol)}
    </span>
  );
};

export default Emoji;