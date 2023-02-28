import React, { useEffect, useState } from "react";
import { ReactNode } from "react";
import "./async.css"



// Async rendering
interface propsGuard<T> {
    async: Promise<T>
    //uggg really wish we could choose when react renders it without being so ugly
    children: (info: T) => ReactNode, 
    fallback: ReactNode
    error?: (error: string) => void
    nocache?: boolean
}


export function Guard<T>(props: propsGuard<T>) {
    const [active, setActive] = useState(props.fallback);
    useEffect(() => {
        if (props.nocache) {
            setActive(props.fallback)
        }
        props.async.then(value => {
            setActive(props.children(value))
        }).catch(err => {
            console.error(err)
            props.error?.(err.message)
        })
    }, [props.async])

    return (
        <>
            {active}
        </>
    )
} 

interface propsLoading {
    inline?: boolean
}

function Loading(props: propsLoading & {size : string}) {
    return (
        <span className="utility-loading-margin" style={{
            display: props.inline ? 'inline-flex' : 'flex'
        }}>
            <div className={"utility-loading utility-loading-" + props.size}>
                [{"\u2022\u2022\u2022"}]
            </div>
            
        </span>
    )
}
export function LoadingSmall(props: propsLoading) {
    return <Loading inline={props.inline} size="small"/>
}

export function LoadingMed(props: propsLoading) {
    return <Loading inline={props.inline} size="med"/>

}
export function LoadingLarge(props: propsLoading) {
    return <Loading inline={props.inline} size="large"/>
}