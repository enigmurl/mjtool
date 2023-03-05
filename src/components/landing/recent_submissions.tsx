import React, { FormEvent } from "react";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { main_state } from "../main/main";
import { daysBeforeNow, getEndOfLocalDay } from "../../util/date";
import { queryAssignments } from "../../util/proxy";
import { landing_single_state, landing_state } from "./state_provider"


function LastDays(props: {lastXDays: number, setLastDays: (days: number) => void}) {
    return (
        <>
            <label>Last X Days</label>
            <input placeholder="API domain" value={props.lastXDays} onChange={event => {
                props.setLastDays(parseInt(event.target.value.replace(/\D/g,'') || '0'))
            }}/>
        </>
    )
}

function SID(props: {sid: number | null, setName: (sid: number | null) => void}) {
    return (
        <>
            <label>Student ID</label>
            <input placeholder="student id" value={props.sid || ""} onChange={event => {
                const str = event.target.value.replace(/\D/g,'')
                props.setName(str ? parseInt(str) : null)
            }}/>
        </>
    )
}

function Downloads() {
    return (
        <div className="row">
             <input type="submit" className="capsule primary-button" value={"View"}/>
        </div>
    )
}

export default function RecentSubmissions(props: {state: landing_single_state, setError: (error: string) => void}) {
    const [lastXDays, setLastDays] = useState(7);
    const navigate = useNavigate();

    // TODO repeated code
    async function formSubmit(event : FormEvent) {
        event.preventDefault();

        const assignments = await queryAssignments({key: props.state.api_password, url: props.state.api_url})

        const state : main_state = {
            ...props.state,

            grouping: "Plain",
            search: "",
    
            date_start: daysBeforeNow(lastXDays),
            sid: null,
            assignments: assignments,
        }
        navigate('main', {state: state})
    }

    return (
        <form onSubmit={formSubmit} className="col">
            <h2>Recent Submissions</h2>
            
            <LastDays lastXDays={lastXDays} setLastDays={setLastDays}/>
            <br/>
            <Downloads/>
            <br/>
        </form>
    )
}

export function StudentSubmissions(props: {state: landing_single_state, setError: (error: string) => void}) {
    const [lastXDays, setLastDays] = useState(365);
    const [sid, setSid] = useState<number | null>(5)

    const navigate = useNavigate();

    async function formSubmit(event : FormEvent) {
        event.preventDefault();

        const assignments = await queryAssignments({key: props.state.api_password, url: props.state.api_url})

        const state : main_state = {
            ...props.state,

            grouping: "Plain",
            search: "",
    
            date_start: daysBeforeNow(lastXDays),
            sid: sid,
            assignments: assignments,
        }
        navigate('main', {state: state})
    }

    return (
        <form onSubmit={formSubmit} className="col">
            <h2>Student Submissions</h2>
            
            <LastDays lastXDays={lastXDays} setLastDays={setLastDays}/>
            <br/>

            <SID sid={sid} setName={setSid}/>
            <br/>

            <Downloads/>
            <br/>
        </form>
    )
}