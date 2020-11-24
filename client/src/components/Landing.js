import React from 'react';
import { useHistory } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootAppBar: {
    flexGrow: 1,
  },
  toolbar: {
    minHeight: 128,
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    alignSelf: 'flex-end',
  },
  logo: {
      maxWidth: "33%"
  }
}));

function Landing() {
    const classes = useStyles();
    let history = useHistory();
    return (
        <div>
            <div className={classes.rootAppBar}>
                <AppBar position="static">
                    <Toolbar className={classes.toolbar}>
                    <Typography className={classes.title} variant="h5" noWrap>
                        <img className={classes.logo} src={"/logo-secondary.png"} alt="logo" />
                        <h6>Scheduling simplified</h6>
                    </Typography>
                    </Toolbar>
                </AppBar>
            </div>
            <Button onClick={function() {history.push('/Login')}} variant="primary">Login</Button>
        </div>
    );
}

export default Landing;