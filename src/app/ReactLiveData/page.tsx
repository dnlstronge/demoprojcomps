"use client"
import { ChangeEvent, useState } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import Image from 'next/image'
import classes from "../page.module.css"



const code = `<h3 style={{
  background: 'darkslateblue',
  color: 'white',
  padding: 8,
  borderRadius: 4
}}>
  Hello Y'all! 👋
</h3>`

/* hardcoded examples  */


const sampleCounter = `

type Props = {
  label: string;
}
const Counter = (props: Props) => {
  const [count, setCount] =
    React.useState<number>(0)
  return (
    <div>
      <h3 style={{
        background: 'darkslateblue',
        color: 'white',
        padding: 8,
        borderRadius: 4
      }}>
        {props.label}: {count} 🧮
      </h3>
      <button
      style={{
      background: 'black',
      margin: "2rem",
      padding: "0.5rem",
      borderRadius: "4px"
      }}
        onClick={() =>
          setCount(c => c + 1)
        }>
        Increment
      </button>
    </div>
  )
}
render(<Counter label="Counter" />)`

const sampleWrapper = `const Wrapper = ({ children }) => (
  <div style={{
    background: 'papayawhip',
    width: '100%',
    padding: '2rem'
  }}>
    {children}
  </div>
)

const Title = () => (
  <h3 style={{ color: 'palevioletred' }}>
    I am a heading inside a wrapper!
  </h3>
)

render(
  <Wrapper>
    <Title />
  </Wrapper>
)`

const sampleHead = `<h3 style={{
  background: 'darkslateblue',
  color: 'white',
  padding: 8,
  borderRadius: 4
}}>
  Hello Y'all! 👋
</h3>
`

const sampleButton = `function  MyButton() { return <h3 style={{
  background: 'black',
  color: 'white',
  padding: 8,
  borderRadius: 10,
  margin: "2rem"
  
}}>
  Click me!
</h3>}`

const sampleDiv = `function  MyDiv() { return <div style={{
  background: 'black',
  color: 'white',
  padding: "4rem",
  borderRadius: 10,
  height: "10rem",
  margin: "2rem"
  
}}>
  I am a DIV!
</div>}`



export default function Home() {


  /* TODO - get data from database after - can you get an output from editor if so - 
  save output to db, retrieve on select saved and populate state with use effect  */

  const [codeInput, setCodeInput] = useState(
    ``
  )
  const [toggleInline, setToggleInline] = useState(false)


  /* change state & code input / handlers */

  const handleInput = (e: React.MouseEvent<HTMLButtonElement>) => {

    if (e.currentTarget.value === "button") { setCodeInput(sampleButton) }
    if (e.currentTarget.value === "div") { setCodeInput(sampleDiv) }
    if (e.currentTarget.value === "head") { setCodeInput(sampleHead) }
    if (e.currentTarget.value === "wrapper") { setCodeInput(sampleWrapper) }
    if (e.currentTarget.value === "click") { setCodeInput(sampleCounter) }
  }

  const handleReset = () => {
    setCodeInput("")
  }
  const handleInline = () => {
    setToggleInline(!toggleInline)
  }

  return (
    <main className=''>
      <h5 className={classes.titleHead}> Demonstration - Implementation of React-live - allows for rendering of components in preview
        works based of hardcoded strings hooked up to buttons in place of functioning backend. Instead could be
        supplied with db data saved by user and passed to editor via state/side effect. Would allow  an authenticated user to save
        working components and recall. Would need to hook up editor output though.
      </h5>
      <h5 className={classes.subhead}>
        If the noInline property is triggered editor render can be used and
        several components can be used in tandem as shown in the Wrapper and click event example.
      </h5>
      <section className={classes.buttons}>
        <button onClick={handleInput} value="button" className={classes.btn}>Button</button>
        <button onClick={handleInput} value="div" className={classes.btn}>Div</button>
       
        <button onClick={handleInput} value="head" className={classes.btn}>Heading</button>
        <label className={classes.cbInput} htmlFor='cb'>InLine on</label>
        <input id="cb" type="checkbox" onClick={handleInline} className={classes.cbCheck} />
        <button onClick={handleInput} value="click"className={classes.btn}>Click Event</button>
        <button onClick={handleInput} value="wrapper" className={classes.btn}>Wrapper</button>
        <button onClick={handleReset} className={classes.reset}>Clear</button>
      </section>
      
      <section className={classes.codeeditor} >
        <LiveProvider noInline={toggleInline} code={codeInput}>
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
