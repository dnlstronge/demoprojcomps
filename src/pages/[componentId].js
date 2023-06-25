import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter()

  const [id, setId] = useState('')
  const [stringData, setStringData] = useState()

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




  return (
    <main className=''>
    {stringData}
      
    </main>
  )
}