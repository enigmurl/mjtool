import React, { FormEvent, useDebugValue, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { landing_state } from "../landing/state_provider";
import { api_credentials, assignment_meta, queryAssignments, submission_meta } from "../../util/proxy";
import "./main.css"
import PlainViewport from "./plain";
import OrderedViewport from "./ordered";
import { getEndOfLocalDay, getHTMLDatePickerString, getLocalDateFromHTMLDatePicker } from "../../util/date";
import { Guard, LoadingLarge, LoadingSmall } from "../../util/async";
import queryMetadataClientFiltered, { categorize, displayMessage, downloadSubmission, flatten, quickCopy } from "./tasks";
import { RosterList } from "../landing/general_config";
import { stat } from "fs";

type setStateType = (delta : Partial<main_state>) => void

export interface main_state {
    grouping: "Ordered" | "Plain"

    search: string,
    sid: number | null
    date_start?: Date,
    date_end?: Date,
    assignments: assignment_meta[] // empty indicates everything

    //used for calculating late date
    due_date? : Date,

    // should not be changed
    api_url : string,
    api_password : string,

    export_root : string,
    teacher: string | null,
    period: number[]
}

function Actions(props: {state: main_state, subs: Promise<submission_meta[] | string>}) {
    const credentials : api_credentials = {
        key : props.state.api_password,
        url : props.state.api_url
    }

    return (
        <div className="col">
            <Link className="capsule primary-button" to="/">
                Home
            </Link>
            <button className="capsule secondary-button" onClick={async () => {
                var hasOpened = false;
                const subs = await props.subs
                if (typeof subs === 'string') {
                    displayMessage("Error","error", subs)
                    return;
                }

                // go in order, so that latest results override first
                for (const submission of flatten(await categorize(subs, credentials, props.state.assignments, props.state.teacher, props.state.period, props.state.search)).reverse()) {
                    if (submission.ref.version === submission.student.submissions.length) {
                        await downloadSubmission(submission, props.state, !hasOpened)
                        if (!hasOpened) {
                            hasOpened = true;
                        }
                    }
                }
                displayMessage("Success","info", "All files have been downloaded")
            }}>
                Download Latest
            </button>

            {props.state.grouping === "Ordered" && 
            <button className="capsule secondary-button" onClick={async () => {
                const subs = await props.subs
                if (typeof subs === 'string') {
                    displayMessage("Error","error", subs)
                    return
                }

                quickCopy(subs, props.state)
            }}>
                Quick Copy
            </button>
            }
        </div>
    )
}

function Grouping(props: {grouping: string, setState : setStateType}) {
    return (
        <div className="col">
            <label>Grouping</label>
            <select className="dropdown" value={props.grouping} onChange={event => {
                props.setState({grouping: event.target.value as ("Ordered" | "Plain")})
            }}>
                <option>Ordered</option>
                <option>Plain</option>
            </select>
        </div>
    )
}

function Search(props: {search: string, setState : setStateType}) {
    const [buffer, setBuffer] = useState(props.search)
    function submit(event : FormEvent) {
        event.preventDefault()
        props.setState({search: buffer, grouping: "Plain"})
    }

    return (
        <div className="col">
            <label>Search Filter</label>
            <form className="row" onSubmit={submit}>
                <input placeholder="comments, files, names, etc" value={buffer || ""} onChange={event => {
                    setBuffer(event.target.value)
                }}/>
                <button className="capsule primary-button search-button">
                    Go
                </button>
            </form>
           
        </div>
    )
}

function SID(props: {sid: number | null, setState : setStateType}) {
    const [buffer, setBuffer] = useState(props.sid)

    function submit(event : FormEvent) {
        event.preventDefault()
        props.setState({sid: buffer, grouping: "Plain"})
    }

    return (
        <div className="col">
            <label>User Filter</label>
            <form className="row" onSubmit={submit}>
                <input placeholder="student id" value={buffer || ""} onChange={event => {
                    const str = event.target.value.replace(/\D/g,'')
                    setBuffer(str ? parseInt(str) : null)
                }}/>
                <button className="capsule primary-button search-button">
                    Go
                </button>
            </form>
           
        </div>
    )
}

function DateRange(props: {start?: Date, end?: Date, setState : setStateType}) {
    return (
        <div className="col">
            <label>From</label>
            <input placeholder="start date" type="date" value={getHTMLDatePickerString(props.start || new Date(0))} onChange={event => {
                props.setState({date_start: getLocalDateFromHTMLDatePicker(event.target.value)})
            }}/>
            
            <label>To</label>
            <input placeholder="end date" type="date" value={getHTMLDatePickerString(props.end || new Date())} onChange={event => {
                props.setState({date_end: getEndOfLocalDay(getLocalDateFromHTMLDatePicker(event.target.value))})
            }}/>

        </div>
    )
}

function Assignment(props: {assignments: assignment_meta[], selected: assignment_meta[], setState : setStateType}) {
    function getSelected(target: HTMLSelectElement) {
        const ret : assignment_meta[] = [];
        var len = target.options.length;
        for (var i = 0; i < len; i++) {
          const opt = target.options[i];
      
          if (opt.selected) {
            ret.push(props.assignments[i]);
          }
        }

        return ret;
    }

    return (
        <div className="col">
            <label>Assignments</label>
            <select className="dropdown" multiple value={props.selected.map(x => x.name)} onChange={event => {
                props.setState({assignments: getSelected(event.target)})
            }}>
                {props.assignments.map(x => <option key={x.name}>{x.name}</option>)

                }
            </select>
        </div>
    )
}


function Toolbar(props: {state : main_state, setState : setStateType, subs: Promise<submission_meta[] | string>}) {
    return (
        <div className="row toolbar">
            <Actions state={props.state} subs={props.subs}/>
            <Grouping grouping={props.state.grouping} setState={props.setState}/>
            <Search search={props.state.search} setState={props.setState}/>
            <SID sid={props.state.sid} setState={props.setState}/>
            <DateRange start={props.state.date_start} end={props.state.date_end} setState={props.setState}/>
            <Guard async={queryAssignments({key: props.state.api_password, url: props.state.api_url})} fallback={<LoadingSmall/>}>
                {assignments => 
                <Assignment assignments={assignments} selected={props.state.assignments} setState={props.setState}/>
                }
            </Guard>
            <RosterList 
                teacher={props.state.teacher}
                periods={props.state.period} 
                credentials={{key: props.state.api_password, url: props.state.api_url}}
                setState={props.setState} 
                setError={() => {}}/>
        </div>
    )
}


export default function Main() {
    const location = useLocation();
    const main_state : main_state = location.state as any
    const [state, setStateRaw] = useState(main_state)


    function setState(delta: Partial<main_state>) {
        setStateRaw(Object.assign({}, state, delta))
    }

    // Grouping: assignment, none
    // Actions: home, download all, copy spreadsheet data (if grouping assignment)
    // filters
    // Email
    // Date Range
    // Assignment [subset available via frontend filtering]

    const promise = queryMetadataClientFiltered(state)

    return (
        <div id="main-viewport">
            <Toolbar state={state} setState={setState} subs={promise}/>
            <Guard async={promise} fallback={<LoadingSmall/>} >
                {subs =>
                {
                    if (typeof subs === "string") {
                        return (
                            <p className="error">
                                {subs}
                            </p>
                        )
                    } else {
                        if (state.grouping === 'Ordered') {
                            return (
                                <OrderedViewport
                                    subs={subs}
                                    state={state}
                                />
                            )
                        } else {
                            return (
                                <PlainViewport
                                    subs={subs}
                                    state={state}
                                />
                            )
                        }
                    }
                }}
            </Guard>
        </div>
    )
}