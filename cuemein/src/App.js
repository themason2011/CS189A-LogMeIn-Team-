
import Tool from './components/Tool'
import Camera from "./components/Camera"
import Dominant from "./components/Dominant"
import React, {useState} from 'react'
// import {BrowserFouter as Router, Switch, Route} from "react-router-dom"


function App() {
  return (
<div>
    <div>
    <Camera />
    </div>
    <div>
    <Dominant />
    </div>
    <div>
    <Tool/>
    </div>


</div>
  );
}

export default App;
