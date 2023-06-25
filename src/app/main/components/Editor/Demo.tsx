"use client"
import React, { useState, useEffect } from 'react'
import classes from "./Demo.module.css"
import { getDatabase, ref, set } from "firebase/database"
import { database } from '../../../../../firebase/config'



const Demo = () => {




    const [inputString, setInputString] = useState<any>("<button>Click me</button>") // default
   
    


    /* helper-  */
    const postData = (str: string, uid: string) => {
       
        set(ref(database, `component/${uid}/`), str)
       
    }
    const getData = async (uid: string) => {
        const response = await fetch(`https://testdb-fc7b9-default-rtdb.europe-west1.firebasedatabase.app/component/${uid}/.json`)
        const data = await response.json()
        return data;
    }   


    /* handlers */

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputString(e.currentTarget.value)
        postData(e.currentTarget.value, "1001")
    }

    const previewButton = async () => {
        const toView = await getData("1001")
        console.log(toView)
    }


    return (
        <>
        <div className={classes.container}>
            <section className={classes.panelLeft} id="panelLeft">
                <h6 className={classes.heading}>Text Editor</h6>
                <textarea id="textarea" onChange={handleChange} value={inputString} className={classes.input} />
                <button onClick={previewButton} className={classes.prevbtn}>Preview</button>
            </section>

            <section className={classes.panelRight} id="panelRight">
                <h6 className={classes.heading}>Component</h6>
                <div className={classes.component}>
                </div>
            </section>
            </div>
        </>
    )
}

    export default Demo;