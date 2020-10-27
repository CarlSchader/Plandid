import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { DateTime } from "luxon";
import { localDateFromValues } from '../utilities';
import config from "../config";

function Day({tier="free", dateTime={}, plans=[]}) { // value
    function incompletePlans() {
        for (let i = 0; i < plans.length; i++) {
            if (plans[i].personName === null) {
                return true;
            }
        }
        return false;
    }

    function getColor() {
        let dt = localDateFromValues();
        if (dateTime.year === dt.year && dateTime.month === dt.month && dateTime.day === dt.day) {
            return "warning";
        }
        else {
            return "light";
        }
    }

    function getCompleteStrings() {
        let color = "";
        let message = "";
        if (plans.length > 0) {
            if (dateTime.toMillis() < localDateFromValues().toMillis()) {
                color = "warning";
                message = "Past Date";
            }
            else if (incompletePlans()) {
                color = "danger";
                message = "Unfilled Tasks";
            }
            else {
                color = "success";
                message = "All Good"
            }
        }
        else {
            if (tier in config.tiers && dateTime.toMillis() < DateTime.utc().toMillis() - config.tiers[tier].storageMillis) {
                color = "secondary";
                message = "Subscribe for more storage.";
            }
            else if (tier in config.tiers && dateTime.toMillis() > DateTime.utc().toMillis() + config.tiers[tier].forwardMillis) {
                color = "secondary";
                message = "Subscribe for more planning.";
            }
            else {
                message = "No Tasks."
            }
        }
        return [color, message];
    }

    return (
        <Card bg={getColor()} className={`text-left`}>
            <Card.Header>{dateTime.day}</Card.Header>
            <ListGroup variant={`flush`}>
            <ListGroup.Item variant={getCompleteStrings()[0]}>{getCompleteStrings()[1]}</ListGroup.Item>
            </ListGroup>
        </Card>
    );
}

export default Day;