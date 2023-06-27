"use client"
import { ChangeEvent, useState } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import Image from 'next/image'
import classes from "./page.module.css"
import Nav from "../Nav/Nav"



const code = `<h3 style={{
  background: 'darkslateblue',
  color: 'white',
  padding: 8,
  borderRadius: 4
}}>
  Hello Y'all! 👋
</h3>`

/* hardcoded examples  */

// button

const sampleButton = `function  MyButton() { return <h3 style={{
  background: 'black',
  color: 'white',
  padding: 8,
  borderRadius: 10,
  margin: "2rem"
  
}}>
  Click me!
</h3>}`



export default function Home() {


  /* TODO - get data from database after - can you get an output from editor if so - 
  save output to db, retrieve on select saved and populate state with use effect  */

  const [codeInput, setCodeInput] = useState(
    `<h3 style={{
      background: 'darkslateblue',
      color: 'white',
      padding: 8,
      borderRadius: 4
    }}>
      Hello World! 👋
    </h3>`
  )


/* change state & code input */

const handleInput = (e: React.MouseEvent<HTMLButtonElement>) => {
  
  if(e.currentTarget.value === "button") {setCodeInput(sampleButton)}
}
const handleReset = () => {
  setCodeInput("")
}

  return (
    <main className=''>
      <h5 className={classes.titleHead}> Demonstration - Implementation of React-live - allows for rendering of components in preview
      works based of hardcoded strings hooked up to buttons in place of functioning backend. Instead could be
      supplied with db data saved by user and passed to editor via state/side effect. Would allow  an authenticated user to save 
      working components and recall. Would need to hook up editor output though. 
      </h5>
      <section className={classes.buttons}>
        <button onClick={handleInput} value="button" className={classes.btn}>Button</button>
        <button className={classes.btn}>Div</button>
        <button className={classes.btn}>Click Event</button>
        <button className={classes.btn}>Form</button>
        <button className={classes.btn}>Heading</button>
        <button onClick={handleReset} className={classes.reset}>Clear</button>
      </section>
      <section className={classes.codeeditor} >
      <LiveProvider  noInline={false} code={codeInput}>
              <section className={classes.panels} >
              <LiveEditor className={classes.edit} />
              <LivePreview className={classes.prev} />
              </section>
              <section className={classes.errorSection}>
                <h6 className={classes.headError}>Error Log</h6>
                  <LiveError className={classes.error} />
                  </section>
             </LiveProvider>
      </section>
            
    </main>
  )
}
