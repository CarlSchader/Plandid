import React, { useState, useRef } from 'react';

import { DateTime, Interval } from "luxon";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import luxonPlugin from '@fullcalendar/luxon';

import {rruleString, rruleObject, copyObject, localDate, eventFire} from "../utilities";
import {millisecondMap} from "../constants";
import config from "../config";
import EventPopover from './EventPopover';

const minSelectMinutes = 10;
const selectMinutesModulus = 5;
let newEvents = [];
let mirrorElements = [];

function Calendar({tier=""}) {
    const calendarRef = useRef(null);
    const [state, setState] = useState(1);
    const [selectedDate, setSelectedDate] = useState(DateTime.local());
    const {0: plans} = useState([]);
    const [eventPopoverOpen, setEventPopoverOpen] = useState(false);
    const [currentInfo, setCurrentInfo] = useState(null);

    function setNewEvents(events) {
        newEvents = [];
        let api = calendarRef.current.getApi();
        let calendarEvents = api.getEvents();
        for (let i = 0; i < calendarEvents.length; i++) {
            calendarEvents[i].remove();
        }
        for (let i = 0; i < events.length; i++) {
            newEvents.push(events[i]);
            addEventToCalendar(events[i], i);
        }
    }

    const states = {
        0: {
            view: "dayGridMonth",
            isEditable: true, // NEW was false
            headerToolbar: {start: "", center: "title", end: "currentMonth prev,next"},
            selectable: true,
            dateClick: dateClickStandard,
            select: () => {},
            slotDuration: "01:00:00",
            snapDuration: "00:30:00",
            contentHeight: null,
            height: window.innerHeight,
            firstDate: 0,
        },
        1: {
            view: "timeGridWeek",
            isEditable: true,
            headerToolbar: {start: "monthButton", center: "title", end: "currentWeek prev,next"},
            selectable: true,
            dateClick: info => {console.log(info);},
            select: async function(info) {
                console.log(calendarRef);
                const start = DateTime.fromISO(info.startStr).toMillis();
                let distance = Math.max(DateTime.fromISO(info.endStr).toMillis() - start, minSelectMinutes * millisecondMap.minute);
                distance = distance - (distance % (selectMinutesModulus * millisecondMap.minute));
                let newEvent = {
                    start: start,
                    end: start + distance,
                    name: "New Task",
                    category: null,
                    timezone: DateTime.local().zoneName,
                    rrule: null
                };
                let events = copyObject(newEvents);
                events.push(newEvent);
                setNewEvents(events);
            },
            slotDuration: "00:15:00",
            snapDuration: `00:05:00`,
            contentHeight: 'auto',
            height: 'auto',
            firstDate: 0,
        },
        2: {
            view: "timeGridDay",
            isEditable: true,
            headerToolbar: {start: "weekButton", center: "title", end: "currentDay prev,next"},
            selectable: true,
            dateClick: info => {},
            select: async function(info) {
                let dt = DateTime.fromISO(info.dateStr);
                let newEvent = {
                    start: dt.toMillis(),
                    end: dt.plus({hours: 1}).toMillis(),
                    name: "New Task",
                    category: null,
                    timezone: DateTime.local().zoneName,
                    rrule: null
                };
                let events = copyObject(newEvents);
                events.push(newEvent);
                setNewEvents(events);
            },
            slotDuration: "00:15:00",
            snapDuration: `00:05:00`,
            contentHeight: 'auto',
            height: 'auto',
            firstDate: 0,
        }
    };

    // TODO: When we query backend for plans, use this function to populate calendar.
    function getCalendarEvents() {
        for (let i = 0; i < newEvents.length; i++) {
            const newEvent = newEvents[i];
            addEventToCalendar(newEvent);
        }
    }

    function addEventToCalendar(newEvent, index) {
        let api = calendarRef.current.getApi();
        if (newEvent.rrule) {
            api.addEvent({
                backgroundColor: config.colors.primary.main,
                borderColor: config.colors.primary.main,
                textColor: config.colors.primary.contrastText,
                groupId: "n" + index.toString(),
                title: newEvent.name + (newEvent.category ? ": " + newEvent.category : ""),
                dtstart: localDate(newEvent.start).toISO(),
                duration: {milliseconds: Interval.fromDateTimes(localDate(newEvent.start), localDate(newEvent.end)).length("milliseconds")},
                rrule: newEvent.rrule,
                extendedProps: newEvent
            });
        }
        else {
            api.addEvent({
                backgroundColor: config.colors.primary.main,
                borderColor: config.colors.primary.main,
                textColor: config.colors.primary.contrastText,
                id: "n" + index.toString(),
                title: newEvent.name + (newEvent.category ? ": " + newEvent.category : ""),
                start: localDate(newEvent.start).toISO(),
                end: localDate(newEvent.end).toISO(),
                extendedProps: newEvent
            });
        }
    }

    function changeState(newState, nextDate) {
        if (newState in states) {
            setState(newState);
            let calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(states[newState].view, nextDate.toMillis());
        }
    }

    function dateClickStandard(info) {
        let dt = DateTime.fromISO(info.dateStr);
        if (info.date) {
            setSelectedDate(dt);
            changeState(state + 1, dt);
        }
    }

    function onCalendarEventChange(info) {
        const event = info.event;
        let idLetter = '';
        let id = -1;
        const difference = DateTime.fromISO(event.startStr).toMillis() - localDate(event.extendedProps.start).toMillis();
        let rrule = event.extendedProps.rrule;
        let rruleObj = rruleObject(rrule);
        if (event.groupId) {
            idLetter = event.groupId[0];
            id = parseInt(event.groupId[1]);
            rruleObj.start = rruleObj.start.plus(difference);
            if (rruleObj.until) rruleObj.until = rruleObj.until.plus(difference);
            rrule = rruleString(rruleObj);
        }
        else {
            idLetter = event.id[0];
            id = parseInt(event.id[1]);
        }
        switch (idLetter) {
            case 'n':
                newEvents[id] = {
                    start: DateTime.fromISO(event.startStr).toMillis(),
                    end: DateTime.fromISO(event.endStr).toMillis(),
                    name: event.title,
                    category: event.extendedProps.category,
                    timezone: event.extendedProps.zoneName,
                    rrule: rrule
                }
                break;
            default:
                break;
        }
    }

    function handleMirror(info) {
        info.el.style.backgroundColor = config.colors.primary.main;
        info.el.style.borderColor = config.colors.primary.main;
        info.el.style.textColor = config.colors.primary.contrastText;
        mirrorElements.push(info.el);

        info.el.addEventListener("mouseup", () => {
            for (let i = 0; i < mirrorElements.length; i++) {
                mirrorElements[i].remove();
            }
        });
    }

    function dialogJsx() {
        if (currentInfo) {
            return <EventPopover
            open={eventPopoverOpen}
            setOpen={setEventPopoverOpen}
            info={currentInfo} 
            eventsArray={newEvents} 
            setNewEvents={setNewEvents}
            calendarRef={calendarRef}
            />;
        }
        else {
            return <div></div>
        }
    }

    return (
        <div>
            <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin, luxonPlugin]}
            timeZone={DateTime.local().zoneName}
            initialView={states[state].view}
            // events={getCalendarEvents()}
            initialDate={selectedDate.toISO()}
            firstDay={states[state].firstDay}
            eventResizableFromStart={true}
            // selectMirror={true}
            longPressDelay={333}
            // expandRows={true}
            editable={states[state].isEditable}
            headerToolbar={states[state].headerToolbar}
            selectable={states[state].selectable}
            dateClick={states[state].dateClick}
            select={states[state].select}
            slotDuration={states[state].slotDuration}
            snapDuration={states[state].snapDuration}
            contentHeight={states[state].contentHeight}
            height={states[state].height}

            eventDidMount={info => {
                if (info.isMirror) {
                    handleMirror(info);
            }}}
            eventDrop={onCalendarEventChange}
            eventResize={onCalendarEventChange}

            eventClick={info => {setCurrentInfo(info); setEventPopoverOpen(true)}}

            customButtons={{
                monthButton: {
                    text: "Month",
                    click: () => {changeState(0, selectedDate)}
                },
                weekButton: {
                    text: "Week",
                    click: () => {changeState(1, selectedDate)}
                },
                currentMonth: {
                    text: "Current Month",
                    click: () => {setSelectedDate(DateTime.local()); changeState(0, DateTime.local());}
                },
                currentWeek: {
                    text: "Current Week",
                    click: () => {setSelectedDate(DateTime.local()); changeState(1, DateTime.local());}
                },
                currentDay: {
                    text: "Today",
                    click: () => {setSelectedDate(DateTime.local()); changeState(2, DateTime.local());}
                },
                applyButton: {
                    text: "Apply Changes",
                    click: _ => {}
                }
            }}
            />
            {dialogJsx()}
        </div>
    );
}

export default Calendar;
