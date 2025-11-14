import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import './index.css';

import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

import awsConfig from './amplifyconfiguration.json';
Amplify.configure(awsConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);