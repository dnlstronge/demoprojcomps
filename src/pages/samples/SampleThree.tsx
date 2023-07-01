import React from 'react'
import Image from 'next/image'
import classes from "./samples.module.css"
import "../../app/globals.css"
import Link from 'next/link'
import castle from "./sampleAssets/c1.png"
import castletwo from "./sampleAssets/c2.png"

const SampleThree = () => {
  return (
    <div className={classes.container}>
      <Link href={"/samples/SampleTwo"}><button className={classes.btn}>Back</button></Link>
      <h6 className={classes.heading}>Doloremque tenetur laboriosam quis, impedit illum accusantium!</h6>
      <div className={classes.text}>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
        Qui maxime dolorem saepe nemo veniam eos, eius alias voluptatibus aperiam aliquid iusto facere doloremque in assumenda, eligendi placeat nam tempore perspiciatis molestias adipisci facilis quibusdam vel! Accusantium adipisci quam ipsa. Iusto vero explicabo voluptatum omnis rem. Doloribus quidem provident, ea iusto consectetur libero quibusdam numquam blanditiis officiis est, 
        consequuntur explicabo consequatur.</div>
        <section className={classes.imageSection}>
        <Image className={classes.imageSmall} src={castle} alt="castle"/> 
        <Image className={classes.imageSmall} src={castletwo} alt="castle"/>
        </section>
        <div className={classes.text}>Dolor sit amet consectetur adipisicing elit. 
        Veritatis eos in tempora optio, odio nihil numquam qui sequi ducimus repellat eveniet animi voluptatem impedit aspernatur dolore illum, est totam nulla cumque? Ratione cupiditate ullam laboriosam qui earum praesentium porro, necessitatibus pariatur in alias officia repellendus dolorem eligendi cumque sapiente nostrum soluta? Cumque et tempore necessitatibus nulla? Obcaecati beatae autem nulla error? Dolore optio laboriosam delectus magnam nemo ad? Illum sapiente rerum sed pariatur eaque ab similique quos nobis magnam fugit labore, impedit ipsum accusamus explicabo? Consequuntur minima ducimus iusto delectus,
         qui at culpa, tempora et non laboriosam fugiat. Praesentium, alias..</div>
       
    </div>
  )
}

export default SampleThree