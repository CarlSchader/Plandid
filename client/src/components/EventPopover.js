import React, { useState } from "react";
// import { Form, InputGroup, Dropdown, DropdownButton, Button } from 'react-bootstrap';
import {makeStyles} from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";

import { RRule, rrulestr } from 'rrule';
import {DateTime} from "luxon";
import {copyObject, localDate, rruleString} from "../utilities";
import CategoryPicker from "./CategoryPicker";
import RecurrancePicker from "./RecurrancePicker";

const useStyles = makeStyles(theme => ({
    dialogCard: {
        padding: "2rem" 
    },
    deleteButton: {
        float: "right"
    }
}));

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

function EventPopover({info={}, eventsArray=[], setEvents=() => {}}) {
    const [newName, setNewName] = useState(info.event.extendedProps.name);
    const [recurrance, setRecurrance] = useState(recurranceInit(info.event.extendedProps.rrule));
    const [recurranceNumb, setRecurranceNumb] = useState(1);
    const [untilDate, setUntilDate] = useState(localDate(info.event.extendedProps.start).plus({months: 1}));
    const [category, setCategory] = useState(info.event.extendedProps.category);
    const [open, setOpen] = useState(true);
    const classes = useStyles();

    let id = "";
    if (info.event.extendedProps.rrule) {
        id = info.event.groupId;
    }
    else {
        id = info.event.id;
    }

    function deleteEvent() {
        setOpen(false);
        let idLetter = id[0];
        let idNumb = parseInt(id[id.length - 1]);
        if (idLetter === 'n') {
            let eventsCopy = copyObject(eventsArray);
            eventsCopy.splice(idNumb, 1);
            setEvents(eventsCopy);
        }
    }

    function onApply() {
        setOpen(false);
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
        <Dialog onClose={() => setOpen(false)} open={open}>
            <DialogTitle>
                <TextField onChange={e => setNewName(e.target.value)} defaultValue={newName} />
                <Button className={classes.deleteButton} onClick={deleteEvent} variant="outlined" color="primary">Delete</Button>
            </DialogTitle>
            <Card elevation={3} className={classes.dialogCard}>
                <form noValidate autoComplete="off">
                    <div>
                    <CategoryPicker selectedCategories={{[category]: ""}} onSelect={setCategory} onDeselect={() => setCategory(null)}/>
                    </div>
                    <div>
                    <RecurrancePicker 
                    info={info}
                    untilDate={untilDate}
                    recurrance={recurrance} 
                    recurranceNumb={recurranceNumb} 
                    setRecurrance={setRecurrance} 
                    setRecurranceNumb={setRecurranceNumb} 
                    setUntilDate={setUntilDate} 
                    />
                    </div>
                    <div>
                    <Button onClick={onApply} variant="contained" color="primary">Apply</Button>
                    </div>
                </form>
            </Card>
        </Dialog>
    );
}

export default EventPopover;
