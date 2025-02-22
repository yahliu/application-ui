/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import "./useradd";
import "./ansibleoperator";
import "./argocdoperator";
// import '@cypress/code-coverage/support'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Cookies.defaults({
  preserve: ["acm-access-token-cookie", "_oauth_proxy", "XSRF-TOKEN", "_csrf"]
});

before(() => {
  // Use given user to install ansible and argocd operator
  cy.ocLogin(Cypress.env("OC_CLUSTER_USER"));
  cy.installAnsibleOperator();
  if (Cypress.config().baseUrl.includes("localhost")) {
    cy.installArgoCDOperator();
  }
});

beforeEach(() => {
  if (Cypress.config().baseUrl.includes("localhost")) {
    cy.ocLogin("cluster-manager-admin");
    cy.exec("oc whoami -t").then(res => {
      cy.setCookie("acm-access-token-cookie", res.stdout);
      Cypress.env("token", res.stdout);
    });
  } else {
    cy.addUserIfNotCreatedBySuite();
    cy.logInAsRole("cluster-manager-admin");
    cy.acquireToken().then(token => {
      Cypress.env("token", token);
    });
  }
});

Cypress.on("uncaught:exception", (err, runnable) => {
  debugger;
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
