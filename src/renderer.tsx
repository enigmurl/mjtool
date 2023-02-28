import React from 'react';
import ReactDOM from 'react-dom/client';

import { Routes, Route, HashRouter} from 'react-router-dom';
import AsyncStateLoader from './components/landing/state_provider';
import Main from './components/main/main';
import './global.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <HashRouter>
        <Routes>
            <Route path='/main' element={
                <Main/>
                }/>

            <Route  
                path='/' 
                element={
                    <AsyncStateLoader/>
                }
                />
        </Routes>
    </HashRouter>
)
