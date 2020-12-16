import React from "react";
import CategoryPicker from "./CategoryPicker";
import AvailabilitiesInterface from "./AvailibilityInterface";

import {makeStyles} from "@material-ui/core/styles";
import Avatar from '@material-ui/core/Avatar';
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    avatar: {
        width: theme.spacing(16),
        height: theme.spacing(16),
        fontSize: "6rem",
        backgroundColor: theme.palette.primary.light,
    }
}));

export default function PersonPage(props) {
    const {
        name="", 
        categories={}, 
        availabilities=[],
        onClose=() => {},
        onChangeName=newName => {},
        onCategorySelect=category => {},
        onCategoryDeselect=category => {},
        onAddAvailability=availibility => {},
        onChangeAvailability=availibility => {},
        onRemoveAvailibility=availibility => {},
    } = props;
    const classes = useStyles();

    function handleChangeName(event) {
        event.preventDefault()
        const newName = event.target.value.trim();
        onChangeName(newName);
        event.target.blur();
    }

    return (
        <Grid className={classes.root} align="center" alignItems="center" justify="center" container spacing={4}>
            <Grid container>
                <Grid alignItems="flex-start" item xs={3} spacing={4}>
                    <Button style={{margin: "1.5rem"}} size="large" onClick={onClose} color="primary" variant="contained" >Back</Button>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Avatar className={classes.avatar} >{name[0]}</Avatar>
            </Grid>
            <Grid item xs={12}>
                <TextField 
                onKeyDown={(e) => {if (e.keyCode === 13) {handleChangeName(e)}}} 
                onBlur={handleChangeName} defaultValue={name} 
                label="Name"
                size="large"
                />
            </Grid>
            <Grid item xs={12}>
                <CategoryPicker selectedCategories={categories} onSelect={onCategorySelect} onDeselect={onCategoryDeselect} />
            </Grid>
            <Grid item xs={12}>
                {/* <AvailabilitiesInterface 
                availabilities={availabilities} 
                onAdd={onAddAvailability} 
                onChange={onChangeAvailability} 
                onRemove={onRemoveAvailibility}
                /> */}
            </Grid>
        </Grid>
    );
}