import React, { useState } from "react";
import { Link, LinkProps, NavigateOptions, useLocation, useNavigate } from "react-router-dom";
import { landing_single_state, landing_state } from "./state_provider";
import { Guard, LoadingSmall } from "../../util/async";
import { api_credentials, assignment_meta, queryAssignments } from "../../util/proxy";
import { main_state } from "../main/main";
import { getHTMLDatePickerString, getEndOfLocalDay, getLocalDateFromHTMLDatePicker } from "../../util/date";
import queryMetadataClientFiltered, { quickCopy } from "../main/tasks";


function AssignmentOption(props: {assignment: assignment_meta | null}) {
    return (
        <option>
            {props.assignment?.name}
        </option>
    )
}
function AssignmentDropdown(props: {
        active: assignment_meta | null,
        credentials: api_credentials,
        setState: (active: assignment_meta | null) => void
        setError: (string: string) => void
    }) {

    return (
        <>
            <label>Assignment</label>

            <Guard async={queryAssignments(props.credentials)} fallback={<LoadingSmall/>} error={props.setError}> 
                {assignments =>
                <select className="dropdown" value={props.active?.name || ""} onChange={event => {
                    props.setState(assignments.find(x => x?.name === event.target.value) || null)
                    props.setError("")
                }}>
                    <AssignmentOption assignment={null}/>
                    {
                        assignments.map(assignment => 
                            <AssignmentOption
                                key={assignment.name}
                                assignment={assignment}
                            />
                        )
                    }
                </select>
                }
            </Guard>
        </>
    )
}

function DueDate(props: {date: Date , setState: (state: Date) => void}) {

    return (
        <>
            <label>Due Date</label>
            <input type="date" value={getHTMLDatePickerString(props.date)} onChange={event => {
                 props.setState(getEndOfLocalDay(getLocalDateFromHTMLDatePicker(event.target.value)))
            }}>
            </input>
        </>
    )
}

function getState(state: landing_single_state, active: assignment_meta, due : Date) : main_state {
    return {
        ...state,

        grouping: "Ordered",
        search: "",

        sid: null,
        assignments: [active],
        due_date: due,   
    }
}

function Downloads(props: {state: landing_single_state, date: Date, active?: assignment_meta, setError: (error: string) => void}) {
    const navigate = useNavigate()

    return (
        <div className="row">
             <button className="capsule primary-button" onClick={event => {
                if (!props.active) {
                    props.setError("Select an assignment")
                } else if (props.state.period.length === 0) {
                    props.setError("Select at least one period")
                } else {
                    navigate('main', {state: getState(props.state, props.active, props.date)
                    })
                }
            }}>
                View
            </button>

            <button className="capsule secondary-button" onClick={async event => {
                //duplicate code...
                 if (!props.active) {
                    props.setError("Select an assignment")
                } else if (props.state.period.length === 0) {
                    props.setError("Select at least one period")
                } else {
                    const state = getState(props.state, props.active, props.date)
                    const res = await queryMetadataClientFiltered(state)
                    if (typeof res === 'string') {
                        props.setError(res)
                    } else {
                        quickCopy(res, state)
                    }
                }
            }}>
                Quick Copy
            </button>
        </div>
    )
}

// needs all state for the api url
export default function AssignmentSpecific(props: {state: landing_single_state, setError: (error: string) => void}) {
    const [date, setDate] = useState(getEndOfLocalDay(new Date()))
    const [active, setActive] = useState<assignment_meta | null>(null)

    return (
        <>
        <h2>Assignment Specific</h2>
        
        <DueDate 
            date={date} 
            setState={setDate}/>
        <br/>

        <AssignmentDropdown
            active={active}
            credentials={{
                url: props.state.api_url,
                key: props.state.api_password
            }}
            setState={setActive}
            setError={props.setError}
        />
        <br/>

        <Downloads
            date={date}
            active={active}
            state={props.state}
            setError={props.setError}
        />

        </>
    )
}