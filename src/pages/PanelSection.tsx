"use client"
import React, { useState } from 'react'
import classes from "./PanelSection.module.css"
import "../app/globals.css"


/* so app =====> posts on live server =====> rendered In Iframe here */
// Too simplistic? 
// preview display gets specific route from inoput and renders
// - add hide/show

const PanelSection: React.FC<{ route: string }> = (props) => {

  const [stringInput, setStringInput] = useState("")
  const [showIframe, setShowIframe] = useState(false)
  const [inputOne, setInputOne] = useState("")
  const [inputTwo, setInputTwo] = useState("")
  const [currentHost, setCurrentHost] = useState("")
  const [expandPrev, setExpandPrev] = useState(false)
  const togglePrev = () => {
    setShowIframe(!showIframe)
    const host = location.href
    //console.log(host)
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

  /* animation - dropdown expand*/


  /* animition - iframe expand */
  const iframeExpand = showIframe ? classes.iframe : classes.iframeStart 
  return (

    <div className={classes.container}>
      <section className={classes.inputSection}>
        <textarea value={inputOne} onChange={handleChangeInput} className={classes.input}></textarea>
        <button onClick={togglePrev} className={classes.prevBtn}>Preview Route</button>
        <button onClick={handleTestHost} className={classes.prevBtn}>Set Current URL</button>
      </section>

      {/* <section className={classes.inputSection}>
        <textarea className={classes.input}></textarea>
        <button onClick={togglePrev} className={classes.prevBtn}>Preview File</button>
      </section> */}

      <section>
        {/* IFRAME GOES HERE */}

       
          <iframe className={iframeExpand} title="Testing Iframe" src={inputOne}></iframe>
      </section>

    </div>
  )
}

export default PanelSection
