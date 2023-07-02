import React from 'react'
import classes from "./Button.module.css"


/* simple button component - 
to-do I want to store this as a function and try and call it from db and 
do something with it

*/
const Button = () => {
  return (
    <div className={classes.container}>
        <button className={classes.btn}>Click me</button>
    </div>
  )
}

export default Button