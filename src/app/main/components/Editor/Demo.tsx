"use client"
import React, { useState, useEffect } from 'react'
import classes from "./Demo.module.css"
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import Nav from "../../../../Nav/Nav"
import styled from "styled-jsx";
import target from "./data/target"


const Demo = () => {

 

    const [newTarget, setNewTarget] = useState("")
    const [inputString, setInputString] = useState<any>("<button>Click me</button>") // default
    const [currentCode, setCurrentCode] = useState(`() => {return <button>Click me</button>}`)
    


/* for editor -  */

const targets = {
     button : `() => {return <button>Click me</button>}`,
     heading:`() => {return <h3>Heading</h3>}`,
     div:`() => {return <div>I am a div</div>}`,
     likes: `() => {
        const [likes, increaseLikes] = React.useState(0);
      
        return (
          <>
            <p>{likes} likes</p>
            <button onClick={() => increaseLikes(likes + 1)}>Like</button>
          </>
        )
      }`
}

 

/* handlers */

     const handleTarget = (target: string) => {
        setCurrentCode(targets[target])
     }

     const monitorChange = () => {

     }


    return (
        <>
        <div className={classes.top}>
          <Nav setTarget={handleTarget}/>
        </div>
        <div className={classes.container}>  
            <LiveProvider code={currentCode}>
                <LiveEditor className={classes.liveEdit} />
                <LiveError className={classes.liveErr}/>
                <LivePreview className={classes.livePrev} />
            </LiveProvider>
        </div>
        </>
    )
}

/* 

 <section className={classes.panelLeft} id="panelLeft">
                <h6 className={classes.heading}>Text Editor</h6>
               <textarea id="textarea" onChange={handleChange} value={inputString} className={classes.input} />
               <button onClick={handlePreview} className={classes.prevbtn}>Preview</button>
            </section>
          
            <section className={classes.panelRight} id="panelRight">
                <h6 className={classes.heading}>Component</h6>
                <div className={classes.component}>  
                
                </div>
            </section> */

export default Demo;