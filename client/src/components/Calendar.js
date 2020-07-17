import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Month from './Month';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Calendar() {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    function handleOnClick(forward) {
        return function () {
            if (forward) {
                if (month === 11) {
                    setMonth(0);
                    setYear(year + 1);
                }
                else {
                    setMonth(month + 1);
                }
            }
            else {
                if (month === 0) {
                    setMonth(11);
                    setYear(year - 1);
                }
                else {
                    setMonth(month - 1);
                }
            }
        }
    }
    
    return (
        <div>
            <Month year={year} month={month}/>
            <Button style={{marginLeft: "5%"}} onClick={handleOnClick(false)} variant="success" size="lg" type="button">
                {months[(month + 11) % 12]}
            </Button>
            <Button style={{marginRight: "5%"}} className="float-right" onClick={handleOnClick(true)} variant="success" size="lg" type="button">
                {months[(month + 1) % 12]}
            </Button>
        </div>
    );
}

export default Calendar;