"use client"
import React from 'react'
import classes from "./NavBar.module.css"
import Link from 'next/link'

const NavBar = () => {
  return (
    <div className={classes.container}>
      <Link href="/PanelSection">
      <button className={classes.btn}>Previewer</button>
      </Link>
      <button className={classes.btn}>Examples</button>
      <button className={classes.btn}>Misc</button>
    </div>
  )
}

export default NavBar