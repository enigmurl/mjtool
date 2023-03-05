import { stat } from "fs";
import React, { useMemo } from "react";
import { Routes, Route } from "react-router";
import Landing from "./landing";
import Main from "../main/main";
import { Guard, LoadingLarge, LoadingSmall } from "../../util/async";

const {ipcRenderer} = window.require('electron')

export interface landing_single_state {
    api_url : string,
    api_password : string,

    export_root : string,
    teacher: string | null,
    period: number[]
}

export interface landing_state {
    servers: landing_single_state[]
    index: number
}

export default function AsyncStateLoader() {
    return (
        <Guard async={ipcRenderer.invoke("openApp")} fallback={<LoadingLarge/>}>
            {x =>
            <StateProvider state={x as landing_state}/>
            }
        </Guard>
                    
    )
}

class StateProvider extends React.Component<{state: landing_state}> {
    state : landing_state =  {
        servers: [
            {
                api_url : "",
                api_password : "",
                
                export_root : "",
                teacher: "",
                period : []
            }
        ],
        index: 0
    }

    constructor(props: {state: landing_state}) {
        super(props)
        if (props.state) {
            this.state = props.state
        }
    
        this.setState = this.setState.bind(this)
        this.addServer = this.addServer.bind(this)
        this.deleteServer = this.deleteServer.bind(this)
    }

    async addServer() {
        const clipped = {
            index: this.state.servers.length,
            servers: [
                ...this.state.servers,
                {
                    api_url : "",
                    api_password : "",
                    
                    export_root : "",
                    teacher: "",
                    period : []
                } 
            ]
        }

        super.setState(clipped)

        const string = JSON.stringify(clipped);
        await ipcRenderer.invoke("saveApp", string)
    }

    async deleteServer() {
        if (this.state.servers.length == 0) {
            return
        }

        const clipped = {
            index: 0,
            servers: [
                ...this.state.servers.slice(0, this.state.index),
                ...this.state.servers.slice(this.state.index + 1)
            ]
        }

        super.setState(clipped)

        const string = JSON.stringify(clipped);
        await ipcRenderer.invoke("saveApp", string)
    }

    async setState(state: Partial<landing_single_state> | {index: number}) {
        var clipped: landing_state
        if ('index' in state) {
            clipped = Object.assign({}, this.state, state)
        } else {
            const sub = Object.assign({}, this.state.servers[this.state.index], state)
            clipped = Object.assign({}, this.state, {
                servers: [
                    ...this.state.servers.slice(0, this.state.index),
                    sub,
                    ...this.state.servers.slice(this.state.index + 1)
                ]
            })
        }

        super.setState(clipped);

        const string = JSON.stringify(clipped);
        await ipcRenderer.invoke("saveApp", string)
    }



    render() {
        return (
            <Landing 
                state={this.state} 
                setState={this.setState}
                addServer={this.addServer}
                deleteServer={this.deleteServer}
            />
        )
    }
}
