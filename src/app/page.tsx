"use client"
import { ChangeEvent, useState } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import Image from 'next/image'
import classes from "./page.module.css"
import PanelSection from '@/pages/PanelSection';
import NavBar from '@/pages/NavBar';


export default function Home() {


  /* TODO - get data from database after - can you get an output from editor if so - 
  save output to db, retrieve on select saved and populate state with use effect  */

  /* change state & code input / handlers */

  return (
    <main className={classes.main}>
     <NavBar />
    </main>
  )
}
