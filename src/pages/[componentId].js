import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import classes from "./componentid.module.css"
import Nav from "../Nav/Nav"
import { getDatabase, ref, set } from "firebase/database"
import { database } from "../../firebase/config"


// output code to screen

export default function Page() {
  const router = useRouter()

  const [id, setId] = useState('')
  const [stringData, setStringData] = useState('')
  const [inputField, setInputField] = useState("")

  console.log(id);
  let component = '' // Query the DB with the ID to get this

  useEffect(() => {
    const getData = async(uid) => {
      const response = await fetch(`https://testdb-fc7b9-default-rtdb.europe-west1.firebasedatabase.app/component/${uid}/.json`)
      const data = await response.json()
      setStringData(data)
    }



    if(router.isReady){
      setId(router.query.componentId)
      getData(router.query.componentId)

    }
  }, [router])


  /* post side effect */

  useEffect(() => {
    const postData = (str, uid) => {
       
      set(ref(database, `users/${uid}/`), str)
     
  }
  if(inputField.length > 0 && router.isReady) {
     postData(inputField, id )
    console.log(router.query.componentId)
    console.log("data posted")

  }



  

  }, [inputField, id, router])
  /* change handler */

    // updated post side effect if input changes

    useEffect(() => {
      const getData = async(uid) => {
        const response = await fetch(`https://testdb-fc7b9-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}/.json`)
        const data = await response.json()
        setStringData(data)
      }
      if(inputField.length > 0) {
        setInputField(getData(id))
      }
      
  
    }, [inputField])



const handleInput = (e) => {
  setInputField(e.target.value)
}

  return (
    <main className={classes.container}>
    <div className={classes.betanav}></div>
    <div> 
    
   </div>
    <div className={classes.panels}>

    <section clasName={classes.left}>
    <h6 className={classes.heading}>
    Default data is loaded when user visits url e.g /button, /div etc. When the text area is edited
    new data is posted separately to db, and retrieved after through side effect in right panel. If the Page
    is reloaded it should reset back to the default.
    </h6>
    <textarea value={stringData} onChange={handleInput} className={classes.inputArea}></textarea>
    </section>
    <section className={classes.right}>
    <h6 className={classes.heading}>
      Begins with get from db which is default data and the same as in the left text area, when the 
      area on the left is edited, the string is posted elsewhere on the db, and because the change has triggered
      a side effect a new get issue issued to get the new string
    </h6>
    <textarea  value={stringData} className={classes.outputArea}></textarea>
    </section>

    </div>
   
    

      
    </main>
  )
}