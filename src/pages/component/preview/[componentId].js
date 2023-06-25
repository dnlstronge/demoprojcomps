import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter()

  const [id, setId] = useState('')

  useEffect(() => {
    if(router.isReady){
      setId(router.query.componentId)
    }
  }, [router])

  const component = '' // Query the DB with the ID to get this

  return (
    <div>
        { /** Just print the code out here for now */}
    </div>

  )
}
