import React from 'react'
import parse from "html-react-parser"

const Element: React.FC<{inputString: string}> = (props) => {
   const jsx = parse(props.inputString)
 
    return <div>
        {jsx}
    </div>;

}

export default Element