import { landing_single_state, landing_state } from "../landing/state_provider";
import { api_credentials, assignment_meta, downloadURL, queryFilenames, queryMetadataPreliminaryFilter, queryRoster, roster_meta, safePath, student_meta, submission_meta } from "../../util/proxy";
import spreadsheetLine, { spreadsheetHeader } from "./spreadsheet_manager";
import { main_state } from "./main";

const path = window.require('path')

const {ipcRenderer, shell} = window.require('electron')

export type assignment = {
    ref : assignment_meta

    map : {[roster_id : string] : roster}
}

export type roster = {
    ref : roster_meta
    assignment : assignment

    map : {[student_id : number] : student}
}

export type student = {
    ref : student_meta
    roster : roster

    submissions : submission[]
}

export type submission = {
    student : student
    ref : submission_meta

    file_names : string[]
}

function validSubmissionFor(submission_meta : submission_meta, state : main_state) : boolean {
    // assume teacher, period, time, and student are fine since that's done server side
    // just check assignment really
    for (const assignment of state.assignments) {
        if (assignment.path === submission_meta.lesson) {
            return true;
        }
    }

    return false;
}

function secondaryValidSubmissionFor(submission : submission, search : string) : boolean {
    if (!search) {
        return true;
    }

    const terms = search.toLowerCase().split(" ")
    const student = submission.student.ref
    const roster = submission.student.roster.ref
    const assignment = submission.student.roster.assignment.ref

    const matchAgainst = submission.file_names
        .concat(submission.ref.comment, [student.first, student.last], [roster.teacher], [assignment.name])
        .map(x => x.toLowerCase())
    
    
    for (const term of terms) {
        for (const pair of matchAgainst) {
            if (pair.includes(term)) {
                return true;
            }
        }
    }

    return false;
}

export default async function queryMetadataClientFiltered(state: main_state) : Promise<submission_meta[] | string> {
    // some filtering is done server side, some is done client side
    const credentials : api_credentials = {
        key : state.api_password,
        url : state.api_url
    }
    try {
        const submissions = await queryMetadataPreliminaryFilter(credentials, state)

        const ret : submission_meta[] = [];
        for (const sub of submissions) {
            if (validSubmissionFor(sub, state)) {
                ret.push(sub)
            }
        }

        return ret
    } catch (err: any) {
        return err.message
    }
}

async function downloadFile(credentials : api_credentials, submission: submission, fileName : string, directory : string) {
    const url = downloadURL(credentials, submission, fileName)
    return await ipcRenderer.invoke('download', {url : url, directory : directory, fileName: fileName})
}

// for downloading all, just open first one?
export async function downloadSubmission(submission: submission, state: landing_single_state, open? : boolean) {
    // only open if it's requested
    console.log("Downloading submission", submission.ref.lesson)

    const teacher = submission.student.ref.teacher
    const period  = submission.student.ref.period
    const assignment = submission.student.roster.assignment.ref.name

    
    const basePath = path.join(state.export_root, safePath(assignment), teacher + '-' + period)
    const credentials : api_credentials = {
        key : state.api_password,
        url : state.api_url
    }

    for (const fileName of submission.file_names) {
        await downloadFile(credentials, submission, fileName, basePath)        
    }

    // open the folder
    if (open) {
        shell.showItemInFolder(path.join(basePath, submission.file_names[0]))
    }
}

async function copy(credentials: api_credentials, assignments: assignment[], dueDate: Date) {
    const data : string[] = [spreadsheetHeader()]
    for (const assignment of assignments) {
        for (const roster of Object.values(assignment.map)) {
            for (const student of Object.values(roster.map).sort((a,b) => {
                const ret = a.ref.last.localeCompare(b.ref.last)
                if (ret) {
                    return ret;
                }
                return a.ref.first.localeCompare(b.ref.first)
            })) {
                const message = await spreadsheetLine(credentials, student, dueDate)
                data.push(message)
            }
        }
    }

    return await navigator.clipboard.writeText(data.join('\n'))
}

export async function quickCopy(subs: submission_meta[], state: main_state) {
    // need to also send a response dialog saying it was succesful
    const credentials : api_credentials = {
        key : state.api_password,
        url : state.api_url
    }
    try {
        const assignments = await categorize(subs, credentials, state.assignments, state.teacher, state.period, state.search)
        await copy(credentials, assignments, state.due_date)
        await displayMessage("Status", "info", "Copy success")
    } catch (err : any) {
        console.error("Error", err);
        await displayMessage("Copy Error", "error", "Failed to copy: " + err.message)
    }
}

function mappedRoster(meta : roster_meta, assignment : assignment) : roster {
    const ret : roster = {
        ref: meta,
        assignment: assignment,
        map: {}
    }
    for (const studentMeta of meta.students) {
        const student : student = {
            ref: studentMeta,
            roster: ret,
            submissions: []
        }
        ret.map[studentMeta.id] = student
    }

    return ret;
}
    

export async function categorize(meta : submission_meta[], credentials: api_credentials, assignments : assignment_meta[], teacher: string, periods: number[], search: string) : Promise<assignment[]> {
    // get a master list for back and forth

    const assignmentSkeleton : {[path: string] : assignment} = {}
    
    const rosterMeta : roster_meta[] = []  
    const masterList : {[id : number] : student_meta} = {}
    for (const period of periods) {
        const roster = await queryRoster(credentials, teacher, period)
        rosterMeta.push(roster)

        for (const student of roster.students) {
            masterList[student.id] = student
        }
    }

    // query the seperate rosters and push to master
    // create student skeleton, and the

    for (const assignment of assignments) {
        // log 
        const mapped : assignment = {
            ref: assignment,
            map: {}
        }

        for (const roster of rosterMeta) {
            const mRoster = mappedRoster(roster, mapped);
            mapped.map[mRoster.ref.teacher + '-' + mRoster.ref.period] = mRoster
        }

        assignmentSkeleton[assignment.path] = mapped
    }

    for (const sub of meta) {
        const lesson = sub.lesson;
        const studentMeta = masterList[sub.student_id]
        const roster = studentMeta.teacher + '-' + studentMeta.period
        const studentID = sub.student_id

        const student = assignmentSkeleton[lesson].map[roster].map[studentID]


        const fileNames = await queryFilenames(credentials, sub, student);
        const submission : submission = {ref: sub, student: student, file_names: fileNames}
        if (secondaryValidSubmissionFor(submission, search)) {
            student.submissions.push(submission)
        }
    }

    // last round of filtering


    return Object.values(assignmentSkeleton)
}


export function flatten(raw : assignment[]) : submission[] {
    const subs : submission[] = []
    for (const assignment of raw) {
        for (const roster of Object.values(assignment.map)) {
            for (const student of Object.values(roster.map)) {
                for (const submission of student.submissions) {
                    subs.push(submission)
                }
            }
        }
    }

    return subs.sort((a,b) => {
        return b.ref.timestamp.getTime() - a.ref.timestamp.getTime()
    })
}

export async function displayMessage(title: string, type: string, msg: String) {
    return await ipcRenderer.invoke("showMessage", title, type, msg)
}
