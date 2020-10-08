import axios from 'axios';
import config from './config';


// onFinish takes a response argument.
function sendRequest(path, data, onFinish) {
    axios.post(path, data, {baseURL: config.url, withCredentials: true}).then(onFinish);
}

function secondsToString(seconds) {
    let suffix = "AM";
    let hours = Math.floor(seconds / 3600);
    if (hours > 11) suffix = "PM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    let minutes = `${Math.floor((seconds % 3600) / 60)}`
    if (minutes < 10) minutes = `0${minutes}`;
    return `${hours}:${minutes} ${suffix}`;
}

function militaryToNormal(string) {
    let splitString = string.split(':');
    let hours = parseInt(splitString[0]);
    let suffix = "AM";
    if (hours > 11) suffix = "PM";
    hours = hours%12;
    if (hours === 0) hours = 12;
    let minutes = parseInt(splitString[1]);
    if (minutes < 10) minutes = `0${minutes}`;
    return `${hours}:${minutes} ${suffix}`;
}

const categoryMap = {
    primary: 0,
    secondary: 1,
    success: 2,
    warning: 3,
    danger: 4,
    info: 5,
    dark: 6
}

export {
    sendRequest,
    secondsToString,
    militaryToNormal,
    categoryMap
}