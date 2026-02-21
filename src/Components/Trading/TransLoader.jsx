import React from "react";

const TransLoader = () => {
  return (
    <div id="transLoader" style={{ display: "none" }}>
      <div className="loader-content">
        <div className="spinner" />
        <p>Processing...</p>
      </div>
    </div>
  );
};

export default TransLoader;
