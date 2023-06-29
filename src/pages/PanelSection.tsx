"use client"
import React, { useState } from 'react'
import classes from "./PanelSection.module.css"
import "../app/globals.css"


/* so app =====> posts on live server =====> rendered In Iframe here */
// front end inits node which runs proj + sends server data to front-end. 
// preview displays preview in template, gets specific route and renders

const PanelSection: React.FC<{ route: string }> = (props) => {

  const [stringInput, setStringInput] = useState("")
  const [showStringInput, setShowStringInput] = useState(false)
  const [inputOne, setInputOne] = useState("")
  const [inputTwo, setInputTwo] = useState("")
  const [currentHost, setCurrentHost] = useState("")
  const togglePrev = () => {
    setShowStringInput(!showStringInput)
    const host = location.href
    console.log(host)
    setCurrentHost(host)
  }


  /* change handlers */
  const handleChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    setInputOne(e.currentTarget.value)
  }
  const handleTestHost = () => {
    const appendURL = `${currentHost}`
    setInputOne(appendURL)
    console.log(appendURL)
  } 

  return (
    <div className={classes.container}>
      <section className={classes.inputSection}>
        <textarea value={inputOne} onChange={handleChangeInput} className={classes.input}></textarea>
        <button onClick={togglePrev} className={classes.prevBtn}>Preview Route</button>
        <button onClick={handleTestHost} className={classes.prevBtn}>Set Host URL</button>
      </section>

      {/* <section className={classes.inputSection}>
        <textarea className={classes.input}></textarea>
        <button onClick={togglePrev} className={classes.prevBtn}>Preview File</button>
      </section> */}

      <section>
        {/* I FRAME GOES HERE */}

        {showStringInput &&
          <iframe className={classes.iframe} title="Testing Iframe" src={inputOne}></iframe>}
      </section>

    </div>
  )
}

export default PanelSection
