"use-client"
import classes from "./samples.module.css"
import React from 'react'
import Link from "next/link"
import sampleImage1 from "./sampleAssets/Jabber.png"
import Image from "next/image"
import "../../app/globals.css"

const SampleOne = () => {
  return (
    <div className={classes.container}>
      <Link href="/samples/SampleTwo"><button className={classes.btn}>Go to sample two</button></Link>
      <h6 className={classes.heading}>Lorem ipsum dolor sit amet.</h6>
      <div className={classes.text}>Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Id saepe, nostrum accusamus nobis cupiditate animi deleniti! Alias omnis velit consequatur enim quae, autem aliquam quibusdam magnam deserunt odio incidunt reprehenderit quam dolorem quasi illum placeat praesentium exercitationem aspernatur laborum sunt?
        Esse officiis atque ullam iste cupiditate a consequatur sed eveniet!</div>
      <Image className={classes.image} src={sampleImage1} alt="jabber"></Image>
      <div className={classes.text}>
      Dolor sit amet consectetur adipisicing elit. Corporis nisi sed veritatis architecto eaque modi repudiandae labore, quasi minima tenetur facere autem recusandae vero, culpa maiores magnam. Error quia architecto maiores perspiciatis facere distinctio eligendi deserunt dolorem mollitia corporis,
       illo reiciendis fugiat nulla quo iure odio, cumque mo, Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis nisi sed veritatis architecto eaque modi repudiandae labore, quasi minima tenetur facere autem recusandae vero, culpa maiores magnam. Error quia architecto maiores perspiciatis facere distinctio eligendi deserunt dolorem mollitia corporis,
       illo reiciendi nulla quo iure odio, cumque modi quam at.</div>
    </div>
  )
}

export default SampleOne