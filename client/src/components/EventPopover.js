import React, { useEffect, useState } from "react";
import {copyObject, localDate} from "../utilities";
import CategoryPicker from "./CategoryPicker";
import RRuleInterface from "./RRuleInterface";

import {makeStyles} from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

const useStyles = makeStyles(theme => ({
    dialogCard: {
        padding: "2rem" 
    },
    deleteButton: {
        float: "right"
    }
}));

function EventPopover({info={}, eventsArray=[], setNewEvents=() => {},open=false, setOpen=() => {}}) {
    const [newName, setNewName] = useState(info.event.extendedProps.name);
    const [rrule, setRRule] = useState(info.event.extendedProps.rrule);
    const [doesRepeat, setDoesRepeat] = useState(info.event.extendedProps.rrule !== null ? true : false);
    const [category, setCategory] = useState(info.event.extendedProps.category);
    const classes = useStyles();

    let id = "";
    if (info.event.extendedProps.rrule) {
        id = info.event.groupId;
    }
    else {
        id = info.event.id;
    }

    useEffect(function() {
        setRRule(info.event.extendedProps.rrule);
        setDoesRepeat(info.event.extendedProps.rrule !== null ? true : false);
    }, [info]);

    function deleteEvent() {
        setOpen(false);
        let idLetter = id[0];
        let idNumb = parseInt(id[id.length - 1]);
        if (idLetter === 'n') {
            let eventsCopy = copyObject(eventsArray);
            eventsCopy.splice(idNumb, 1);
            setNewEvents(eventsCopy);
        }
        info.event.remove();
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
        newEvent.rrule = rrule;
        newEvent.category = category;
        eventsArray[idNumb] = newEvent;
        setNewEvents(eventsArray);
    }

    function repeatingJsx() {
        let jsx = <div></div>;
        if (doesRepeat) jsx = <RRuleInterface dtStart={localDate(info.event.extendedProps.start)} rrule={rrule} setRRule={setRRule}/>;
        return (
            <div>
            <FormControl component="fieldset">
                <RadioGroup row name="position" value={doesRepeat ? "right" : "left"} defaultValue="left">
                    <FormControlLabel
                    value="left"
                    control={<Radio onChange={e => {if (e.target.checked) setDoesRepeat(false)}} color="primary" />}
                    label="Doesn't Repeat"
                    labelPlacement="top"
                    />
                    <FormControlLabel
                    value="right"
                    control={<Radio onChange={e => {if (e.target.checked) setDoesRepeat(true)}} color="primary" />}
                    label="Repeats"
                    labelPlacement="top"
                    />
                </RadioGroup>
            </FormControl>
            {jsx}
            </div>
        );
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
                        {repeatingJsx()}
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
