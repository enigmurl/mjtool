import React, { useEffect, useRef, useState } from "react";
import { landing_single_state, landing_state } from "./state_provider";
import { Guard, LoadingSmall } from "../../util/async";
import { api_credentials, queryTeachers } from "../../util/proxy";
const { ipcRenderer } = window.require('electron')
const path = window.require('path');


type setStateType = (state: {index: number} | Partial<landing_single_state>) => void

function ServerIndex(props: { 
        index: number, 
        count: number, 
        addServer: () => void,
        deleteServer: () => void,
        setState: setStateType
    }) {

    return (
        <>
            <label>Server</label>
            {/* Selecting server index */}
            <select className="dropdown" value={props.index} onChange={event => {
                props.setState({index: +event.target.value})
            }}>
                {Array.from(new Array(props.count), (_, i) => i).map(x => <option key={x}>{x}</option>)}
            </select>

            <div className="row">
                <button className="capsule primary-button" onClick={async (event) => {
                    props.addServer()
                }}>
                    Add Server
                </button>

                {
                    props.count > 1 &&
                    <button className="capsule danger-button" onClick={async (event) => {
                        if (confirm("You are deleting the current server profile!")) {
                            props.deleteServer()
                        } 
                    }}>
                        Delete Current
                    </button>
                }
                
            </div>
           

        </>
    ) 
}

function APIConfig(props: { url : string, password: string, setState: setStateType }) {
    return (
        <>
            <label>API</label>
            <input placeholder="API domain" value={props.url} onChange={event => {
                props.setState({
                    'api_url' : event.target.value
                })
            }}/>
            <input placeholder="API key" type="password" value={props.password} onChange={event => {
                props.setState({
                    'api_password' : event.target.value
                })
            }}/>
        </>
    )
}


function FolderSelector(props: {id: string, label: string, folder?: string, setFolder: (folder: string) => void}) {
    const separatedPath = props.folder?.split(path.sep);
    const last = separatedPath && separatedPath.length ? separatedPath[separatedPath.length - 1] : null
 
    return (
        <>
            <label htmlFor={props.id}>{props.label}</label>
            <div className="row">
                <span id={props.id} className="capsule secondary-button" onClick={async (event) => {
                    const folder = (await ipcRenderer.invoke("showFolderPicker", []))[0]
                    props.setFolder(folder)
                }}>
                    Change
                </span>

                <p className="folder-label">
                    {last || "None selected"}
                </p>
            </div>
        </>
    )
}

function Export(props: {folder : string, setState : setStateType}) {
    return (
        <>
            <FolderSelector
                id="export-folder"
                label="Export Folder"
                folder={props.folder}
                setFolder={folder => props.setState({'export_root' : folder})}
                />
        </>
    )
} 

function RosterItem(props: {period: number, selected: number[], setState: setStateType } ) {

    const checked = props.selected.indexOf(props.period) !== -1
    const id = 'period-' + props.period

    return (
        <div className="row period-selector">
            <input type="checkbox" id={id} checked={checked} onChange={event => {
                let buffer = props.selected;
                if (!checked) {
                    buffer.push(props.period)
                } else {
                    buffer = buffer.filter(x => x !== props.period)
                }

                props.setState({'period' : buffer})
            }}></input>
            <label className="checkbox-label" htmlFor={id}>
                {props.period}
            </label>
        </div>
    )
}

export function RosterList(props: {teacher: string | null, periods: number[], credentials: api_credentials, setState: setStateType, setError: (error: string) => void}) {
    return (
        <div className="col">
            <label>Teacher</label>
            <Guard async={queryTeachers(props.credentials)} fallback={<LoadingSmall/>} error={props.setError}>
            {teachers => {
                const teacherList = Object.keys(teachers)
                if (props.teacher && teacherList.indexOf(props.teacher) === -1 ) {
                    props.setState({teacher: null, period: []})
                }
                const filtered = props.teacher ? props.periods.filter(x => (teachers as any)[props.teacher].findIndex((y : number) => x === y) !== -1) : []
                if (filtered.length !== props.periods.length) {
                    props.setState({period: filtered})
                }
                if (teacherList.length === 0) {
                    
                    return (
                        <p className="error">
                            No teachers found
                        </p>
                    )
                }

                return (
                    <>
                        <select className="dropdown" value={props.teacher || ""} onChange={event => {
                            props.setState({teacher: event.target.value || null, period: []})
                        }}>
                            <option></option>
                            {teacherList.map(x => <option key={x}>{x}</option>)}
                        </select>

                        <label>Periods</label>

                        {
                            props.teacher ? 
                                (teachers as any)[props.teacher].sort().map((period : number) => 
                                    <RosterItem
                                        key={period}
                                        period={period}
                                        selected={props.periods}
                                        setState={props.setState}
                                    />
                                    )
                                 : 
                                <p className="error">
                                    No teacher selected
                                </p>
                            
                        }
                        {   
                            props.teacher && (teachers as any)[props.teacher].length === 0 &&
                                <p className="error">
                                    No periods found
                                </p>
                        }
                    </>
                )
            }
            }
            </Guard>
        </div>
    )
}

// Not used anymore !
// function Grader(props: {first: string, last: string, setState: setStateType}) {
//     return (
//         <>
//             <label>Grader Name</label>
//             <div className="row">
//                 <input placeholder="first" value={props.first} onChange={event => {
//                     props.setState({
//                         'first' : event.target.value
//                     })
//                 }}></input>
//                 <input placeholder="last" value={props.last} onChange={event => {
//                     props.setState({
//                         'last' : event.target.value
//                     })
//                 }}></input>
//             </div>
//         </>
//     )
// }

export default function GeneralConfig(props: {
        state : landing_state, 
        setState : setStateType, 
        addServer: () => void,
        deleteServer: () => void,
        setError: (error: string) => void
    }) {

    const current = props.state.servers[props.state.index]

    return (
        <>
            <h2>General Config</h2>

            <ServerIndex 
                index={props.state.index} 
                count={props.state.servers.length} 
                setState={props.setState}
                addServer={props.addServer}
                deleteServer={props.deleteServer}
                />
            <br/>

            <APIConfig url={current.api_url} password={current.api_password} setState={props.setState}/>

            <br/>   

            <Export folder={current.export_root} setState={props.setState} />

            <br/>

            <RosterList 
                credentials={{
                    key: current.api_password,
                    url: current.api_url
                }}  
                teacher={current.teacher}
                periods={current.period}
                setState={props.setState}
                setError={props.setError}
                />

            <br/>

            {/* <Grader first={props.state.first} last={props.state.last} setState={props.setState}/>

            <br/> */}
        </>
    )
}