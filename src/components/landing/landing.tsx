import React, { useEffect, useState } from "react";
import { landing_single_state, landing_state } from "./state_provider";
import AssignmentSpecific from "./assignment_specific";
import GeneralConfig from "./general_config";

import "./landing.css"
import RecentSubmissions, { StudentSubmissions } from "./recent_submissions";

type setStateType = (state: {index: number} | Partial<landing_single_state>) => void

function Title() {
    return (
        <h1>
            Manu - Jiaming Tool | APCS Submission Viewer
        </h1>
    )
}

function Config(props: {
        state: landing_state, 
        setState: setStateType,
        setError: (error: string) => void
        addServer: () => void,
        deleteServer: () => void,
    }) {

    const current = props.state.servers[props.state.index]
    
    return (
        <div className="row-top">
            <div className="col config">
                <GeneralConfig 
                    state={props.state} 
                    setState={props.setState} 
                    setError={props.setError}
                    addServer={props.addServer}
                    deleteServer={props.deleteServer}
                    />
            </div>
            <div className="col config">
                <AssignmentSpecific state={current} setError={props.setError}/>
            </div>
            <div className="col config">
                <RecentSubmissions state={current} setError={props.setError}/>
            </div>
            <div className="col config">
                <StudentSubmissions state={current} setError={props.setError}/>
            </div>
        </div>
    )
}

function Error(props: {error: string}) {
    return (
        <p className="error">
            {props.error}
        </p>
    )
}

export default function Landing(props: {
        state: landing_state, 
        setState: setStateType,
        addServer: () => void,
        deleteServer: () => void,
    }) {
    const [error, setError] = useState("")

    useEffect(() => {
        setError("")
    }, [props.state])

    return (
        <div className="col">
            <Title/>
            
            <Config 
                state={props.state} 
                setState={props.setState} 
                setError={setError}
                addServer={props.addServer}
                deleteServer={props.deleteServer}
                />

            <Error error={error}/>
          
        </div>
    )
}