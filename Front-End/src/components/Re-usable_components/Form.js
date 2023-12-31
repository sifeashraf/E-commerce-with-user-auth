//import hook
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

//import component
import Button from "react-bootstrap/Button";
import Cookies from "universal-cookie";

//import libaries
import axios from "axios";
import { login } from "../globalstate/Authslice";

//imprt css
import "bootstrap/dist/css/bootstrap.min.css";
import "../Access_Operations/Signup.css";

export default function Form({ operations, endpoint, email, name, naviGate, styleRegister }) {
  let dispatch = useDispatch();
  let [userdata, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    repassword: "",
  });
  let { token } = useSelector((data) => data.Authslice);
  let navgiate = useNavigate();
  const cookie = new Cookies();
  useEffect(() => {
    setUserData({ ...userdata, email: email, name: name });
  }, [name, email]);
  let [errormasge, seterrormasge] = useState([]);
  const dataHandler = (e) => {
    let value = e.target.value;
    let name = e.target.id;
    setUserData((prevData) => {
      return { ...prevData, [name]: value };
    });
  };
  let displayflex = {
    display: "flex",
  };
  let boxshadow = {
    boxShadow: "0px -1px 21px 0px rgba(138, 133, 138, 1)",
    width: "425px",
  };
  async function Submit(e) {
    // let errorarray = []; //empty array that will fill with error
    let errorarray = [];

    e.preventDefault();
    //usless if just to hide them all
    if (userdata) {
      //Regx for test the userdata data if match with serever requpments
      const regExpEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      const regExpName = /^[a-z ,.'-]+$/i;
      const regExppassword = /.*/;
      // const regExppassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

      if (
        userdata.email === "" ||
        userdata.name === "" ||
        userdata.password === "" ||
        userdata.repassword === ""
      ) {
        errorarray.push("please fill all inputs");
      }
      if (!regExpName.test(userdata.name)) {
        errorarray.push("please enter a valid name");
      }
      if (!regExpEmail.test(userdata.email)) {
        errorarray.push("please enter a valid email address");
      }
      if (!regExppassword.test(userdata.password)) {
        errorarray.push("please enter a valid password");
      }
      if (userdata.password !== userdata.repassword) {
        errorarray.push("please enter same password");
      }
      //   if there is an error on the data will loop over them
      let errorloop = errorarray.map((error, index) => {
        return <p key={index}> {error}</p>;
      });

      //send the error to usestate so it can be accessed from any where
      seterrormasge(errorloop);
      //genius move :)
      if (!errorloop.length) {
        //the request
        try {
          if (operations === "Update" || operations === "CreatUser") {
            let res = await axios.post(
              `http://127.0.0.1:8000/api/${endpoint}`,
              {
                name: userdata.name,
                email: userdata.email,
                password: userdata.password,
                password_confirmation: userdata.repassword,
              },
              {
                headers: {
                  Authorization: "Bearer " + token,
                },
              }
            );
          } else if (operations === "Register") {
            let res = await axios.post(`http://127.0.0.1:8000/api/${endpoint}`, {
              name: userdata.name,
              email: userdata.email,
              password: userdata.password,
              password_confirmation: userdata.repassword,
            });

            //add data to local storage
            const token = res.data.data.token;
            const user = res.data.data.user;

            cookie.set("Bearer", token);
            dispatch(login({ user, token }));
          }
          navgiate(naviGate || "/");
        } catch (error) {
          console.log(error);
        }

        setTimeout(() => {
          seterrormasge([]);
        }, 5000);
      }
    }
  }
  return (
    <>
      <div className="Main-form" style={styleRegister && displayflex}>
        <h1>{operations}</h1>
        <div className={`popup-error ${errormasge.length && "show"}`}>
          {errormasge}
          <span className={errormasge.length && "show"}></span>
        </div>
        <form onSubmit={Submit} style={styleRegister && boxshadow}>
          <div className="input-box">
            <label htmlFor="name">Enter Name:</label>
            <input
              type="text"
              placeholder="Enter Name..."
              id="name"
              value={userdata.name}
              onChange={dataHandler}
            />
          </div>
          <div className="input-box">
            <label htmlFor="email">Enter Email:</label>
            <input
              type="email"
              placeholder="Enter Email..."
              id="email"
              value={userdata.email}
              onChange={dataHandler}
            />
          </div>
          <div className="input-box">
            <label htmlFor="password">Enter Password:</label>
            <input
              type="password"
              placeholder="Enter Password..."
              id="password"
              value={userdata.password}
              onChange={dataHandler}
            />
            {userdata.password.length < 8 && userdata.password.length > 0 && (
              <p>password must have 8 number and at least 1 char</p>
            )}
          </div>
          <div className="input-box">
            <label htmlFor="repassword">repeat-password:</label>
            <input
              type="password"
              placeholder="repeat Password..."
              id="repassword"
              value={userdata.repassword}
              onChange={dataHandler}
            />
          </div>
          <Button variant="outline-primary" type="submit">
            {operations}
          </Button>
        </form>
      </div>
    </>
  );
}
