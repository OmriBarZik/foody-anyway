import React from "react";

function HomePage(props: { signButton: JSX.Element }) {
  return (
    <div>
      <h1>Foody anyway</h1>
      <p>best website for finding recopies that fits for you </p>
      {props.signButton}
    </div>
  );
}

export default HomePage;
