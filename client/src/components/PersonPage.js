import React, {useState, useEffect} from "react";
import {copyObject, executeQuery} from "../utilities";
import CategoryPicker from "./CategoryPicker";

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
    const {name="Unset Name", setName=() => {}} = props;
    const [categories, setCategories] = useState({});
    const [availabilities, setAvailibilities] = useState([]);
    const [query, setQuery] = useState(null);
    const classes = useStyles();

    //eslint-disable-next-line
    useEffect(executeQuery(query, {
        path: "/people/getPerson",
        data: {name: name},
        onResponse: res => {setCategories(res.data.categories); setAvailibilities(res.data.availabilities);}
    }), [query]);

    function handleChangeName(event) {
        event.preventDefault()
        const newName = event.target.value.trim();
        setQuery({
            path: "/people/changeName",
            data: {oldName: name, newName: newName},
            onResponse: () => setName(newName)
        });
        event.target.blur();
    }

    function onCatSelect(cat) {
        let newCats = copyObject(categories);
        newCats[cat] = "";
        setQuery({
            path: "/people/setCategories",
            data: {name: name, categories: newCats}
        });
    }

    function onCatDeselect(cat) {
        let newCats = copyObject(categories);
        delete newCats[cat];
        setQuery({
            path: "/people/setCategories",
            data: {name: name, categories: newCats}
        });
    }

    return (
        <Grid className={classes.root} align="center" alignItems="center" justify="center" container spacing={4}>
            <Grid container>
                <Grid alignItems="flex-start" item xs={3} spacing={4}>
                    <Button style={{margin: "1.5rem"}} size="large" onClick={() => setName(null)} color="primary" variant="contained" >Back</Button>
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
                <CategoryPicker selectedCategories={categories} onSelect={onCatSelect} onDeselect={onCatDeselect} />
            </Grid>
        </Grid>
    );
}