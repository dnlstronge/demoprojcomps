import React from 'react'
import classes from "./AddComp.module.css"


const AddComp = () => {

    /*todo - add local state for input */
    /* create functioning PUT to fbdb */

  return (
    <div className={classes.container}>

            {/* Posts new component to db, also needs to get screenshot and 
            post download URL  */}

        <form className={classes.formbody}>
            <label className={classes.label}></label>
            <input type="text" className={classes.input}></input>
            <label className={classes.label}></label>
            <input type="text" className={classes.input}></input>
            <label className={classes.label}></label>
            <input type="text" className={classes.input}></input>
            <label className={classes.label}></label>
            <input type="text" className={classes.input}></input>
            <label className={classes.label}></label>
            <input type="text" className={classes.input}></input>
            <button className={classes.btn}>Submit</button>
        </form>
    </div>
  )
}

export default AddComp