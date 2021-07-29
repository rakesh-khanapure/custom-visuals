import { combineReducers, createStore } from "@reduxjs/toolkit";

import {treatmentPlotReducer} from './treatment-plot/treatment-plot-reducer';

const rootReducer = combineReducers({
    treatmentPlotReducer
})

const store = createStore(rootReducer);

export default store;