// Manages and bridges requests to the API service

import { main_state } from "../components/main/main"
import { submission, student } from "../components/main/tasks"
import { dateFromAPIServer } from "./date"

// actual requests
export interface api_credentials {
    url: string
    key: string
}

export type assignment_meta = {
    name : string
    path : string
}

export type roster_meta = {
    teacher : string
    period : number
    students: student_meta[]
}

export type student_meta = {
    id : number,
    first : string,
    last : string,
    email : string,
    grade : number,
    teacher : string,
    period : number,
    profile_img : string
}

export type submission_meta = {
    version : number,
    timestamp: Date
    is_working: boolean,
    comment: string
    student_id: number,
    lesson: string
}

function url_for(credentials: api_credentials, path: string) {
    return credentials.url + path + "?key=" + credentials.key
}

function stripExtension(path : string) {
    return path.substring(0, path.length - ".md".length)
}

export async function queryAssignments(credentials: api_credentials) : Promise<assignment_meta[]> {
    const url = url_for(credentials, '/submissions/all_labs')

    try {
        const json = await (await fetch(url)).json()
        return Object.entries(json).map((pair : any[]) => {
            return {
                name: pair[0],
                path: stripExtension(pair[1])
            }          
        })
    } catch (err: any) {
        console.error("Error", err)
        throw err
    }
}

// lists the roster name (not the full path), and with no extension
export async function queryTeachers(credentials: api_credentials) {
    const url = url_for(credentials, '/submissions/roster/listdir')

    try {
        const json = await (await fetch(url)).json()
        return json
    } catch (err: any) {
        console.error("Error", err)
        throw err
    }
} 

export async function queryRoster(credentials: api_credentials, teacher: string, period: number) : Promise<roster_meta> {
    const url = url_for(credentials, '/submissions/roster/' + teacher + '/' + period)

    try {
        const json : student_meta[] = await (await fetch(url)).json()
        const ret : roster_meta = {teacher: teacher, period: period, students: json}
        return ret
    } catch (err: any) {
        console.error("Error", err)
        throw err
    }
}

export function safePath(path: string) {
    return path.replace(/[\/<>:"\\|?*.;]/g, "-")
}

export function downloadURL(credentials: api_credentials, submission: submission, fileName: string) : string {
    return url_for(credentials, '/submissions/' + submission.student.roster.assignment.ref.path + '/' + submission.student.ref.id + '/' + submission.ref.version + '/' + fileName)
}

export async function queryFilenames(credentials: api_credentials, submission: submission_meta, student: student) : Promise<string[]> {
    // TODO change to sid at some point
    const url = url_for(credentials, '/submissions/listdir/' + student.roster.assignment.ref.path + '/' + student.ref.id + '/' + submission.version)

    try {
        const json : string[] = await (await fetch(url)).json()
        return json
    } catch (err: any) {
        console.error("Error", err)
        throw err
    }
}

export async function queryMetadataPreliminaryFilter(credentials: api_credentials, state : main_state) {
    const url = url_for(credentials, '/submissions/metadata')

    try {
        var ret : submission_meta[] = []

        for (const period of state.period) {
            const body : any = {
                teacher : state.teacher, 
                period: period
            }

            if (state.sid !== null) {
                body["student_id"] = state.sid
            }
            if (state.assignments.length === 1) {
                body["lesson"] = state.assignments[0].path
            }
            if (state.date_start || state.date_end) {
                body["timestamp"] = [state.date_start || new Date(0), state.date_end || new Date()]
            }
    
            const json : any[] = await (await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json',
                    'accept' : 'application/json'
                },
                body: JSON.stringify(body)
            })).json()
            
            const dateMapped = json.map(x => {return {
                version : x.version,
                timestamp: new Date(dateFromAPIServer(x.timestamp)),
                is_working: x.is_working,
                comment: x.comment,
                student_id: x.student_id,
                lesson: x.lesson
            }})

            ret = ret.concat(dateMapped)
        }
        
        return ret
    } catch (err: any) {
        console.error("Error", err)
        throw err
    }
}
