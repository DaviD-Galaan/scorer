import React, { useState } from "react";
import './modal.css';

export default function Modal(props) {
    //const [opened, setOpened] = useState(props.opened);

    return (
    <>
        {/*<label onClick={() => {setOpened(true)}}>test</label>*/}
        { (props.opened /*&& opened*/) &&
            <div className="modal">
                <div>
                    <div className={props.className}>
                        {/*props.closing &&
                        <label className='closeModal' onClick={() => {setOpened(false)}}>X</label>
                        */}                        
                        <h1>{props.title}</h1>
                        {props.children}
                    </div>
                </div>
            </div>
        }
        
    </>
    )
}
