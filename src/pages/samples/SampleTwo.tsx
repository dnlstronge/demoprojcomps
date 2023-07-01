import React from 'react'
import classes from "./samples.module.css"
import Link from 'next/link'
import Image from 'next/image'
import SHI from "./sampleAssets/Binkle.png"
import "../../app/globals.css"

const SampleTwo = () => {
  return (
    <div className={classes.container}>
    <Link href="/samples/SampleOne">
      <button className={classes.btn}>Go back</button>
    </Link>
    <Link href="/samples/SampleThree">
      <button className={classes.btn}>Next</button>
    </Link>
      <h6 className={classes.heading}>Ipsum dolor sit amet consectetur.</h6>
     <div className={classes.text}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam vitae laboriosam repudiandae commodi repellat tenetur laborum odit distinctio, nam praesentium veritatis ullam porro. Explicabo animi doloribus commodi deleniti sapiente quidem iure veniam facere magnam eos minima provident saepe maiores, beatae debitis delectus eius repellat, corporis eligendi quaerat est quisquam velit ab.
         Iure labore id quod accusamus doloremque. Quaerat, quia laborum!</div>
         <br></br>
         <Image className={classes.image} alt="little dog" src={SHI}/>
         <div className={classes.text}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam vitae laboriosam repudiandae commodi repellat tenetur laborum odit distinctio, nam praesentium veritatis ullam porro. Explicabo animi doloribus commodi deleniti sapiente quidem iure veniam facere magnam eos minima provident saepe maiores, beatae debitis delectus eius repellat, corporis eligendi quaerat est quisquam velit ab.
         Iure labore id quod accusamus doloremque. Quaerat, quia laborum!</div>
    </div>
    
  )
}

export default SampleTwo