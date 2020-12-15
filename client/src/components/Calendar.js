import React, { useState, useRef } from 'react';

import { DateTime, Interval } from "luxon";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import luxonPlugin from '@fullcalendar/luxon';

import {rruleString, rruleObject, copyObject, localDate} from "../utilities";
import EventPopover from './EventPopover';

function Calendar({tier=""}) {
    const calendarRef = useRef(null);
    const [state, setState] = useState(1);
    const [selectedDate, setSelectedDate] = useState(DateTime.local());
    const {0: plans} = useState([]);
    const [newEvents, setNewEvents] = useState([]);
    const [eventPopoverOpen, setEventPopoverOpen] = useState(false);
    const [currentInfo, setCurrentInfo] = useState(null);

    const states = {
        0: {
            view: "dayGridMonth",
            isEditable: false,
            headerToolbar: {start: "title", canter: "", end: "currentMonth prev,next"},
            selectable: true,
            dateClick: dateClickStandard,
            slotDuration: "01:00:00",
            snapDuration: "00:30:00",
            contentHeight: null,
            height: window.innerHeight
        },
        1: {
            view: "timeGridWeek",
            isEditable: true,
            headerToolbar: {start: "monthButton title", canter: "title", end: "currentWeek prev,next"},
            selectable: true,
            dateClick: dateClickStandard,
            slotDuration: "00:30:00",
            snapDuration: "00:05:00",
            contentHeight: 'auto',
            height: 'auto'
        },
        2: {
            view: "timeGridDay",
            isEditable: true,
            headerToolbar: {start: "weekButton title", canter: "title", end: "currentDay prev,next"},
            selectable: true,
            dateClick: async function(info) {
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
            slotDuration: "00:30:00",
            snapDuration: "00:05:00",
            contentHeight: 'auto',
            height: 'auto'
        }
    };

    // eslint-disable-next-line
    // useEffect(function() {

    // }, [newEvents, plans]);

    function getCalendarEvents() {
        let events = []
        for (let i = 0; i < plans.length; i++) {
            let titleString = `plans[i].taskName: plans[i].personName`;
            let backgroundColor = "green";
            if (plans[i].personName === null || plans[i].personName === undefined) {
                titleString = plans[i].taskName;
                backgroundColor = "red";
            }
            events.push({
                id: i.toString(),
                title: titleString,
                start: DateTime.utc(plans[i].start).toISO(),
                end: DateTime.utc(plans[i].end).toISO(),
                backgroundColor: backgroundColor,
                extendedProps: plans[i]
            });
        }
        for (let i = 0; i < newEvents.length; i++) {
            const newEvent = newEvents[i];
            if (newEvent.rrule) {
                events.push({
                    groupId: "n" + i.toString(),
                    title: newEvent.name + (newEvent.category ? ": " + newEvent.category : ""),
                    dtstart: localDate(newEvent.start).toISO(),
                    duration: {milliseconds: Interval.fromDateTimes(localDate(newEvent.start), localDate(newEvent.end)).length("milliseconds")},
                    rrule: newEvent.rrule,
                    extendedProps: newEvent
                });
            }
            else {
                events.push({
                    id: "n" + i.toString(),
                    title: newEvent.name + (newEvent.category ? ": " + newEvent.category : ""),
                    start: localDate(newEvent.start).toISO(),
                    end: localDate(newEvent.end).toISO(),
                    extendedProps: newEvent
                });
            }
        }
        return events;
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
                let events = copyObject(newEvents);
                events[id] = {
                    start: DateTime.fromISO(event.startStr).toMillis(),
                    end: DateTime.fromISO(event.endStr).toMillis(),
                    name: event.title,
                    category: event.extendedProps.category,
                    timezone: event.extendedProps.zoneName,
                    rrule: rrule
                }
                setNewEvents(events);
                break;
            default:
                break;
        }
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
            firstDay={1}
            timeZone={DateTime.local().zoneName}
            initialView={states[state].view}
            events={getCalendarEvents()}
            initialDate={selectedDate.toISO()}
            // expandRows={true}
            editable={states[state].isEditable}
            headerToolbar={states[state].headerToolbar}
            selectable={states[state].selectable}
            dateClick={states[state].dateClick}
            slotDuration={states[state].slotDuration}
            snapDuration={states[state].snapDuration}
            contentHeight={states[state].contentHeight}
            height={states[state].height}

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
