"use client"
import { ChangeEvent, useState } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import Image from 'next/image'
import classes from "./page.module.css"
import PanelSection from '@/pages/PanelSection';



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
    
  <PanelSection route={""} />
    </main>
  )
}
