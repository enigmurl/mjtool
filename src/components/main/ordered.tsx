import React, { useState } from "react";
import { Guard, LoadingSmall } from "../../util/async";
import { api_credentials, submission_meta } from "../../util/proxy";
import { lint } from "./spreadsheet_manager";
import { main_state } from "./main";
import { User } from "./shared_ui";
import { assignment, categorize, downloadSubmission, roster, student, submission } from "./tasks";


function Submission(props: {submission: submission, state : main_state}) {
    const meta = props.submission.ref
    return (
        <div className="ordered-submission">
            <p>{meta.timestamp.toLocaleString()}</p>
            <span className={"working-" + meta.is_working}/>
            <p>{meta.version}</p>
            <p className="submission-comments">{meta.comment}</p>
            
            <button className="capsule primary-button" onClick={event => {
                downloadSubmission(props.submission, props.state, true)
            }}>
                Download
            </button>
        </div>
    )
}

function Student(props: {student: student, state: main_state}) {
    const [showing, setShowing] = useState(false)

    const len = props.student.submissions.length
    const oldest = len > 0 ? props.student.submissions[len - 1] : null
    const newest = len > 0 ? props.student.submissions[0] : null

    return (
        <>
            <div className={"ordered-student " + (showing ? "" : "table-entry")} >
                {/* some row with info, and pfp*/}
                <button className={"table-guard capsule " + (showing ? "secondary-button" : "primary-button")} onClick={event => {
                    setShowing(!showing)
                }}>
                    <span>
                        [{len}] 
                    </span>
                    <span>
                        {showing ? " ▾" : " ▸"}
                    </span>
                </button>

                <User student={props.student.ref}/>

                <p className="submission-comments">
                    {lint(props.student, oldest, newest, props.state.due_date)}
                </p>
            </div>
            {showing && 
            <div className="ordered-submission-list table-entry">
                {/*     /* timestamp, #, working, comments, download */}
                <div className="ordered-submission">
                    <label>Timestamp</label>
                    <label>Working</label>
                    <label>Sub #</label>
                    <label>Comments</label>
                    <label>Download</label>
                </div>
                {props.student.submissions.map(s => <Submission key={s.ref.version} submission={s} state={props.state}/>)}
            </div>
            }

        </>
        
    )
}

function Roster(props: {roster: roster, state : main_state}) {
    return (
        <div>
            <div className="ordered-student table-entry">
                <h3>{props.roster.ref.teacher}-{props.roster.ref.period}</h3>
                <label>Name</label>
                <label>Auto Comments</label>
            </div>
            {Object.entries(props.roster.map).sort((a,b) => {
                const ret = a[1].ref.last.localeCompare(b[1].ref.last)
                if (ret) {
                    return ret;
                    
                }
                return a[1].ref.first.localeCompare(b[1].ref.first)
            }

            ).map(s => <Student key={s[0]} student={s[1]} state={props.state}/>)}
        </div>
    )
}

function Assignment(props: {assignment : assignment, state : main_state}) {
    return (
        <div>
            <h2>{props.assignment.ref.name}</h2>
            {Object.entries(props.assignment.map).sort().map(x => <Roster key={x[0]} roster={x[1]} state={props.state}/>)}
        </div>
    )
}

// ok so sorted into assignments, within each assignments it's by roster, within each roster it's every student, and then their submission

// ok so from the 
export default function StandardViewport(props: {subs: submission_meta[], state: main_state}) {
    const credentials : api_credentials = {
        key : props.state.api_password,
        url : props.state.api_url
    }
    return (
        <div className="scroll">
            <Guard async={categorize(props.subs, credentials, props.state.assignments, props.state.teacher, props.state.period, props.state.search)} fallback={<LoadingSmall/>} nocache>
                {assignments => 
                <>
                {assignments.length === 0 && 
                    <p className="error">
                        No submissions found matching criteria
                    </p>
                }
                {assignments.map(assignment => <Assignment key={assignment.ref.name} assignment={assignment} state={props.state}/>)}
                </>
                }
            </Guard>
        </div>
    )
}