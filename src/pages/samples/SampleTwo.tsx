import React from 'react'
import classes from "./samples.module.css"
import Link from 'next/link'
import Image from 'next/image'
import SHI from "./sampleAssets/Binkle.png"


const SampleTwo = () => {
  return (
    <div> className={classes.container}

    <Link href="/samples/SampleOne">
      <button className={classes.btn}>Go back</button>
    </Link>
   
     <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam vitae laboriosam repudiandae commodi repellat tenetur laborum odit distinctio, nam praesentium veritatis ullam porro. Explicabo animi doloribus commodi deleniti sapiente quidem iure veniam facere magnam eos minima provident saepe maiores, beatae debitis delectus eius repellat, corporis eligendi quaerat est quisquam velit ab.
         Iure labore id quod accusamus doloremque. Quaerat, quia laborum!</div>
         <br></br>
         <Image alt="little dog" src={SHI}/>
         <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam vitae laboriosam repudiandae commodi repellat tenetur laborum odit distinctio, nam praesentium veritatis ullam porro. Explicabo animi doloribus commodi deleniti sapiente quidem iure veniam facere magnam eos minima provident saepe maiores, beatae debitis delectus eius repellat, corporis eligendi quaerat est quisquam velit ab.
         Iure labore id quod accusamus doloremque. Quaerat, quia laborum!</div>
    </div>
    
  )
}

export default SampleTwo