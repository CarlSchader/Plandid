import React, { useState, useEffect } from 'react';
import { executeQuery } from '../utilities';
import PeopleList from "./PeopleList";
import AddPersonDialog from './AddPersonDialog';
import PersonPage from "./PersonPage";

function People() {
    const [query, setQuery] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [rerenderBool, setRerenderBool] = useState(false);
    const [currentPersonName, setCurrentPersonName] = useState(null);

    // eslint-disable-next-line
    useEffect(executeQuery(query), [query]);

    function rerenderList() {
        setRerenderBool(!rerenderBool);
    }

    if (currentPersonName) {
        return <PersonPage 
        name={currentPersonName}
        setName={setCurrentPersonName}
        />;
    }
    else {
        return (
            <div>
                <PeopleList 
                onDelete={name => setQuery({path: "/people/removePerson", data: {name: name}, onResponse: () => rerenderList()})} 
                onAdd={() => setDialogOpen(true)}
                onClick={(name, person) => {
                    setCurrentPersonName(name);
                }}
                rerenderBool={rerenderBool}
                />
                <AddPersonDialog open={dialogOpen} setOpen={setDialogOpen} onAddCallback={rerenderList} />
            </div>
        );
    }
}

export default People;