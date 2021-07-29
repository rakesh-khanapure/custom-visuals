interface TreatmentPlotState {
    plotData: {}
}

const initialState = {
    plotData: {}
}

type Action = {type: "DRAW_PLOT", payload:any}

export const treatmentPlotReducer = (state:TreatmentPlotState = initialState, action: Action) => {
    switch(action.type){
        case "DRAW_PLOT":
            return {...state, plotData: action.payload};
        default: 
            return state
    }
}
