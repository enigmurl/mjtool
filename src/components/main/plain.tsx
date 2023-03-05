import React from "react";
import { landing_single_state, landing_state } from "../landing/state_provider";
import { Guard, LoadingSmall } from "../../util/async";
import { api_credentials, submission_meta } from "../../util/proxy";
import { main_state } from "./main";
import { User } from "./shared_ui";
import { categorize, downloadSubmission, flatten, submission } from "./tasks";

function Header() {
    return (
        <div className="plain-submission">
            <label>Timestamp</label>
            <label>Assignment</label>
            <label>Period</label>
            <label>Name</label>
            <label>Working</label>
            <label>Sub #</label>
            <label>Comments</label>
            <label>Download</label>
        </div>
    )
}

function Submission(props: {submission: submission, state: landing_single_state}) {
    const meta = props.submission.ref
    const student = props.submission.student.ref

    return (
        <div className="plain-submission table-entry">
            <p>{meta.timestamp.toLocaleString()}</p>
            <p>{props.submission.student.roster.assignment.ref.name}</p>
            <p>{student.teacher + '-' + student.period}</p>
            <User student={student}/>
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

export default function PlainViewport(props: {subs: submission_meta[], state: main_state}) {
    const credentials : api_credentials = {
        key : props.state.api_password,
        url : props.state.api_url
    }    

    return (
        <div className="scroll">
            <Header/>
            
            <Guard async={categorize(props.subs, credentials, props.state.assignments, props.state.teacher, props.state.period, props.state.search)} fallback={<LoadingSmall/>} nocache>
            {assignments =>
            <>
                {assignments.length === 0 && 
                    <p className="error">
                        No submissions found matching criteria
                    </p>
                }
                {flatten(assignments)
                    .map(x => <Submission state={props.state} key={x.ref.student_id + '-' + x.ref.version + x.ref.lesson} submission={x}/>)}
            </> 
            }
            </Guard>
        </div>
    )
}