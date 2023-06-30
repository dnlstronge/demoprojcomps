"use client"
import React, { useState } from 'react'
import "../app/globals.css"
import classes from "./PanelLP.module.css"
import Link from 'next/link'
import PanelSection from './PanelSection'



const PanelLP= () => {
  return (
   
  
    <div className={classes.container}>
      <section className={classes.sidePanel}>
        <button className={classes.btn}>Section</button>
        <button className={classes.btn}>Pages</button>
        <button className={classes.btn}>Components</button>
        <Link href="/PanelSection"> <button className={classes.btn}>Iframe - Previewer</button></Link>
      </section>
      <section className={classes.section}>
        <PanelSection route={""} />
      </section>
    </div>
    
  )
}

export default PanelLP;