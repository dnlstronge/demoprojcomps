import React, { useState } from 'react'
import classes from "./Examples.module.css"
import SampleOne from '../samples/SampleOne'
import SampleThree from '../samples/SampleThree'
import SampleTwo from '../samples/SampleTwo'

const Examples = () => {
    const [pages, setPages] = useState({
        one: false,
        two: false,
        three: false
    })

    /* handlers */
    const handlePages = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectPage = e.currentTarget.value
        switch(selectPage) {
            case "demo-one": {
                setPages({ one: true, two: false, three: false})
            }
            case "demo-two": {
                setPages({ one: false, two: true, three: false})
            }
            case "demo-three": {
                setPages({ one: false, two: false, three: true})
            }
            default: return;
        }
    }

  return (
    <div className={classes.container}>
        <h4 className={classes.heading}>Demo page content</h4>
        <section className={classes.buttonSection}>
            <button onClick={handlePages} value="demo-one"className={classes.btn}>1</button>
            <button value="demo-two" className={classes.btn}>2</button>
            <button value="demo-three" className={classes.btn}>3</button>
        </section>
        <SampleOne />
        <SampleTwo />
        <SampleThree />
    </div>
  )
}

export default Examples