"use client"
import React, { useState } from 'react'
import classes from "./Button.module.css"
import Index from "./data/index"
import Element from './data/Element'




const Button = () => {

    const targetComp: React.FC = Index

    const [buttonData, setButtonData] = useState <any>(Index)
    const [inputString, setInputString] = useState("<button>Click me</button>") // default
    const [newData, setNewData] = useState<string>(
       `
       const style = 
        {
           color: "white",
           background: "grey", 
           height: "2rem",
           width: "6rem",
           border: "4px solid black",
           borderRadius: "4px",
           margin: "4rem"
       
       }
       
       const Index = () => {
           return (
               <button style={style}>Click Me...</button>
           )
       }
       export default Index;`
    )
    

    /* handler */

    /* 
    
    text input post to storage as TSX, on change get from storage 
    */

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputString(e.currentTarget.value)
    }
    const comp = `const Component = () => { return ( <>
    `
    const comp2 = `</> ) `
    return (
        <div className={classes.container}>
            <section className={classes.panelLeft} id="panelLeft">
                <h6 className={classes.heading}>Text Editor</h6>
                <p className={classes.rfc}>{comp}</p>
               <textarea id="textarea" onChange={handleChange} value={inputString} className={classes.input} />
                <p className={classes.rfcend}>{comp2} export default Component</p>
            </section>
            {/* text editor to follow */}
            <section className={classes.panelRight} id="panelRight">
                <h6 className={classes.heading}>Component</h6>
                <div className={classes.component}>
                    <Element inputString={inputString} />
                </div>
            </section>
        </div>

    )
}

export default Button