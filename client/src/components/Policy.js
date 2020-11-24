import React from "react";
import {Route} from 'react-router-dom';
import config from "../config";

import Pdf from "./Pdf";

function Policy() {
    return [
        <Route exact path ="/PrivacyPolicy">
            <Pdf fileName={config.url + "/policy/privacy_policy.pdf"}/>
        </Route>,
        <Route exact path ="/TermsOfService">
            <Pdf fileName={config.url + "/policy/terms_of_service.pdf"}/>
        </Route>,
        <Route exact path ="/CookiePolicy">
            <Pdf fileName={config.url + "/policy/cookie_policy.pdf"}/>
        </Route>
    ];
}

export default Policy;