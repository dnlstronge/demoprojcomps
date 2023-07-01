import React from 'react'
import classes from "./index.module.css"


/*
[todo]

page to show different componets with descriptions and links to code as well 
as demonstration, could use react-live editor for display? 
image/link to component being used
store component data in db so does not need hardcoded
fetch data and map
create individual custom component
*/


const index = () => {
  return (
    <div className={classes.container}>
        <h3 className={classes.heading}>Components</h3>
        <section>{/* Expandible container holds data, demo and link as well as code for 
            preview component, info on how/ where to use etc
         */}</section>
    </div>
  )
}

export default index;