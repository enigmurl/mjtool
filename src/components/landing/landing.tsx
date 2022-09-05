import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { landing_state } from "./state_provider";
import AssignmentSpecific from "./assignment_specific";
import GeneralConfig from "./general_config";

import "./landing.css"
import RecentSubmissions, { StudentSubmissions } from "./recent_submissions";

function Title() {
    return (
        <h1>
            Manu - Jiaming Tool | APCS Submission Viewer
        </h1>
    )
}

function Config(props: {state: landing_state, setState: (state: Partial<landing_state>) => void, setError: (error: string) => void}) {
    return (
        <div className="row-top">
            <div className="col config">
                <GeneralConfig state={props.state} setState={props.setState} setError={props.setError}/>
            </div>
            <div className="col config">
                <AssignmentSpecific state={props.state} setError={props.setError}/>
            </div>
            <div className="col config">
                <RecentSubmissions state={props.state} setError={props.setError}/>
            </div>
            <div className="col config">
                <StudentSubmissions state={props.state} setError={props.setError}/>
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

export default function Landing(props: {state: landing_state, setState: (state: Partial<landing_state>) => void}) {
    const [error, setError] = useState("")

    useEffect(() => {
        setError("")
    }, [props.state])

    return (
        <div className="col">
            <Title/>
            <Config state={props.state} setState={props.setState} setError={setError}/>

            <Error error={error}/>
          
        </div>
    )
}