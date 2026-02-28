import React from "react";
import "./OurSupport.css";
import Metamsk from "../../../../public/webimg/Metamsk.png";
import Trust from "../../../../public/webimg/TrustWallet.png";
import Token from "../../../../public/webimg/TokenPocket.png";
import Safepal from "../../../../public/webimg/Safepal.png";
import Bitget from "../../../../public/webimg/Bitget.png";




export const OurSupport = () => {
  return (
    <div className="supporter-section">
      <h1>Supported Wallets</h1>

      <div className="supporter-wrapper flex-wrap">
        <h4 className="d-flex align-items-center gap-2"><span className="icon"><img src={Metamsk} alt="MetaMask" className="w-100 h-100" /></span> MetaMask </h4>
        <h4 className="d-flex align-items-center gap-2"><span className="icon"><img src={Trust} alt="Trust Wallet" className="w-100 h-100" /></span> Trust Wallet</h4>
        <h4 className="d-flex align-items-center gap-2"><span className="icon"><img src={Token} alt="Token Pocket" className="w-100 h-100" /></span> Token Pocket</h4>
        <h4 className="d-flex align-items-center gap-2"><span className="icon"><img src={Safepal} alt="Safepal" className="w-100 h-100" /></span> Safepal</h4>
        <h4 className="d-flex align-items-center gap-2"><span className="icon"><img src={Bitget} alt="Bitget" className="w-100 h-100" /></span> Bitget</h4>

      </div>
    </div>
  );
};

export default OurSupport;
