import { Grid } from "@material-ui/core";
import React, { useState, useRef } from 'react';

import { DateTime, Interval } from "luxon";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import luxonPlugin from '@fullcalendar/luxon';

import {rruleString, rruleObject, copyObject, localDate} from "../utilities";

export default function AvailibilityInterface() {
    const [dialogOpen, setDialogOpen] = useState(false);
    return (
        <div>
            {/* <FullCalendar 
            plugins={[timeGridPlugin, interactionPlugin, rrulePlugin, luxonPlugin]}
            />
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>

            </Dialog> */}
        </div>
    );
}