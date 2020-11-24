import React, {useState, useEffect} from "react";
import { Form, Button } from 'react-bootstrap';
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
            return <Form.Control onKeyDown={(e) => {if (e.keyCode === 13) {onBlur()}}} onBlur={onBlur} type="text" id="add-cat" />;
        }
        else {
            return <Button variant="outline-success" onClick={() => {setAddingCat(true)}}>+</Button>
        }
    }

    return (
        <Form.Group>
            <Form.Label>Category</Form.Label>
                <FlexibleBox>{makeCategoryBadges()}{addCatJSX()}</FlexibleBox>
            <Form.Text className="text-muted">
                Only people who have the selected category can work this task.
            </Form.Text>
        </Form.Group>
    )
}

export default CategoryPicker;