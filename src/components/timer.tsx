import {useEffect, useState} from "react";
import dayjs from "dayjs";

/*
    * Timer component
    * @param {number} unix - Unix timestamp
    * @param {boolean} fixed - If true, the 'unix' prop will need to be duration in milliseconds. This will result in displaying a fixed time.
 */
const Timer = ({unix, fixed}: { unix: number, fixed?: boolean }) => {
    const [time, setTime] = useState<string>("");

    function formatTime(msDiff: number) {
        let totalSeconds = Math.floor(msDiff / 1000);
        let totalMilliseconds = msDiff % 1000;

        // Calculate minutes and seconds
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        // Ensure minutes and seconds are two digits
        let minutesString = minutes.toString().padStart(2, '0');
        let secondsString = seconds.toString().padStart(2, '0');
        let millisecondsString = totalMilliseconds.toString().padStart(3, '0');

        return `${minutesString}:${secondsString}:${millisecondsString}`;
    }

    useEffect(() => {
        if (fixed) {
            setTime(formatTime(unix));
            return;
        }

        const interval = setInterval(() => {
            const msDiff = (dayjs().valueOf()) - unix;

            setTime(formatTime(msDiff));
        }, 50);

        return () => clearInterval(interval);
    }, []);


    return (
        <h1 className='text-4xl font-semibold italic'>{time}</h1>
    )
}

export default Timer;