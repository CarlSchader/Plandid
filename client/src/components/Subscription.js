import React from "react";
import {Container, Col, Row} from "react-bootstrap";
import { loadStripe } from '@stripe/stripe-js';
import {executeQuery} from "../utilities";
import config from "../config";

import ClickableCard from "./ClickableCard";

function Subscription({currentTier=config.freeTierName}) {

    function handleClick(upgradeTier) {
        return async function() {
            const stripePromise = loadStripe(config.stripe.publicKey);
            // Get Stripe.js instance
            const stripe = await stripePromise;
            // Call your backend to create the Checkout Session
            executeQuery({
                path: "/stripeRoutes/create-checkout-session",
                data: {upgradeTier: upgradeTier},
                onResponse: async function(response) {
                    const session = response.data;

                    // When the customer clicks on the button, redirect them to Checkout.
                    const result = await stripe.redirectToCheckout({
                        sessionId: session.sessionId,
                    });

                    if (result.error) {
                        // If `redirectToCheckout` fails due to a browser or network
                        // error, display the localized error message to your customer
                        // using `result.error.message`.
                        window.alert(result.error.message);
                    }
                }
            })();
        };
    };

    function tierCardsJsx() {
        let jsx = [];
        for (const tierName in config.tiers) {
            if (tierName !== config.freeTierName && tierName !== currentTier) {
                jsx.push(
                    <Col md="auto">
                        <ClickableCard className="w-25 h-25" onClick={handleClick(tierName)} header={<h1>{tierName.charAt(0).toUpperCase() + tierName.slice(1)}</h1>}>
                            <h3>${config.tiers[tierName].price} per month</h3>
                        </ClickableCard>
                    </Col>
                );
            }
        }
        if (currentTier !== config.freeTierName) {
            jsx.push(
                <Col md="auto">
                    <ClickableCard onClick={executeQuery({path: "/stripeRoutes/customer-portal", onResponse: res => window.location.href = res.data.url})} className="w-25 h-25" header={<h1>Manage Subscription</h1>}>
                        
                    </ClickableCard>
                </Col>
            );
        }
        return jsx;
    }

    return (
        <Container>
            <Row className="justify-content-md-center">
                {tierCardsJsx()}
            </Row>
        </Container>
    );
}

export default Subscription;