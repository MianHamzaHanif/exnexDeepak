// src/Components/Dashboard/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Web3 from "web3";
import "./Dash.css";
import "./responsive.css";
import Logo from "../../../public/logoimg/logo2.png";
import {
  exnexDeepakAddress as ContractAddress_Main,
  exnexDeepakAbi as Abi_Main,
} from "../../Services/exnexDeepakAddress";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contractOwner, setContractOwner] = useState("");
  const web3State = useSelector((state) => state.web3State);
  const account = (web3State?.account || "").toLowerCase();
  const isOwner = !!account && account === contractOwner.toLowerCase();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const fetchOwner = async () => {
      if (!window.ethereum) return;
      try {
        const web3 = window.web3 || new Web3(window.ethereum);
        const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
        const owner = await contract.methods.owner().call();
        setContractOwner(owner || "");
      } catch (error) {
        setContractOwner("");
      }
    };
    fetchOwner();
  }, []);

  return (
    <>
      <nav className={isCollapsed ? "collapsed-sidebar " : ""}>
        <div className="app-logo">
          <Link className="logo d-inline-block" to="/dashboard">
            <img alt="logo" src={Logo} />
          </Link>

          {/* Toggle Button */}
          <span
            className="bg-light-primary toggle-semi-nav"
            onClick={toggleSidebar}
          >
            <i className="fa-solid fa-chevron-right f-s-15 text-white" />
          </span>
        </div>

        <div className="app-nav" id="app-simple-bar">
          <ul className="main-nav p-0 mt-2">
            <li>
              <Link aria-expanded="true" className="" to="/dashboard">
                <i className="iconoir-home-alt"></i>dashboard
              </Link>
            </li>
            {/* <li>
              <Link aria-expanded="true" className="" to="/Trading">
                <i className="iconoir-home-alt"></i>Live Date
              </Link>
            </li> */}

            {/* <li>
              <a
                aria-expanded="false"
                className=""
                data-bs-toggle="collapse"
                href="#apps"
              >
                <i className="iconoir-apple-shortcuts" /> Activation
              </a>
              <ul className="collapse" id="apps">
                <li>
                  <Link to="/activationContract">Contract Activation</Link>
                </li>
                <li>
                  <Link to="/activationHistory">Activation / Upgrade History</Link>
                </li>
              </ul>
            </li> */}

            <li>
              <a
                aria-expanded="false"
                className=""
                data-bs-toggle="collapse"
                href="#ui-kits"
              >
                <i className="iconoir-handbag" /> My Team
              </a>
              <ul className="collapse" id="ui-kits">
                <li>
                  <Link to="/MyReferral">My Referral</Link>
                </li>
                <li>
                  <Link to="/LevelDetails">Level Details</Link>
                </li>
                <li>
                  <Link to="/VestingDirectIncome">Vesting Direct Income</Link>
                </li>
                {/* <li>
                  <Link to="/Downline">Downline</Link>
                </li> */}
              </ul>
            </li>

            <li>
              <a
                aria-expanded="false"
                className=""
                data-bs-toggle="collapse"
                href="#advance-ui"
              >
                <i className="iconoir-shopping-bag-plus" /> Incomes
              </a>
              <ul className="collapse" id="advance-ui">
                {/* <li>
                  <Link to="/TradingIncome">Trading Income</Link>
                </li> */}
                <li>
                  <Link to="/TradingIncome">Direct Income</Link>
                </li>
                <li>
                  <Link to="/LevelIncome">Level Income</Link>
                </li>
                <li>
                  <Link to="/RoiLevelIncome">ROI Level Income</Link>
                </li>
                <li>
                  <Link to="/WithdrawLevelIncome">Withdraw Level Income</Link>
                </li>
              </ul>
            </li>

            <li>
              <a
                aria-expanded="false"
                className=""
                data-bs-toggle="collapse"
                href="#icons"
              >
                <i className="iconoir-component" /> Withdrawal
              </a>
              <ul className="collapse" id="icons">
                <li>
                  <Link to="/Withdrawal">Withdrawal ROI</Link>
                </li>
                <li>
                  <Link to="/WithdrawalHistory">Withdrawal ROI History</Link>
                </li>
                <li>
                  <Link to="/VestingHistory">Vesting ROI History</Link>
                </li>
              </ul>
            </li>

            <li>
              <a
                aria-expanded="false"
                className=""
                data-bs-toggle="collapse"
                href="#salary-menu"
              >
                <i className="iconoir-wallet" /> Salary
              </a>
              <ul className="collapse" id="salary-menu">
                <li>
                  <Link to="/ClaimSalary">Claim Salary</Link>
                </li>
                <li>
                  <Link to="/SalaryIncome">Salary Income</Link>
                </li>
              </ul>
            </li>

            <li>
              <a
                aria-expanded="false"
                className=""
                data-bs-toggle="collapse"
                href="#pool-menu"
              >
                <i className="iconoir-coins" /> Pool
              </a>
              <ul className="collapse" id="pool-menu">
                <li>
                  <Link to="/ClaimPool">Claim Pool</Link>
                </li>
                <li>
                  <Link to="/PoolHistory">Pool History</Link>
                </li>
              </ul>
            </li>

            {isOwner && (
              <li className="no-sub">
                <Link to="/ApproveSalary">
                  <i className="iconoir-shield-check" /> Approve Salary
                </Link>
              </li>
            )}

            {/* <li className="no-sub">
              <a className="" href="/support"><i className="iconoir-bookmark-book" /> Support</a>
            </li> */}

            <li className="no-sub">
              <a className="" href="/">
                <i className="iconoir-chat-bubble-question" /> Logout
              </a>
            </li>
          </ul>
        </div>

        <div className="menu-navs d-none">
          <span className="menu-previous">
            <i className="ti ti-chevron-left" />
          </span>
          <span className="menu-next">
            <i className="ti ti-chevron-right" />
          </span>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
