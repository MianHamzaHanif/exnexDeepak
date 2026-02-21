import React from "react";
import "../Dashboard/Dash.css";
import "../Dashboard/responsive.css";
import Logo from "../../../public/logoimg/logo.png";
import Loginimage from "../../../public/loginimage/01.png";



const Forget = () => {
  return (
    <>
      <div className="app-wrapper d-block">
        <div className="main-container">
          {/* Reset Your Password start */}
          <div className="container">
            <div className="row sign-in-content-bg">
              <div className="col-lg-6 image-contentbox d-none d-lg-block">
                <div className="form-container">
                  <div className="signup-content mt-4">
                    <span>
                      <img alt="logo" className="img-fluid " src={Logo} />
                    </span>
                  </div>
                  <div className="signup-bg-img">
                    <img
                      alt=""
                      className="img-fluid"
                      src={Loginimage}
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-6 form-contentbox">
                <div className="form-container">
                  <form className="app-form rounded-control">
                    <div className="row mx-0">
                      <div className="col-12">
                        <div className="mb-5 text-center text-lg-start">
                          <h2 className="text-primary-dark f-w-600">
                            Reset Your Password
                          </h2>
                          <p>Create a new password and sign in to admin</p>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="password"> New Password</label>
                          <input className="form-control" id="password" placeholder="Enter Your Password" type="password"/>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="password">
                            Confirm Password
                          </label>
                          <input
                            className="form-control"
                            id="password1"
                            placeholder="Enter Your Password"
                            required=""
                            type="password"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <a
                            className="btn btn-light-primary w-100"
                            href="/signup"
                            role="button"
                          >
                            Reset Password
                          </a>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* Reset Your Password end */}
        </div>
      </div>
    </>
  );
};

export default Forget;
