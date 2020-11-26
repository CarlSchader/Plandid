import React, {useState, useEffect} from "react";
// import { Form, Button } from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import {executeQuery, copyObject} from "../utilities";

import FlexibleBox from "./FlexibleBox";
import CategoryBadge from "./CategoryBadge";

function CategoryPicker({selectedCategory=null, setSelectedCategory=() => {}}) {
    const [categories, setCategories] = useState(null);
    const [addingCat, setAddingCat] = useState(false);

    // eslint-disable-next-line
    useEffect(executeQuery(null, {path: "/categories/getCategories", data: {}, onResponse: (res) => {
        setCategories(res.data);
    }}), []);

    function makeCategoryBadges() {
        let jsx = [];
        for (let cat in categories) {
            function onSelect() {
                setSelectedCategory(cat);
            }
            function onDeselect() {
                setSelectedCategory(null);
            }
            jsx.push(<CategoryBadge selected={cat === selectedCategory} category={cat} onSelect={onSelect} onDeselect={onDeselect} />);
        }
        return jsx;
    }

    function temporarilyAddCategory(category) {
        let categoriesCopy = copyObject(categories);
        categoriesCopy[category] = null;
        setCategories(categoriesCopy);
    }

    function addCatJSX() {
        if (addingCat) {
            function onBlur() {
                const name = document.getElementById("add-cat").value.trim();
                if (name && name.length > 0 && name !== '+') {
                    temporarilyAddCategory(name);
                }
                setAddingCat(false);
            }
            return <TextField onKeyDown={(e) => {if (e.keyCode === 13) {onBlur()}}} onBlur={onBlur} id="add-cat" />;
        }
        else {
            return <Button variant="outlined" color="secondary.light" onClick={() => {setAddingCat(true)}}><AddIcon /></Button>
        }
    }

    return (
        <div>
            <InputLabel>Category</InputLabel>
                <FlexibleBox>{makeCategoryBadges()}{addCatJSX()}</FlexibleBox>
            <FormHelperText>
                Only people who have the selected category can work this task.
            </FormHelperText>
        </div>
    )
}

export default CategoryPicker;