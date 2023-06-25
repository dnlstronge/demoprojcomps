import React from 'react'
import classes from "./Main.module.css"
import Demo from './components/Editor/Demo'


const main = () => {
  return (
    <div className={classes.container}>
        <Demo/>
    </div>
  )
}

export default main