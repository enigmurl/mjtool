import { stat } from "fs";
import React, { useMemo } from "react";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Landing from "./landing";
import Main from "../main/main";
import { Guard, LoadingLarge, LoadingSmall } from "../../util/async";

const {ipcRenderer} = window.require('electron')


export interface landing_state {
    api_url : string,
    api_password : string,

    export_root : string,
    teacher: string | null,
    period: number[]
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
        api_url : "",
        api_password : "",
        
        export_root : "",
        teacher: "",
        period : []
    }

    constructor(props: {state: landing_state}) {
        super(props)
        if (props.state) {
            this.state = props.state
        }
        this.setState = this.setState.bind(this)
    }

    async setState(state: Partial<landing_state>) {
        super.setState(state);

        const clipped = Object.assign({}, this.state, state)
        const string = JSON.stringify(clipped);

        await ipcRenderer.invoke("saveApp", string)
    }

    render() {
        return (
            <Landing 
                state={this.state} 
                setState={this.setState}
            />
        )
    }
}
