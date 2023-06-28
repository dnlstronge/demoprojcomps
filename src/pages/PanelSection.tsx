"use client"
import React, { useState } from 'react'
import classes from "./PanelSection.module.css"
import "../app/globals.css"


/* so app =====> posts on live server =====> rendered In Iframe here */

const PanelSection = () => {

  const [stringInput, setStringInput] = useState(`http://localhost:3000/`)
  const [showStringInput, setShowStringInput] = useState(false)

  const setIframe = () => {
      setShowStringInput(!showStringInput)
      }

    
  return (
    <div className={classes.container}>
      <section className={classes.inputSection}>
        <textarea className={classes.input}></textarea>
        <button onClick={setIframe} className={classes.prevBtn}>Preview File</button>
      </section>

      <section>
       {/* I FRAME GOES HERE */}
       <iframe title="Testing Iframe" src={stringInput} width="540" height="450"></iframe>
      </section>
    
    </div>
  )
}

export default PanelSection
