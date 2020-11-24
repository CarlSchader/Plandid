import React, { useState } from "react";
import { Form, InputGroup, Dropdown, DropdownButton, Button } from 'react-bootstrap';
import { RRule, rrulestr } from 'rrule';
import {DateTime} from "luxon";
import {copyObject, localDate, rruleString} from "../utilities";
import CategoryPicker from "./CategoryPicker";

function recurranceInit(rruleString) {
    if (rruleString) {
        let rule = rrulestr(rruleString);
        switch (rule.options.freq) {
            case RRule.HOURLY:
                return "Hourly";
            case RRule.DAILY:
                return "Daily";
            case RRule.WEEKLY:
                return "Weekly";
            case RRule.MONTHLY:
                return "Monthly";
            case RRule.YEARLY:
                return "Yearly";
            default:
                return "Once";
        }
    }
    return "Once";
}

function datetimeLocalFormat(dt) {
    return dt.toFormat("yyyy-MM-dd") + 'T' + dt.toFormat("hh:mm:ss.SSS");
}

function EventPopover({closeOverlay=() => {}, info={}, eventsArray=[], setEvents=() => {}}) {
    const [newName, setNewName] = useState(info.event.extendedProps.name);
    const [recurrance, setRecurrance] = useState(recurranceInit(info.event.extendedProps.rrule));
    const [recurranceNumb, setRecurranceNumb] = useState(1);
    const [untilDate, setUntilDate] = useState(localDate(info.event.extendedProps.start).plus({months: 1}));
    const [category, setCategory] = useState(info.event.extendedProps.category);

    let id = "";
    if (info.event.extendedProps.rrule) {
        id = info.event.groupId;
    }
    else {
        id = info.event.id;
    }

    function recurranceJSX() {
        function onChangeUntil() {
            setUntilDate(DateTime.fromISO(document.getElementById("untilDateElement").value));
        }
        if (recurrance === "Once") {
            return <div></div>;
        }
        else {
            return (
                <div>
                    <InputGroup.Prepend inline>
                        <InputGroup.Text inline>Every</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control onChange={e => setRecurranceNumb(parseInt(e.target.value))} inline type="number" defaultValue={recurranceNumb.toString()}/>
                    <InputGroup.Append inline>
                        <InputGroup.Text inline>{recurrance === "Daily" ? (recurranceNumb > 1 ? "Days" : "Day") : (recurrance.substring(0, recurrance.length-2)) + (recurranceNumb === 1 ? '' : 's')}</InputGroup.Text>
                    </InputGroup.Append>
                    <InputGroup.Prepend inline>
                        <InputGroup.Text inline>Until</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control min={datetimeLocalFormat(localDate(info.event.extendedProps.start))} defaultValue={datetimeLocalFormat(untilDate)} onChange={onChangeUntil} inline type="datetime-local" id="untilDateElement"/>
                </div>
            );
        }
    }

    function deleteEvent() {
        closeOverlay();
        let idLetter = id[0];
        let idNumb = parseInt(id[id.length - 1]);
        if (idLetter === 'n') {
            let eventsCopy = copyObject(eventsArray);
            eventsCopy.splice(idNumb, 1);
            setEvents(eventsCopy);
        }
    }

    function onApply() {
        closeOverlay();
        let idLetter = id[0];
        let idNumb = parseInt(id[id.length - 1]);
        let newEvent = copyObject(info.event.extendedProps);
        if (idLetter === 'n') {
            newEvent.name = newName;
        }
        else {
            newEvent.eventName = newName;
        }
        if (recurrance && recurrance !== "Once") {
            newEvent.rrule = rruleString(DateTime.local().zoneName, info.event.extendedProps.start, untilDate.toMillis(), recurrance, recurranceNumb);
        }
        newEvent.category = category;
        eventsArray[idNumb] = newEvent;
        setEvents(eventsArray);
    }

    return (
        <Form>
        <Form.Group>
            <Button onClick={deleteEvent} variant="danger">Delete</Button>
        </Form.Group>
        <Form.Group>
            <Form.Label>Task Name</Form.Label>
            <Form.Control onChange={e => setNewName(e.target.value)} type="text" placeholder={newName} id={`name-${info.event.id}`}/>
            <Form.Text className="text-muted">
            Name of the task for this time slot.
            </Form.Text>
        </Form.Group>

        <CategoryPicker selectedCategory={category} setSelectedCategory={setCategory}/>
        
        <Form.Group>
            <Form.Label>Recurrance</Form.Label>
            <Form.Label>Task Name</Form.Label>
            <DropdownButton inline variant="outline-success" title={recurrance}>
                <Dropdown.Item id="event-popover-once" onSelect={() => setRecurrance(document.getElementById("event-popover-once").innerText)}>Once</Dropdown.Item>
                <Dropdown.Item id="event-popover-hourly" onSelect={() => setRecurrance(document.getElementById("event-popover-hourly").innerText)}>Hourly</Dropdown.Item>
                <Dropdown.Item id="event-popover-daily" onSelect={() => setRecurrance(document.getElementById("event-popover-daily").innerText)}>Daily</Dropdown.Item>
                <Dropdown.Item id="event-popover-weekly" onSelect={() => setRecurrance(document.getElementById("event-popover-weekly").innerText)}>Weekly</Dropdown.Item>
                <Dropdown.Item id="event-popover-monthly" onSelect={() => setRecurrance(document.getElementById("event-popover-monthly").innerText)}>Monthly</Dropdown.Item>
                <Dropdown.Item id="event-popover-yearly" onSelect={() => setRecurrance(document.getElementById("event-popover-yearly").innerText)}>Yearly</Dropdown.Item>
            </DropdownButton>
            {recurranceJSX()}
            <Form.Text className="text-muted">
                This button changes how often this task reoccurs.
            </Form.Text>
        </Form.Group>
        <Button onClick={onApply} >Apply</Button>
        </Form>
    )
}

export default EventPopover;
