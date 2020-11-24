import React, { useState, useEffect } from 'react';
// import { Navbar, Nav, Button, Form, FormControl, Dropdown } from 'react-bootstrap';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { useHistory, useLocation } from 'react-router-dom';
import { executeQuery } from '../utilities';
import config from "../config";

// material ui
import {makeStyles} from '@material-ui/core/styles';

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TextField from "@material-ui/core/TextField";

import AccountCircle from "@material-ui/icons/AccountCircle";
import EventIcon from '@material-ui/icons/Event';
import PeopleIcon from '@material-ui/icons/People';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    tabs: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    title: {
      flexGrow: 1,
    },
    scheduleName: {
        color: 'white',
    },
    logo: {
        height: 46
    },
}));

export default function AppNav({tier=config.freeTierName, setLoggedIn=() => {}}) {
    const [query, setQuery] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);

    let history = useHistory();
    let location = useLocation();

    // eslint-disable-next-line
    useEffect(executeQuery(query, {path: "/schedule/getSchedule", data: {}, onResponse: (res) => {
        setSchedule(res.data);
    }}), [query]);

    const classes = useStyles();
    
    function handleTabChange(event, newValue) {
        history.push(newValue);
    }

    return (
        <AppBar position="static" className={classes.root}>
            <Toolbar>
                {/* <img src="/logo-secondary.png" alt="logo" className={classes.logo} /> */}
                <Typography variant="h6" className={classes.title}>
                    <TextField 
                    multiline
                    InputProps={{className: classes.scheduleName}}
                    onBlur={event => setQuery({path: "/schedule/renameSchedule", data: {oldScheduleName: schedule.scheduleName, newScheduleName: event.target.value}})} 
                    defaultValue={schedule.scheduleName}
                    helperText="Schedule Name"
                    />
                </Typography>
                <Tabs value={location.pathname} onChange={handleTabChange} centered fullwidth className={classes.tabs}>
                    <Tab value="/Calendar" label="Calendar" icon={<EventIcon />} />
                    <Tab value="/People" label="People" icon={<PeopleIcon />} />
                </Tabs>
                <IconButton
                onClick={event => setAnchorEl(event.currentTarget)}
                color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <Menu
                anchorEl={anchorEl}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                transformOrigin={{vertical: 'top', horizontal: 'center'}}
                open={anchorEl !== null}
                onClose={() => setAnchorEl(null)}
                >
                    <MenuItem onClick={() => history.push("/Subscription")}>Premium</MenuItem>
                    {tier !== config.freeTierName ? <MenuItem onClick={() => setQuery({path: "/stripeRoutes/customer-portal", onResponse: res => window.location.href = res.data.url})}>Billing</MenuItem> : <></>}
                    <MenuItem onClick={() => {setQuery({path: "/online/logout", data: {}, onResponse: function() {setLoggedIn(false); history.push("/Login");}})}}>Logout</MenuItem>
                </Menu>
            </Toolbar>
      </AppBar>
    );
}