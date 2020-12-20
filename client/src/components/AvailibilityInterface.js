import { Grid } from "@material-ui/core";
import React, { useState, useRef, useEffect } from 'react';
import { DateTime } from "luxon";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import luxonPlugin from '@fullcalendar/luxon';

import config from "../config";
import {rruleObject, rruleString} from "../utilities";
import RRuleInterface from "./RRuleInterface";

import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";

export default function AvailibilityInterface(props) {
    const {
        availabilities=[], 
        onAdd=(start, end, timezone, rrule) => {}, 
        onChange=(index, start, end, timezone, rrule) => {}, 
        onRemove=index => {}
    } = props;
    const [index, setIndex] = useState(-1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const calendarRef = useRef(null);
    const [headerToolbar, setHeaderToolbar] = useState({start: "monthButton", center: "title", end: "today prev,next"});
    const [checked, setChecked] = useState(false);
    const [newRule, setNewRule] = useState(null);

    useEffect(function() {
        if (index >= 0 && index < availabilities.length) {
            if (availabilities[index].rrule !== null) {
                setChecked(true);
                setNewRule(availabilities[index].rrule);
            }
            else {
                setChecked(false);
                setNewRule(null);
            }
        }
    }, [index, availabilities])

    function createEvents() {
        let events = [];
        for (let i = 0; i < availabilities.length; i++) {
            events.push({
                title: "Available",
                backgroundColor: config.colors.primary.main,
                borderColor: config.colors.primary.main,
                textColor: config.colors.primary.contrastText
            });
            if (availabilities[i].rrule) {
                events[i].groupId = i.toString();
                events[i].rrule = availabilities[i].rrule;
                events[i].dtStart = DateTime.fromMillis(availabilities[i].start).toISO();
                events[i].duration = {milliseconds: availabilities[i].end - availabilities[i].start}
            }
            else {
                events[i].id = i.toString();
                events[i].start = DateTime.fromMillis(availabilities[i].start).toISO();
                events[i].end = DateTime.fromMillis(availabilities[i].end).toISO();
            }
        }
        return events;
    }

    function onEventChange(info) {
        const index = parseInt(info.event.id || info.event.groupId);
        const start = DateTime.fromISO(info.event.startStr).toMillis();
        const end = DateTime.fromISO(info.event.endStr).toMillis();
        const diff = start - availabilities[index].start;
        let rrule = availabilities[index].rrule;
        if (rrule) {
            let rruleObj = rruleObject(rrule);
            rruleObj.start = DateTime.fromMillis(start);
            if (rruleObj.until) {
                rruleObj.until = rruleObj.until.plus({milliseconds: diff});
            }
            rrule = rruleString(rruleObj);
        }
        onChange(index, start, end, availabilities[index].timezone, rrule);
    }

    function dialogJsx() {
        if (index >= 0 && index < availabilities.length) {
            let rruleJsx = <div></div>;
            if (checked) {
                rruleJsx = (
                    <RRuleInterface 
                    dtStart={DateTime.fromMillis(availabilities[index].start)} 
                    rrule={newRule} 
                    setRRule={setNewRule}/>
                );
            }
            return <FormControl>
                <Button style={{float: "right"}} variant="outlined" color="primary" onClick={() => {setDialogOpen(false); onRemove(index)}}>Delete</Button>
                <RadioGroup value={checked ? "right" : "left"}>
                    <FormControlLabel
                    value="left"
                    control={<Radio onChange={e => {if (e.target.checked) {setNewRule(null); setChecked(false)}}} color="primary" />}
                    label="Doesn't Repeat"
                    labelPlacement="top"
                    />
                    <FormControlLabel
                    value="right"
                    control={<Radio onChange={e => {if (e.target.checked) setChecked(true)}} color="primary" />}
                    label="Repeats"
                    labelPlacement="top"
                    />
                </RadioGroup>
                {rruleJsx}
                <Button variant="contained" color="primary" onClick={() => {setDialogOpen(false); onChange(
                index, 
                availabilities[index].start, 
                availabilities[index].end,
                availabilities[index].timezone,
                newRule
                )}}>Apply</Button>
            </FormControl>;
        }
        else return <div></div>;
    }

    return (
        <Grid content>
            <Grid item xs={12}>
                <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin, luxonPlugin]}
                headerToolbar={headerToolbar}
                firstDay={0}
                timeZone={DateTime.local().zoneName}
                initialView={"timeGridWeek"}
                events={createEvents()}
                initialDate={DateTime.local().toISO()}
                editable={true}
                selectable={true}
                contentHeight="auto"
                height="auto"
                views={{
                    timeGridWeek: {
                        dateClick: info => onAdd(
                            DateTime.fromISO(info.dateStr).toMillis(), 
                            DateTime.fromISO(info.dateStr).plus({hours: 1}).toMillis(),
                            DateTime.local().zoneName,
                            null
                        ),
                        slotDuration: "00:30:00",
                        snapDuration: "00:05:00",
                    },
                    dayGridMonth: {
                        dateClick: info => {
                            let api = calendarRef.current.getApi();
                            api.changeView("timeGridWeek", DateTime.fromISO(info.dateStr).toMillis());
                            setHeaderToolbar({start: "monthButton", center: "title", end: "today prev,next"});
                        },
                        slotDuration: "01:00:00",
                        snapDuration: "00:05:00",
                    }
                }}
                customButtons={{
                    monthButton: {
                        text: "Month",
                        click: () => {
                            calendarRef.current.getApi().changeView("dayGridMonth", calendarRef.current.getApi().getDate());
                            setHeaderToolbar({start: "", center: "title", right: "today prev,next"})
                        }
                    }
                }}

                eventDrop={onEventChange}
                eventResize={onEventChange}

                eventClick={info => {setIndex(parseInt(info.event.id || info.event.groupId)); setDialogOpen(true);}}
                />
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    {dialogJsx()}
                </Dialog>
            </Grid>
        </Grid>
    );
}