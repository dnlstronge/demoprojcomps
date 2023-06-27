import React, {useState} from 'react'
import classes from "./Nav.module.css"

const Nav: React.FC = (props) => {



/* handle setTarget */


  return (
    <div className={classes.container}>
        <p className={classes.url}>http:www.componentapi.net/api/v1/</p>
        <input className={classes.input} type="text"></input>
        <label  className={classes.label} htmlFor="prevselect">Prev: </label><select className={classes.select}>
            <option>--select--</option>
            <option>v2</option>
            <option>v3</option>
        </select>
        <button className={classes.btn}>Save</button>
    </div>
  )
}

export default Nav;