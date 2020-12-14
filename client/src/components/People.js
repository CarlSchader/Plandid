import React, { useState, useEffect } from 'react';
import { executeQuery, copyObject } from '../utilities';
import PeopleList from "./PeopleList";
import AddPersonDialog from './AddPersonDialog';
import PersonPage from "./PersonPage";

function People() {
    const [query, setQuery] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [people, setPeople] = useState({});
    const [currentName, setCurrentName] = useState(null);
    const [personOpen, setPersonOpen] = useState(false);

    // eslint-disable-next-line
    useEffect(executeQuery(query, {
        path: "/people/getPeople",
        data: {},
        onResponse: res => setPeople(res.data)
    }), [query]);

    function onCategorySelect(category) {
        let newCats = copyObject(people[currentName].categories);
        newCats[category] = "";
        setQuery({path: "/people/setCategories", data: {name: currentName, categories: newCats}});
    }

    function onCategoryDeselect(category) {
        let newCats = copyObject(people[currentName].categories);
        delete newCats[category];
        setQuery({path: "/people/setCategories", data: {name: currentName, categories: newCats}});
    }

    if (personOpen) {
        return <PersonPage 
        name={currentName}
        categories={people[currentName] ? people[currentName].categories : {}}
        availabilities={people[currentName] ? people[currentName].availabilities : []}
        setQuery={setQuery}
        onClose={() => setPersonOpen(false)}
        onChangeName={newName => {
            setQuery({path: "/people/changeName", data: {oldName: currentName, newName: newName}, onResponse: res =>
                {if (res.data === 0) setCurrentName(newName);}
            }); 
        }}
        onCategorySelect={onCategorySelect}
        onCategoryDeselect={onCategoryDeselect}
        />;
    }
    else {
        return (
            <div>
                <PeopleList 
                people={people}
                onDelete={name => setQuery({path: "/people/removePerson", data: {name: name}})} 
                onAdd={() => setDialogOpen(true)}
                onClick={name => {setCurrentName(name); setPersonOpen(true);}}
                />
                <AddPersonDialog 
                open={dialogOpen} 
                setOpen={setDialogOpen} 
                onAdd={name => setQuery({path: "/people/addPerson", data: {name: name}})} 
                />
            </div>
        );
    }
}

export default People;