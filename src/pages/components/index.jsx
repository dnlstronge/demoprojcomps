import React, { useState } from 'react'
import classes from "./index.module.css"
import Button from "../../app/components/Button"
import "../../app/globals.css"

/*
[todo]

page to show different componets with descriptions and links to code as well 
as demonstration, could use react-live editor for display? 
image/link to component being used
store component data in db so does not need hardcoded
fetch data and map
create individual custom component
*/

const Index = () => {

  const [jsxElement, setJsxElement] = useState("")


  // store in state
  const handleSave = () => {
    setJsxElement(Button)

  }

  // send to db
  const handleStore = () => {
    console.log(jsxElement)
  }

  
  // recover from db
  return (
    <div className={classes.container}>
        <h3 className={classes.heading}>Components</h3>
        <section>{/* Expandible container holds data, demo and link as well as code for 
            preview component, info on how/ where to use etc
         */}</section>
         <section className={classes.btnSection}>
         <button onClick={handleSave} className={classes.btn}>Get JSX</button>
         <button onClick={handleStore} className={classes.btn} >Store JSX</button>
         <button className={classes.btn}>Render JSX</button>
         </section>
        
    </div>
  )
}

export default Index;