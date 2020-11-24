import React from "react";
import {Button} from "react-bootstrap";

function CategoryBadge({onDeselect=() => {}, onSelect=() => {}, variant="warning", selected=false, category=null}) {
    return (
        <Button onClick={selected ? onDeselect : onSelect} variant={selected ? variant : "outline-" + variant}>
            {category}
        </Button>
    );
}

export default CategoryBadge;