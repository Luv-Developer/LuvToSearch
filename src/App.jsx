import React from "react"
import {Routes,Route} from "react-router-dom"
import Home from "./components/Home"
import Profile from "./components/Profile"
import Search from "./components/Search"
import Result from "./components/Result"

const App = () => {
  return(
    <>
    <Routes>
      <Route path = "/" element = {<Home/>} />
      <Route path = "/profile" element = {<Profile/>} />
      <Route path = "/search" element = {<Search/>} /> 
      <Route path = "/result/:search" element = {<Result/>} />
    </Routes>
    </>
  )
}

export default App 


