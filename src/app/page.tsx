"use client"


import Image from 'next/image'
import classes from "./page.module.css"
import Nav from "../Nav/Nav"


import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";



export default function Home() {
  return (
    <main className=''>
      <div>Implementation of React-live - allows for rendering of components in preview</div>
      <section className={classes.codeeditor} >
      <LiveProvider code="<strong>Hello World!</strong>">
              <section className={classes.panels} >
              <LiveEditor className={classes.edit} />
              <LivePreview className={classes.prev} />
              </section>
              <section className={classes.errorSection}>
                  <LiveError className={classes.edit} />
                  </section>
             </LiveProvider>
      </section>
            
    </main>
  )
}
