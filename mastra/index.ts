import { Mastra } from '@mastra/core';
import { safetyAgent } from './agents/safety';
import { weatherAgent } from './agents/weather';
import { currencyAgent } from './agents/currency';
import { visaAgent } from './agents/visa';
import { eventsAgent } from './agents/events';
import { shoppingAgent } from './agents/shopping';
import { flightsAgent } from './agents/flights';
import { plannerAgent } from './agents/planner';
import { suggestionsAgent } from './agents/suggestions';
import { supervisorAgent } from './agents/supervisor';

export const mastra = new Mastra({
  agents: {
    safetyAgent,
    weatherAgent,
    currencyAgent,
    visaAgent,
    eventsAgent,
    shoppingAgent,
    flightsAgent,
    plannerAgent,
    suggestionsAgent,
    supervisor: supervisorAgent,
  },
});
