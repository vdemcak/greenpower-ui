import {useEffect, useState} from "react";
import {listen} from '@tauri-apps/api/event'

interface TState {
    lap: number;
    lap_start: number;
    best_lap: number;
    ar_teo_status: string;
    ar_teo: TArteo;
}

interface TArteo {
    rpm: number;
    speed: number;
    bat1: number;
    bat2: number;
    lap_trigger: number;
}


function App() {
    const [state, setState] = useState<TState>({} as TState);

    useEffect(() => {
        const unbind = listen('ar_teo', (e) => {
            setState(e.payload as TState);
        });

        return () => {
            unbind.then((u) => u());
        }
    }, []);

    return (
        <div
            className='w-screen h-screen bg-black text-white grid grid-cols-[1fr_2fr_1fr] grid-rows-[40px,repeat(4,1fr)]'>
            <div className="col-span-3 flex items-center px-4 gap-x-12">
                <span className="text-green-400">Arduino Teo OK</span>
                <span className="text-green-400">Arduino Teo OK</span>
                <span className="text-green-400">Arduino Teo OK</span>

            </div>
            {/* Last lap */}
            <div className='card-boder flex flex-col items-center justify-center'>
                <h1 className='text-4xl font-semibold italic'>01:55:37</h1>
                <span className='text-lg mt-1'>last lap</span>
            </div>
            {/* Current lap */}
            <div className='card-boder flex flex-col items-center justify-center'>
                <h1 className='text-4xl font-semibold italic'>00:43:18</h1>
            </div>
            {/* Best lap */}
            <div className='card-boder flex flex-col items-center justify-center'>
                <h1 className='text-4xl font-semibold italic'>01:32:52</h1>
                <span className='text-lg mt-1'>best lap</span>
            </div>
            {/* Voltage */}
            <div className='card-boder flex flex-col items-center justify-center'>
                <h1 className='text-4xl font-semibold italic'>{Math.round((state.ar_teo?.bat1 + state.ar_teo?.bat2) * 100) / 100}</h1>
                <span className='text-lg mt-1'>battery voltage</span>
            </div>
            {/* Best lap */}
            <div className='card-boder flex flex-col items-center justify-center row-span-2'>
                <h1 className='text-[10rem] font-semibold italic'>{Math.round(state.ar_teo?.speed / 100) / 10}</h1>
                <span className='text-lg'>km/h</span>
            </div>
            {/* RPM */}
            <div className='card-boder flex flex-col items-center justify-center'>
                <h1 className='text-4xl font-semibold italic'>{state.ar_teo?.rpm}</h1>
                <span className='text-lg mt-1'>motor RPM</span>
            </div>
            {/* Current */}
            <div className='card-boder flex flex-col items-center justify-center'>
                <h1 className='text-4xl font-semibold italic'>45.4</h1>
                <span className='text-lg mt-1'>battery current</span>
            </div>
            {/* Motor Temp */}
            <div className='card-boder flex flex-col items-center justify-center'>
                <h1 className='text-4xl font-semibold italic'>82.4</h1>
                <span className='text-lg mt-1'>motor temperature</span>
            </div>

            {/*<h1>Messages:</h1>*/}
            {/*{*/}
            {/*    messages.map((message, index) => (*/}
            {/*        <div key={index}>{message}</div>*/}
            {/*    ))*/}
            {/*}*/}
        </div>
    );
}

export default App;
