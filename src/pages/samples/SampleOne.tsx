"use-client"
import classes from "./samples.module.css"
import React from 'react'
import Link from "next/link"
import sampleImage1 from "./sampleAssets/Jabber.png"
import Image from "next/image"

const SampleOne = () => {
  return (
    <div className={classes.container}>
      <Link href="/samples/SampleTwo"><button className={classes.btn}>Go to sample two</button></Link>
      <div className={classes.container}>Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Id saepe, nostrum accusamus nobis cupiditate animi deleniti! Alias omnis velit consequatur enim quae, autem aliquam quibusdam magnam deserunt odio incidunt reprehenderit quam dolorem quasi illum placeat praesentium exercitationem aspernatur laborum sunt?
        Esse officiis atque ullam iste cupiditate a consequatur sed eveniet!</div>
      <Image src={sampleImage1} alt="jabber"></Image>
    </div>
  )
}

export default SampleOne