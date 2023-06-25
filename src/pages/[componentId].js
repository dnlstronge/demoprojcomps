import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter()

  const [id, setId] = useState('')

  console.log(id);

  useEffect(() => {
    if(router.isReady){
      setId(router.query.componentId)
    }
  }, [router])

  return (
    <main className=''>
      {id}
    </main>
  )
}