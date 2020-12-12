import React, {useState, useEffect} from "react";
import AvatarList from "./AvatartList";
import {executeQuery} from "../utilities";
import FlexibleBox from "./FlexibleBox";
import CategoryBadge from "./CategoryBadge";

import Grid from "@material-ui/core/Grid";

// onDelete takes a name parameter
// onClick takes name, person object parameters
// filter takes name, person object parameters and returns true if that person is included in the list, false if not.
export default function PeopleList(props) {
    const {onClick=(name, person) => {}, onDelete=null, onAdd=null, filter=(name, person) => true, rerenderBool=false} = props;
    const [people, setPeople] = useState({});
    
    // eslint-disable-next-line
    useEffect(executeQuery({path: "/people/getPeople", data: {}, onResponse: function(res) {
        let filteredPeople = {};
        for (const name in res.data) {
            if (filter(name, res.data[name])) {
                filteredPeople[name] = res.data[name];
            }
        }
        setPeople(filteredPeople);
    }}), [rerenderBool]);

    function generateInputObjects() {
        let objects = [];
        for (const name in people) {
            let catJsx = [];
            for (const category in people[name].categories) {
                catJsx.push(<CategoryBadge category={category} highlight={false} />);
            }
            objects.push({
                src: "",
                jsx: <Grid container alignItems="center" justify="center" spacing={2}>
                        <Grid item xs={3}>
                            <h2>{name}</h2>
                        </Grid>
                        <Grid item xs={9}>
                            <FlexibleBox>{catJsx}</FlexibleBox>
                        </Grid>
                    </Grid>, 
                avatarChildren: name[0],
                onClick: () => onClick(name, people[name]),
                onDelete: onDelete ? () => onDelete(name) : null
            });
        }
        return objects;
    }

    return (
        <AvatarList inputObjects={generateInputObjects()} onAdd={onAdd} addString={<h2>Add Person</h2>} />
    );
}