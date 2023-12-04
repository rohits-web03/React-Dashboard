import { useState } from "react";
import Dashboard from "./Components/Dashboard"
import "./index.css";

function App() {
  const [theme,setTheme]=useState("Light");
  const toggleTheme=()=>{
      theme==="Light"? setTheme("Dark"):setTheme("Light");
  }
  return (
      <div className={theme}>
        <h1 className="heading">Admin Dashboard</h1> 
        <Dashboard theme={theme} changeTheme={toggleTheme}/>
      </div>
  )
}

export default App
