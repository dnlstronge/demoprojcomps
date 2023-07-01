
import React from 'react'
import classes from "./NavBar.module.css"
import Link from 'next/link'

const NavBar = () => {
  return (
    <div className={classes.container}>
      <Link href="/PanelSection">
      <button className={classes.btn}>React Components</button>
      </Link>
      <button className={classes.btn}>Example Pages</button>
      <button className={classes.btn}>Misc</button>
    </div>
  )
}

export default NavBar